const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { generateLocalAIResponse } = require('./ai-service');

const sessions = new Map(); // Store active socket connections and status
const chatQueues = new Map();
const isProcessing = new Map();
const debounceTimers = new Map();
const pendingUnreadKeys = new Map();

const lidToPhoneMap = new Map();
const phoneToNameMap = new Map();

function getAuthDir() {
    const DATA_DIR = process.env.DATA_DIR || process.env.PERSISTENT_DIR || __dirname;
    const authDir = process.env.AUTH_DIR || path.join(DATA_DIR, 'auth_info');
    if (!fs.existsSync(authDir)) {
        try { fs.mkdirSync(authDir, { recursive: true }); } catch(e) {}
    }
    return authDir;
}

function loadLidMappingsFromDisk(sessionId) {
    try {
        const authDir = getAuthDir();
        if (!fs.existsSync(authDir)) return;

        const sessionDirs = sessionId 
            ? [path.join(authDir, `session_${sessionId}`)] 
            : fs.readdirSync(authDir).map(d => path.join(authDir, d));

        for (const sDir of sessionDirs) {
            if (fs.existsSync(sDir) && fs.statSync(sDir).isDirectory()) {
                const files = fs.readdirSync(sDir);
                for (const file of files) {
                    if (file.startsWith('lid-mapping-') && file.endsWith('_reverse.json')) {
                        const lid = file.replace('lid-mapping-', '').replace('_reverse.json', '');
                        try {
                            const content = JSON.parse(fs.readFileSync(path.join(sDir, file), 'utf-8'));
                            if (content && typeof content === 'string') {
                                lidToPhoneMap.set(lid, content);
                                lidToPhoneMap.set(lid + '@lid', content);
                            }
                        } catch(e) {}
                    }
                }
            }
        }
    } catch(e) {
        console.error('Error loading LID mappings from disk:', e);
    }
}

// Initial load across all existing auth directories
loadLidMappingsFromDisk();

function resolvePhoneNumber(sessionId, jid, msg = null) {
    if (!jid) return null;
    if (jid.endsWith('@s.whatsapp.net')) {
        return jid.split('@')[0];
    }
    const cleanJid = jid.split('@')[0];

    // 1. Check message properties if available
    if (msg) {
        if (msg.key?.remoteJidAlt && msg.key.remoteJidAlt.endsWith('@s.whatsapp.net')) {
            return msg.key.remoteJidAlt.split('@')[0];
        }
        if (msg.key?.participant && msg.key.participant.endsWith('@s.whatsapp.net')) {
            return msg.key.participant.split('@')[0];
        }
        if (msg.participant && msg.participant.endsWith('@s.whatsapp.net')) {
            return msg.participant.split('@')[0];
        }
    }

    // 2. Check in-memory map
    if (lidToPhoneMap.has(jid)) return lidToPhoneMap.get(jid);
    if (lidToPhoneMap.has(cleanJid)) return lidToPhoneMap.get(cleanJid);

    // 3. Try reading from disk
    loadLidMappingsFromDisk(sessionId);
    if (lidToPhoneMap.has(jid)) return lidToPhoneMap.get(jid);
    if (lidToPhoneMap.has(cleanJid)) return lidToPhoneMap.get(cleanJid);

    return null;
}

// Initialize a session
async function initSession(sessionId, getDbConnection, forceRecreate = false) {
    try {
        if (sessions.has(sessionId) && !forceRecreate) {
            return sessions.get(sessionId);
        }

        loadLidMappingsFromDisk(sessionId);

        // Set status to INIT
        sessions.set(sessionId, { status: 'INITIALIZING', sock: null, qr: null, phone: null });
    
        // Auth info directory
        const authDir = getAuthDir();
        const sessionAuthDir = path.join(authDir, `session_${sessionId}`);
        const { state, saveCreds } = await useMultiFileAuthState(sessionAuthDir);
        const { version } = await fetchLatestBaileysVersion();

        const logger = pino({ level: 'silent' }); // silent to prevent spam
        
        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            browser: Browsers.windows('Desktop'),
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            getMessage: async () => {
                return { conversation: 'Alidea Bot' }
            }
        });

        sessions.set(sessionId, { ...sessions.get(sessionId), sock });

        sock.ev.on('creds.update', saveCreds);

        // Contact and LID Mapping
        sock.ev.on('contacts.upsert', (contacts) => {
            for (const c of contacts) {
                if (c.id && c.lid) {
                    const phone = c.id.split('@')[0];
                    lidToPhoneMap.set(c.lid, phone);
                    lidToPhoneMap.set(c.lid.split('@')[0], phone);
                }
                if (c.id && (c.name || c.notify)) {
                    phoneToNameMap.set(c.id.split('@')[0], c.name || c.notify);
                }
            }
        });

        sock.ev.on('contacts.update', (updates) => {
            for (const c of updates) {
                if (c.id && c.lid) {
                    const phone = c.id.split('@')[0];
                    lidToPhoneMap.set(c.lid, phone);
                    lidToPhoneMap.set(c.lid.split('@')[0], phone);
                }
                if (c.id && (c.name || c.notify)) {
                    phoneToNameMap.set(c.id.split('@')[0], c.name || c.notify);
                }
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log(`[Alidea] QR generado para sesión ${sessionId}`);
                sessions.set(sessionId, { ...sessions.get(sessionId), status: 'QR_READY', qr });
                
                try {
                    const db = await getDbConnection();
                    await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['QR_READY', sessionId]);
                } catch(e) {}
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`[Alidea] Conexión cerrada para sesión ${sessionId}. Reconectando: ${shouldReconnect}`);
                
                try {
                    const db = await getDbConnection();
                    await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['DISCONNECTED', sessionId]);
                } catch(e) {}

                if (shouldReconnect) {
                    sessions.delete(sessionId);
                    setTimeout(() => {
                        initSession(sessionId, getDbConnection, false);
                    }, 3000);
                } else {
                    sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null, phone: null });
                    if (fs.existsSync(sessionAuthDir)) {
                        fs.rmSync(sessionAuthDir, { recursive: true, force: true });
                    }
                }
            } else if (connection === 'open') {
                const botPhoneNumber = sock.user?.id ? sock.user.id.split(':')[0] : null;
                console.log(`[Alidea] Sesión ${sessionId} CONECTADA exitosamente! Número: ${botPhoneNumber}`);
                sessions.set(sessionId, { status: 'CONNECTED', sock: sock, qr: null, phone: botPhoneNumber });
                
                try {
                    const db = await getDbConnection();
                    await db.run(
                        'UPDATE sessions SET status = ?, phone_number = ? WHERE id = ?',
                        ['CONNECTED', botPhoneNumber, sessionId]
                    );
                } catch(e) {}
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                if (m.type !== 'notify') return;
                const msg = m.messages[0];
                
                if (!msg.message || msg.key.fromMe) return;

                const extractText = (message) => {
                    if (!message) return '';
                    if (message.conversation) return message.conversation;
                    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
                    if (message.imageMessage?.caption) return message.imageMessage.caption;
                    if (message.videoMessage?.caption) return message.videoMessage.caption;
                    if (message.ephemeralMessage?.message) return extractText(message.ephemeralMessage.message);
                    if (message.viewOnceMessage?.message) return extractText(message.viewOnceMessage.message);
                    if (message.viewOnceMessageV2?.message) return extractText(message.viewOnceMessageV2.message);
                    if (message.documentWithCaptionMessage?.message?.documentMessage?.caption) return message.documentWithCaptionMessage.message.documentMessage.caption;
                    return '';
                };

                const messageText = extractText(msg.message);
                const jid = msg.key.remoteJid;
                if (!jid) return;

                // Ignore status broadcasts and groups
                if (jid === 'status@broadcast' || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) {
                    return;
                }

                console.log(`[Alidea Session ${sessionId}] Mensaje entrante de ${jid} (pushName: ${msg.pushName}): "${messageText}"`);

                // Extract real phone number or mapped phone
                let rawPhone = null;
                if (jid.endsWith('@s.whatsapp.net')) {
                    rawPhone = jid.split('@')[0];
                } else if (msg.key.remoteJidAlt && msg.key.remoteJidAlt.endsWith('@s.whatsapp.net')) {
                    rawPhone = msg.key.remoteJidAlt.split('@')[0];
                } else if (msg.key.participant && msg.key.participant.endsWith('@s.whatsapp.net')) {
                    rawPhone = msg.key.participant.split('@')[0];
                } else if (msg.participant && msg.participant.endsWith('@s.whatsapp.net')) {
                    rawPhone = msg.participant.split('@')[0];
                } else if (lidToPhoneMap.has(jid)) {
                    rawPhone = lidToPhoneMap.get(jid);
                } else if (lidToPhoneMap.has(jid.split('@')[0])) {
                    rawPhone = lidToPhoneMap.get(jid.split('@')[0]);
                }

                if (!rawPhone) {
                    rawPhone = jid.split('@')[0];
                }

                const formattedPhone = rawPhone.startsWith('+') ? rawPhone : ('+' + rawPhone.replace(/[^0-9]/g, ''));
                const senderName = msg.pushName || phoneToNameMap.get(rawPhone) || (jid.endsWith('@lid') ? `Cliente WhatsApp (${rawPhone.slice(-4)})` : `Contacto ${rawPhone.slice(-4)}`);

                // Capture lead into CRM and store in chat_messages
                try {
                    const db = await getDbConnection();
                    const sessionRecord = await db.get('SELECT user_id FROM sessions WHERE id = ?', [sessionId]);
                    if (sessionRecord && sessionRecord.user_id) {
                        const userId = sessionRecord.user_id;

                        const existingLead = await db.get(
                            'SELECT id, name FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ? OR phone = ?)',
                            [userId, formattedPhone, rawPhone, '+' + rawPhone]
                        );

                        let leadId;
                        if (existingLead) {
                            leadId = existingLead.id;
                            let leadName = existingLead.name;
                            if ((!leadName || leadName === 'Alidea Bot' || leadName.startsWith('Contacto ') || leadName.startsWith('Cliente WhatsApp')) && msg.pushName) {
                                leadName = msg.pushName;
                            }
                            await db.run(
                                `UPDATE crm_leads 
                                 SET name = ?, last_message = ?, last_interaction = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                                 WHERE id = ?`,
                                [leadName, messageText || '[Multimedia / Audio]', leadId]
                            );
                        } else {
                            leadId = uuidv4();
                            await db.run(
                                `INSERT INTO crm_leads 
                                 (id, user_id, name, phone, stage, deal_value, source, tags, notes, last_message)
                                 VALUES (?, ?, ?, ?, 'nuevo', 0, 'whatsapp', 'WhatsApp Lead', ?, ?)`,
                                [leadId, userId, senderName, formattedPhone, `Prospecto capturado automáticamente vía bot WhatsApp (JID: ${jid})`, messageText || '[Multimedia / Audio]']
                            );
                        }

                        // Log in CRM activities
                        await db.run(
                            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                             VALUES (?, ?, ?, 'whatsapp_in', ?)`,
                            [uuidv4(), leadId, userId, `Mensaje entrante de WhatsApp (${senderName}): "${messageText || '[Adjunto/Multimedia]'}"`]
                        );

                        // Store in chat_messages table for Live Chat Inbox
                        await db.run(
                            `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                             VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
                            [uuidv4(), userId, sessionId, jid, formattedPhone, senderName, messageText || '[Archivo multimedia / Nota de voz]']
                        );
                    }
                } catch (crmErr) {
                    console.error('Error auto-syncing lead / chat into CRM:', crmErr);
                }

                const queueKey = `${sessionId}_${jid}`;

                // Track unread message key for double blue check on all incoming messages
                const keyObj = {
                    remoteJid: msg.key.remoteJid,
                    id: msg.key.id,
                    participant: msg.key.participant || undefined,
                    fromMe: false
                };
                if (!pendingUnreadKeys.has(queueKey)) pendingUnreadKeys.set(queueKey, []);
                pendingUnreadKeys.get(queueKey).push(keyObj);

                if (!messageText) return;

                if (!chatQueues.has(queueKey)) chatQueues.set(queueKey, []);
                chatQueues.get(queueKey).push({ msg, messageText, sessionId });

                // If currently actively processing, the running loop will automatically drain newly arrived messages
                if (isProcessing.get(queueKey)) {
                    return;
                }

                // Debounce trigger (1800ms) to allow customers to finish sending rapid multi-line messages
                if (debounceTimers.has(queueKey)) {
                    clearTimeout(debounceTimers.get(queueKey));
                }

                debounceTimers.set(queueKey, setTimeout(() => {
                    debounceTimers.delete(queueKey);
                    if (!isProcessing.get(queueKey)) {
                        processQueue(queueKey, getDbConnection);
                    }
                }, 1800));

            } catch(error) {
                console.error(`Error processing message loop for session ${sessionId}:`, error);
            }
        });

        return sessions.get(sessionId);
    } catch(error) {
        console.error(`FATAL ERROR in initSession for ${sessionId}:`, error);
        sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null, phone: null });
        return null;
    }
}

function getSession(sessionId) {
    return sessions.get(sessionId);
}

function getAllSessions() {
    return Array.from(sessions.entries()).map(([id, data]) => ({
        id,
        status: data.status,
        qr: data.qr,
        phone: data.phone
    }));
}

async function logoutSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session && session.sock) {
        try {
            await session.sock.logout();
        } catch(e) {}
    }
    sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null, phone: null });
    
    const authDir = getAuthDir();
    const sessionAuthDir = path.join(authDir, `session_${sessionId}`);
    if (fs.existsSync(sessionAuthDir)) {
        fs.rmSync(sessionAuthDir, { recursive: true, force: true });
    }
}

// Send Manual Live Chat Message via connected WhatsApp Socket
async function sendManualMessage(sessionId, jid, text, getDbConnection) {
    const session = sessions.get(sessionId);
    let targetJid = jid;
    if (!targetJid.includes('@')) {
        targetJid = `${targetJid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    }

    if (session && session.sock && session.status === 'CONNECTED') {
        await session.sock.sendMessage(targetJid, { text });
    }

    // Always log to database
    try {
        const db = await getDbConnection();
        const sessionRecord = await db.get('SELECT user_id FROM sessions WHERE id = ?', [sessionId]);
        if (sessionRecord && sessionRecord.user_id) {
            const userId = sessionRecord.user_id;
            const phoneDigits = targetJid.split('@')[0];
            const formattedPhone = '+' + phoneDigits;

            await db.run(
                `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                 VALUES (?, ?, ?, ?, ?, 'Yo (Asesor)', 1, ?)`,
                [uuidv4(), userId, sessionId, targetJid, formattedPhone, text]
            );

            const lead = await db.get(
                'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ?)',
                [userId, formattedPhone, phoneDigits]
            );
            if (lead) {
                await db.run(
                    `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                     VALUES (?, ?, ?, 'whatsapp_out', ?)`,
                    [uuidv4(), lead.id, userId, `Mensaje enviado en vivo por asesor: "${text}"`]
                );
                await db.run(
                    'UPDATE crm_leads SET last_message = ?, last_interaction = CURRENT_TIMESTAMP WHERE id = ?',
                    [text, lead.id]
                );
            }
        }
    } catch(err) {
        console.error('Error logging manual message:', err);
    }

    return { success: true };
}

async function processQueue(queueKey, getDbConnection) {
    if (isProcessing.get(queueKey)) return;
    isProcessing.set(queueKey, true);

    try {
        while (chatQueues.has(queueKey) && chatQueues.get(queueKey).length > 0) {
            const queue = chatQueues.get(queueKey);
            // Drain all pending messages currently in the queue for this contact to handle burst messages together
            const batchItems = queue.splice(0, queue.length);
            if (batchItems.length === 0) break;

            const sessionId = batchItems[0].sessionId;
            const session = sessions.get(sessionId);
            if (!session || !session.sock || session.status !== 'CONNECTED') {
                continue;
            }
            const sock = session.sock;
            const lastItem = batchItems[batchItems.length - 1];
            const msg = lastItem.msg;
            const jid = msg.key.remoteJid;

            // Combine messages if multiple arrived in rapid succession
            const combinedMessageText = batchItems.map(item => item.messageText.trim()).filter(Boolean).join('\n');
            if (!combinedMessageText) continue;

            const messageText = combinedMessageText;

            // Helper to mark all accumulated unread messages from this contact with double blue check
            const markAllAsRead = async () => {
                const unreadKeys = pendingUnreadKeys.get(queueKey) || [];
                for (const item of batchItems) {
                    if (item.msg?.key) {
                        const k = {
                            remoteJid: item.msg.key.remoteJid,
                            id: item.msg.key.id,
                            participant: item.msg.key.participant || undefined,
                            fromMe: false
                        };
                        if (!unreadKeys.some(existing => existing.id === k.id)) {
                            unreadKeys.push(k);
                        }
                    }
                }
                if (unreadKeys.length > 0) {
                    try {
                        await sock.readMessages(unreadKeys);
                        console.log(`[Alidea Session ${sessionId}] ✓ ${unreadKeys.length} mensaje(s) marcado(s) como LEÍDO(s) (doble check azul) para ${jid}`);
                    } catch(e) {
                        console.warn(`[Alidea Session ${sessionId}] Error al marcar como leído:`, e.message);
                    }
                }
                pendingUnreadKeys.set(queueKey, []);
            };

            try {
                const db = await getDbConnection();
                const sessionRecord = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
                const keywords = await db.all('SELECT * FROM keywords WHERE session_id = ?', [sessionId]);

                const textLower = messageText.toLowerCase();
                let matched = false;

                // 1. Verificación automática de solicitud de catálogo de productos/servicios
                const isCatalogIntent = /(catalogo|cat[aá]logo|pedir cat[aá]logo|enviar cat[aá]logo|ver cat[aá]logo|productos|servicios|lista de precios|precios|menu|menú|carta)/i.test(messageText);
                let userProducts = [];
                let userRecord = null;

                if (sessionRecord && sessionRecord.user_id) {
                    try {
                        userProducts = await db.all('SELECT * FROM products WHERE user_id = ? AND in_stock = 1 ORDER BY category, name ASC', [sessionRecord.user_id]);
                        userRecord = await db.get('SELECT business_name, currency_symbol, currency_code FROM users WHERE id = ?', [sessionRecord.user_id]);
                    } catch(e) {}
                }

                if (isCatalogIntent && userProducts && userProducts.length > 0) {
                    const sym = userRecord?.currency_symbol || 'S/';
                    const bName = userRecord?.business_name ? `*${userRecord.business_name}*\n` : '';

                    let catalogText = `📁 ${bName}*CATÁLOGO DE PRODUCTOS & SERVICIOS*\n\n`;
                    const categories = {};
                    for (const p of userProducts) {
                        const cat = (p.category || 'General').trim();
                        if (!categories[cat]) categories[cat] = [];
                        categories[cat].push(p);
                    }

                    const catKeys = Object.keys(categories);
                    for (const catName of catKeys) {
                        if (catKeys.length > 1 || catName.toLowerCase() !== 'general') {
                            catText += `📂 *${catName.toUpperCase()}*\n`;
                        }
                        categories[catName].forEach((p) => {
                            catText += `• *${p.name}* ➔ *${sym} ${Number(p.price || 0).toFixed(2)}*\n`;
                            if (p.description && p.description.trim()) {
                                catText += `  _${p.description.trim()}_\n`;
                            }
                        });
                        catText += `\n`;
                    }
                    catalogText += `💬 _¿Deseas cotizar o realizar un pedido de alguno de estos productos? Indícanos con toda confianza._`;

                    // Verificar si existe una palabra clave configurada con archivos adjuntos
                    let matchedCatalogKw = null;
                    for (const kw of keywords) {
                        const matchKeywords = kw.keyword.toLowerCase().split(',').map(k => k.trim());
                        if (matchKeywords.some(mk => mk !== '' && textLower.includes(mk))) {
                            matchedCatalogKw = kw;
                            break;
                        }
                    }

                    // Marcar mensajes entrantes como leídos
                    const waitToReadDelay = (1.0 + Math.random() * 1.0) * 1000;
                    await delay(waitToReadDelay);
                    await markAllAsRead();
                    await delay(300 + Math.random() * 400);

                    // Simular escritura
                    try { await sock.sendPresenceUpdate('composing', jid); } catch(e) {}
                    const typingDelay = Math.min(3000, Math.max(800, catalogText.length * 15));
                    await delay(typingDelay);
                    try { await sock.sendPresenceUpdate('paused', jid); } catch(e) {}

                    await sock.sendMessage(jid, { text: catalogText }, { quoted: msg });
                    console.log(`[Alidea Session ${sessionId}] Catálogo automático enviado a ${jid}`);

                    // Registrar en historial de chat
                    try {
                        await db.run(
                            `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                             VALUES (?, ?, ?, ?, ?, 'Alidea Bot', 1, ?)`,
                            [uuidv4(), sessionRecord.user_id, sessionId, jid, '+' + jid.split('@')[0], catalogText]
                        );
                    } catch(e) {}

                    // Si la regla de palabra clave tiene archivos multimedia adjuntos (PDF, fotos), enviarlos a continuación
                    if (matchedCatalogKw) {
                        let mediaFiles = [];
                        if (matchedCatalogKw.media_files) {
                            try { mediaFiles = JSON.parse(matchedCatalogKw.media_files); } catch(e) {}
                        }
                        if (mediaFiles.length === 0 && matchedCatalogKw.media_path && fs.existsSync(matchedCatalogKw.media_path)) {
                            mediaFiles.push({ path: matchedCatalogKw.media_path, type: matchedCatalogKw.media_type, name: path.basename(matchedCatalogKw.media_path) });
                        }
                        if (mediaFiles.length > 0) {
                            for (const file of mediaFiles) {
                                if (fs.existsSync(file.path)) {
                                    await delay(2000);
                                    const mediaUrl = file.path;
                                    const fileType = file.type || '';
                                    if (fileType.startsWith('image/')) {
                                        await sock.sendMessage(jid, { image: { url: mediaUrl } });
                                    } else if (fileType.startsWith('audio/')) {
                                        await sock.sendMessage(jid, { audio: { url: mediaUrl }, ptt: true });
                                    } else if (fileType.startsWith('video/')) {
                                        await sock.sendMessage(jid, { video: { url: mediaUrl } });
                                    } else {
                                        await sock.sendMessage(jid, { document: { url: mediaUrl }, fileName: file.name || path.basename(mediaUrl) });
                                    }
                                }
                            }
                        }
                    }

                    // Actualizar etapa en el CRM y registrar actividad
                    try {
                        const phoneDigits = jid.split('@')[0];
                        const lead = await db.get(
                            'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ?)',
                            [sessionRecord.user_id, '+' + phoneDigits, phoneDigits]
                        );
                        if (lead) {
                            await db.run(
                                `UPDATE crm_leads SET stage = 'propuesta', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stage IN ('nuevo', 'contactado')`,
                                [lead.id]
                            );
                            await db.run(
                                `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                                 VALUES (?, ?, ?, 'whatsapp_out', 'Catálogo de productos enviado automáticamente')`,
                                [uuidv4(), lead.id, sessionRecord.user_id]
                            );
                        }
                    } catch(e) {}

                    matched = true;
                }

                if (!matched) {
                    for (const kw of keywords) {
                        const matchKeywords = kw.keyword.toLowerCase().split(',').map(k => k.trim());
                        const hasMatch = matchKeywords.some(mk => mk !== '' && textLower.includes(mk));

                        if (hasMatch) {
                            matched = true;
                        // Extract all text messages (multi-message support)
                        let textMessages = [];
                        if (kw.response_messages) {
                            try {
                                const parsed = JSON.parse(kw.response_messages);
                                if (Array.isArray(parsed)) {
                                    textMessages = parsed.map(m => typeof m === 'string' ? m.trim() : (m.text ? m.text.trim() : '')).filter(Boolean);
                                }
                            } catch(e) {
                                console.error(`Error parsing response_messages for keyword ${kw.id}:`, e);
                            }
                        }
                        if (textMessages.length === 0 && kw.response_text && kw.response_text.trim()) {
                            textMessages = [kw.response_text.trim()];
                        }

                        const minSec = kw.delay_min || 2;
                        const maxSec = kw.delay_max || 6;

                        // Mark all unread incoming messages as read (blue checks)
                        const waitToReadDelay = (1.2 + Math.random() * 1.2) * 1000;
                        await delay(waitToReadDelay);
                        await markAllAsRead();
                        await delay(400 + Math.random() * 500);

                        // Send each text message sequentially with typing simulation
                        for (let msgIdx = 0; msgIdx < textMessages.length; msgIdx++) {
                            const currentText = textMessages[msgIdx];

                            if (msgIdx > 0) {
                                const betweenDelayMs = (minSec + Math.random() * (maxSec - minSec)) * 1000;
                                await delay(betweenDelayMs);
                            }

                            try { await sock.sendPresenceUpdate('composing', jid); } catch(e) {}

                            const typingDelay = Math.min(3000, Math.max(600, currentText.length * 22));
                            const randomDelaySec = msgIdx === 0 ? (minSec + Math.random() * (maxSec - minSec)) : 0.5;
                            const totalDelayMs = (randomDelaySec * 1000) + typingDelay;

                            console.log(`[Alidea Session ${sessionId}] Enviando mensaje ${msgIdx + 1}/${textMessages.length} a ${jid} en ${Math.round(totalDelayMs)}ms`);
                            await delay(totalDelayMs);

                            try { await sock.sendPresenceUpdate('paused', jid); } catch(e) {}

                            await sock.sendMessage(jid, { text: currentText }, msgIdx === 0 ? { quoted: msg } : {});
                            console.log(`[Alidea Session ${sessionId}] Mensaje ${msgIdx + 1}/${textMessages.length} enviado a ${jid}`);

                            // Log to chat_messages
                            try {
                                const sessionRecord = await db.get('SELECT user_id FROM sessions WHERE id = ?', [sessionId]);
                                if (sessionRecord) {
                                    await db.run(
                                        `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                                         VALUES (?, ?, ?, ?, ?, 'Alidea Bot', 1, ?)`,
                                        [uuidv4(), sessionRecord.user_id, sessionId, jid, '+' + jid.split('@')[0], currentText]
                                    );
                                }
                            } catch(e) {}
                        }

                        // Parse media files list
                        let mediaFiles = [];
                        if (kw.media_files) {
                            try {
                                mediaFiles = JSON.parse(kw.media_files);
                            } catch (e) {
                                console.error(`Error parsing media_files JSON for keyword ${kw.id}:`, e);
                            }
                        }

                        if (mediaFiles.length === 0 && kw.media_path && fs.existsSync(kw.media_path)) {
                            mediaFiles.push({
                                path: kw.media_path,
                                type: kw.media_type,
                                name: path.basename(kw.media_path)
                            });
                        }

                        // Send media files sequentially
                        if (mediaFiles.length > 0) {
                            const mediaMinSec = kw.media_delay_min !== null && kw.media_delay_min !== undefined ? kw.media_delay_min : 2;
                            const mediaMaxSec = kw.media_delay_max !== null && kw.media_delay_max !== undefined ? kw.media_delay_max : 5;

                            let isFirstMedia = true;
                            for (const file of mediaFiles) {
                                if (fs.existsSync(file.path)) {
                                    if (kw.response_text || !isFirstMedia) {
                                        const randomMediaDelaySec = mediaMinSec + Math.random() * (mediaMaxSec - mediaMinSec);
                                        await delay(randomMediaDelaySec * 1000);
                                    }
                                    isFirstMedia = false;

                                    const mediaUrl = file.path;
                                    const fileType = file.type || '';

                                    if (fileType.startsWith('image/')) {
                                        await sock.sendMessage(jid, { image: { url: mediaUrl } }, { quoted: msg });
                                    } else if (fileType.startsWith('audio/')) {
                                        await sock.sendMessage(jid, { audio: { url: mediaUrl }, ptt: true }, { quoted: msg });
                                    } else if (fileType.startsWith('video/')) {
                                        await sock.sendMessage(jid, { video: { url: mediaUrl } }, { quoted: msg });
                                    } else {
                                        await sock.sendMessage(jid, { document: { url: mediaUrl }, fileName: file.name || path.basename(mediaUrl) }, { quoted: msg });
                                    }
                                    console.log(`[Alidea Session ${sessionId}] Archivo ${file.name} enviado a ${jid}`);
                                }
                            }
                        }

                        // Log CRM activity for bot response
                        try {
                            const sessionRecord = await db.get('SELECT user_id FROM sessions WHERE id = ?', [sessionId]);
                            if (sessionRecord && sessionRecord.user_id) {
                                const phoneDigits = jid.split('@')[0];
                                const lead = await db.get(
                                    'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ?)',
                                    [sessionRecord.user_id, '+' + phoneDigits, phoneDigits]
                                );
                                if (lead) {
                                    await db.run(
                                        `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                                         VALUES (?, ?, ?, 'whatsapp_out', ?)`,
                                        [uuidv4(), lead.id, sessionRecord.user_id, `Respuesta automática enviada para palabra clave "${kw.keyword}"`]
                                    );
                                }
                            }
                        } catch(e) {}

                        await delay(1000 + Math.random() * 1500);
                        break;
                    }
                }

                if (!matched) {
                    try {
                        const sessionRecord = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
                        const isAiActive = sessionRecord && (sessionRecord.ai_enabled === 1 || sessionRecord.ai_enabled === true || sessionRecord.ai_enabled === '1');
                        
                        if (isAiActive && sessionRecord.ai_system_prompt && sessionRecord.ai_system_prompt.trim()) {
                            console.log(`[Alidea Session ${sessionId}] Evaluando consulta en tiempo real con Alidea Genesis AI™: "${messageText}" para ${jid}`);

                            // 1. Control Inteligente de Saludo: Saludar solo 1 vez al día o si el cliente saludó
                            const customerTextLower = messageText.toLowerCase();
                            const hasCustomerGreeting = /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey|que tal|q tal|saludos|hi|hello)\b/i.test(messageText.trim()) || customerTextLower.includes('hola') || customerTextLower.includes('buenos dias') || customerTextLower.includes('buenas tardes');

                            const todayStart = new Date();
                            todayStart.setHours(0, 0, 0, 0);
                            let prevAiMsgToday = null;
                            try {
                                prevAiMsgToday = await db.get(
                                    'SELECT id FROM chat_messages WHERE session_id = ? AND jid = ? AND from_me = 1 AND created_at >= ? LIMIT 1',
                                    [sessionId, jid, todayStart.toISOString()]
                                );
                            } catch(e) {}
                            const allowGreeting = hasCustomerGreeting || !prevAiMsgToday;

                            // 2. Cargar contexto de conversación (turnos previos del chat)
                            let conversationHistory = [];
                            try {
                                const historyRows = await db.all(
                                    `SELECT from_me, text FROM chat_messages 
                                     WHERE session_id = ? AND jid = ? 
                                     ORDER BY created_at DESC 
                                     LIMIT 15`,
                                    [sessionId, jid]
                                );
                                const chronological = (historyRows || []).reverse();
                                const batchCount = batchItems.length;
                                const previousOnly = chronological.slice(0, Math.max(0, chronological.length - batchCount));
                                conversationHistory = previousOnly.map(row => ({
                                    role: row.from_me ? 'assistant' : 'user',
                                    content: row.text
                                }));
                                console.log(`[Alidea Session ${sessionId}] Contexto conversacional recuperado: ${conversationHistory.length} turnos previos para ${jid}`);
                            } catch(histErr) {
                                console.warn(`[Alidea Session ${sessionId}] Error al recuperar historial de chat:`, histErr.message);
                            }

                            // IMPORTANTE: NO mostrar 'escribiendo...' antes de evaluar ni marcar como leído.
                            // La IA evalúa en segundo plano con su historial completo y catálogo actualizado de productos.
                            let effectiveSystemPrompt = sessionRecord.ai_system_prompt;
                            if (userProducts && userProducts.length > 0 && !effectiveSystemPrompt.includes('[CATÁLOGO DE PRODUCTOS')) {
                                const sym = userRecord?.currency_symbol || 'S/';
                                const code = userRecord?.currency_code || 'PEN';
                                effectiveSystemPrompt += `\n\n[CATÁLOGO DE PRODUCTOS DISPONIBLES (Moneda: ${code}, Símbolo: ${sym})]:\n` + userProducts.map(p => `- ${p.name}: ${sym} ${Number(p.price || 0).toFixed(2)} (${p.description || ''})`).join('\n');
                            }

                            const aiRes = await generateLocalAIResponse({
                                sessionId: sessionId,
                                prompt: messageText,
                                systemPrompt: effectiveSystemPrompt,
                                conversationHistory: conversationHistory,
                                endpoint: sessionRecord.ai_endpoint || 'http://127.0.0.1:11434',
                                temperature: sessionRecord.ai_temperature || 0.35,
                                allowGreeting: allowGreeting
                            });

                            if (aiRes && aiRes.success && aiRes.shouldAnswer && aiRes.messages && aiRes.messages.length > 0) {
                                // SÍ respondió con certeza: Marcamos TODOS los mensajes entrantes como LEÍDOS en WhatsApp (Doble check azul)
                                await markAllAsRead();

                                const minDelaySec = sessionRecord.ai_delay_min !== null && sessionRecord.ai_delay_min !== undefined ? sessionRecord.ai_delay_min : 2;
                                const maxDelaySec = sessionRecord.ai_delay_max !== null && sessionRecord.ai_delay_max !== undefined ? Math.max(minDelaySec, sessionRecord.ai_delay_max) : 5;

                                for (let mIdx = 0; mIdx < aiRes.messages.length; mIdx++) {
                                    const msgItem = aiRes.messages[mIdx];
                                    
                                    // Simular presencia "escribiendo..." únicamente tras tener la respuesta lista y durante el delay aleatorio configurado
                                    try { await sock.sendPresenceUpdate('composing', jid); } catch(e) {}
                                    
                                    const randomDelayMs = (minDelaySec + Math.random() * (maxDelaySec - minDelaySec)) * 1000;
                                    console.log(`[Alidea Session ${sessionId}] Escribiendo respuesta IA (${mIdx + 1}/${aiRes.messages.length}) durante ${Math.round(randomDelayMs)}ms para ${jid}`);
                                    await delay(randomDelayMs);
                                    
                                    try { await sock.sendPresenceUpdate('paused', jid); } catch(e) {}

                                    try {
                                        await sock.sendMessage(jid, { text: msgItem }, mIdx === 0 ? { quoted: msg } : {});
                                    } catch (sendErr) {
                                        console.warn(`[Alidea Session ${sessionId}] Error al enviar con quoted, reintentando directo:`, sendErr.message);
                                        await sock.sendMessage(jid, { text: msgItem });
                                    }

                                    // Registrar en chat_messages
                                    if (sessionRecord.user_id) {
                                        await db.run(
                                            `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                                             VALUES (?, ?, ?, ?, ?, 'Alidea AI', 1, ?)`,
                                            [uuidv4(), sessionRecord.user_id, sessionId, jid, '+' + jid.split('@')[0], msgItem]
                                        );
                                    }
                                }

                                // Actualizar contador acumulado de tokens consumidos por el usuario (solo visible para admin)
                                if (sessionRecord.user_id && aiRes.totalTokens > 0) {
                                    try {
                                        await db.run(
                                            'UPDATE users SET total_tokens_used = COALESCE(total_tokens_used, 0) + ? WHERE id = ?',
                                            [aiRes.totalTokens, sessionRecord.user_id]
                                        );
                                    } catch(tokErr) {}
                                }

                                // Registrar en CRM
                                if (sessionRecord.user_id) {
                                    const phoneDigits = jid.split('@')[0];
                                    const fullAiText = aiRes.messages.join(' \n\n ');
                                    const lead = await db.get(
                                        'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ?)',
                                        [sessionRecord.user_id, '+' + phoneDigits, phoneDigits]
                                    );
                                    if (lead) {
                                        await db.run(
                                            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                                             VALUES (?, ?, ?, 'whatsapp_out', ?)`,
                                            [uuidv4(), lead.id, sessionRecord.user_id, `Respuesta Alidea AI: "${fullAiText.slice(0, 90)}..."`]
                                        );
                                        await db.run(
                                            'UPDATE crm_leads SET last_message = ?, last_interaction = CURRENT_TIMESTAMP WHERE id = ?',
                                            [fullAiText, lead.id]
                                        );
                                    }
                                }
                                console.log(`[Alidea Session ${sessionId}] Respuesta enviada a WhatsApp con éxito (${aiRes.messages.length} msgs)`);
                            } else {
                                // NO respondió (fuera de contexto o sin certeza):
                                // NUNCA marcamos como leído. Se queda intacto como NO LEÍDO en WhatsApp para que un humano lo atienda.
                                console.log(`[Alidea Session ${sessionId}] Consulta sin certeza o fuera de contexto. Dejando mensaje NO LEÍDO para atención humana.`);
                                if (sessionRecord.user_id) {
                                    const phoneDigits = jid.split('@')[0];
                                    const lead = await db.get(
                                        'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ?)',
                                        [sessionRecord.user_id, '+' + phoneDigits, phoneDigits]
                                    );
                                    if (lead) {
                                        await db.run(
                                            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                                             VALUES (?, ?, ?, 'note', ?)`,
                                            [uuidv4(), lead.id, sessionRecord.user_id, `Consulta para asesor humano (chat no leído): "${messageText}"`]
                                        );
                                    }
                                }
                            }
                        }
                    } catch(aiErr) {
                        console.error(`[Alidea Session ${sessionId}] Error al procesar Asesor IA:`, aiErr);
                    }
                    await delay(300);
                }
            } catch (err) {
                console.error(`Error in queue processor for ${queueKey}:`, err);
            }
        }
    } finally {
        isProcessing.set(queueKey, false);
    }
}

const activeCampaigns = new Map();

function getRetargetingStatus(campaignId) {
    return activeCampaigns.get(campaignId) || null;
}

function stopRetargetingCampaign(campaignId) {
    if (activeCampaigns.has(campaignId)) {
        activeCampaigns.get(campaignId).shouldStop = true;
        activeCampaigns.get(campaignId).status = 'stopped';
        return true;
    }
    return false;
}

async function runRetargetingCampaign({
    campaignId,
    userId,
    sessionId,
    recipients,
    messages,
    mediaFiles = [],
    batchSize = 5,
    msgDelayMin = 3,
    msgDelayMax = 6,
    batchDelaySeconds = 30,
    getDbConnection
}) {
    const totalRecipients = recipients.length;
    const batchSizeNum = Math.max(1, parseInt(batchSize, 10) || 5);
    const totalBlocks = Math.ceil(totalRecipients / batchSizeNum);

    const campaignState = {
        campaignId,
        sessionId,
        status: 'running',
        total: totalRecipients,
        sent: 0,
        failed: 0,
        currentBlock: 1,
        totalBlocks,
        currentRecipient: null,
        shouldStop: false,
        logs: [],
        startedAt: new Date().toISOString()
    };
    activeCampaigns.set(campaignId, campaignState);

    // Execute in background
    (async () => {
        try {
            const db = await getDbConnection();
            const session = sessions.get(sessionId);

            if (!session || !session.sock || session.status !== 'CONNECTED') {
                campaignState.status = 'failed';
                campaignState.logs.push({
                    type: 'error',
                    time: new Date().toLocaleTimeString(),
                    text: 'Error: El bot de WhatsApp no se encuentra conectado.'
                });
                try {
                    await db.run(
                        'UPDATE retargeting_campaigns SET status = ?, logs_json = ? WHERE id = ?',
                        ['failed', JSON.stringify(campaignState.logs), campaignId]
                    );
                } catch(e) {}
                return;
            }

            const sock = session.sock;

            campaignState.logs.push({
                type: 'info',
                time: new Date().toLocaleTimeString(),
                text: `Iniciando campaña de retargeting para ${totalRecipients} contactos en ${totalBlocks} bloques (tamaño de bloque: ${batchSizeNum}).`
            });

            // Iterate in blocks
            for (let b = 0; b < totalBlocks; b++) {
                if (campaignState.shouldStop) {
                    campaignState.status = 'stopped';
                    campaignState.logs.push({
                        type: 'warning',
                        time: new Date().toLocaleTimeString(),
                        text: 'Campaña detenida por el usuario.'
                    });
                    break;
                }

                campaignState.currentBlock = b + 1;
                const blockRecipients = recipients.slice(b * batchSizeNum, (b + 1) * batchSizeNum);

                campaignState.logs.push({
                    type: 'info',
                    time: new Date().toLocaleTimeString(),
                    text: `--- Procesando Bloque ${b + 1} de ${totalBlocks} (${blockRecipients.length} contactos) ---`
                });

                for (let rIdx = 0; rIdx < blockRecipients.length; rIdx++) {
                    if (campaignState.shouldStop) break;

                    const recipient = blockRecipients[rIdx];
                    campaignState.currentRecipient = recipient.name || recipient.phone;

                    let jid = recipient.jid;
                    if (!jid || !jid.includes('@')) {
                        const digits = recipient.phone.replace(/[^0-9]/g, '');
                        jid = `${digits}@s.whatsapp.net`;
                    }

                    try {
                        // 1. Send all sequential text messages
                        for (let mIdx = 0; mIdx < messages.length; mIdx++) {
                            const rawText = messages[mIdx];
                            const personalizedText = rawText.replace(/{nombre}/gi, recipient.name || 'Cliente');

                            // Typing presence
                            try { await sock.sendPresenceUpdate('composing', jid); } catch(e) {}
                            
                            const minSec = Math.max(1, parseInt(msgDelayMin, 10) || 3);
                            const maxSec = Math.max(minSec, parseInt(msgDelayMax, 10) || 6);
                            const delayMs = (minSec + Math.random() * (maxSec - minSec)) * 1000;
                            await delay(delayMs);

                            try { await sock.sendPresenceUpdate('paused', jid); } catch(e) {}

                            await sock.sendMessage(jid, { text: personalizedText });

                            // Log message in DB
                            try {
                                const formattedPhone = recipient.phone.startsWith('+') ? recipient.phone : ('+' + recipient.phone.replace(/[^0-9]/g, ''));
                                await db.run(
                                    `INSERT INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
                                     VALUES (?, ?, ?, ?, ?, 'Campaña Retargeting', 1, ?)`,
                                    [uuidv4(), userId, sessionId, jid, formattedPhone, personalizedText]
                                );
                            } catch(e) {}
                        }

                        // 2. Send media files
                        for (let fIdx = 0; fIdx < mediaFiles.length; fIdx++) {
                            const file = mediaFiles[fIdx];
                            if (fs.existsSync(file.path)) {
                                const minSec = Math.max(1, parseInt(msgDelayMin, 10) || 2);
                                const maxSec = Math.max(minSec, parseInt(msgDelayMax, 10) || 5);
                                const mediaDelayMs = (minSec + Math.random() * (maxSec - minSec)) * 1000;
                                await delay(mediaDelayMs);

                                const fileType = file.type || '';
                                if (fileType.startsWith('image/')) {
                                    await sock.sendMessage(jid, { image: { url: file.path } });
                                } else if (fileType.startsWith('audio/')) {
                                    await sock.sendMessage(jid, { audio: { url: file.path }, ptt: true });
                                } else if (fileType.startsWith('video/')) {
                                    await sock.sendMessage(jid, { video: { url: file.path } });
                                } else {
                                    await sock.sendMessage(jid, { document: { url: file.path }, fileName: file.name || path.basename(file.path) });
                                }
                            }
                        }

                        // Log CRM Activity
                        if (recipient.id) {
                            try {
                                await db.run(
                                    `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                                     VALUES (?, ?, ?, 'retargeting', ?)`,
                                    [uuidv4(), recipient.id, userId, `Mensaje de retargeting enviado con éxito`]
                                );
                                await db.run(
                                    'UPDATE crm_leads SET last_interaction = CURRENT_TIMESTAMP WHERE id = ?',
                                    [recipient.id]
                                );
                            } catch(e) {}
                        }

                        campaignState.sent++;
                        campaignState.logs.push({
                            type: 'success',
                            time: new Date().toLocaleTimeString(),
                            text: `✓ Enviado a ${recipient.name} (${recipient.phone})`
                        });

                    } catch(sendErr) {
                        console.error(`Error sending retargeting to ${recipient.phone}:`, sendErr);
                        campaignState.failed++;
                        campaignState.logs.push({
                            type: 'error',
                            time: new Date().toLocaleTimeString(),
                            text: `✕ Falló envío a ${recipient.name} (${recipient.phone}): ${sendErr.message}`
                        });
                    }

                    // Small pause between recipients in the same block
                    if (rIdx < blockRecipients.length - 1 && !campaignState.shouldStop) {
                        await delay(1500 + Math.random() * 1500);
                    }
                }

                // Update DB progress
                try {
                    await db.run(
                        'UPDATE retargeting_campaigns SET sent_count = ?, failed_count = ?, logs_json = ? WHERE id = ?',
                        [campaignState.sent, campaignState.failed, JSON.stringify(campaignState.logs), campaignId]
                    );
                } catch(e) {}

                // Delay between blocks (anti-blocking safety pause)
                if (b < totalBlocks - 1 && !campaignState.shouldStop) {
                    const blockSec = parseInt(batchDelaySeconds, 10) || 30;
                    campaignState.logs.push({
                        type: 'info',
                        time: new Date().toLocaleTimeString(),
                        text: `⏳ Pausa de seguridad anti-bloqueo: esperando ${blockSec}s antes del bloque ${b + 2}...`
                    });
                    await delay(blockSec * 1000);
                }
            }

            if (!campaignState.shouldStop) {
                campaignState.status = 'completed';
                campaignState.logs.push({
                    type: 'success',
                    time: new Date().toLocaleTimeString(),
                    text: `🎉 Campaña completada: ${campaignState.sent} enviados con éxito, ${campaignState.failed} fallidos.`
                });
            }

            try {
                await db.run(
                    'UPDATE retargeting_campaigns SET status = ?, sent_count = ?, failed_count = ?, logs_json = ? WHERE id = ?',
                    [campaignState.status, campaignState.sent, campaignState.failed, JSON.stringify(campaignState.logs), campaignId]
                );
            } catch(e) {}

        } catch(fatalErr) {
            console.error('Fatal error in retargeting campaign:', fatalErr);
            campaignState.status = 'failed';
            campaignState.logs.push({
                type: 'error',
                time: new Date().toLocaleTimeString(),
                text: `Error fatal en campaña: ${fatalErr.message}`
            });
        }
    })();

    return campaignState;
}

module.exports = {
    initSession,
    getSession,
    getAllSessions,
    logoutSession,
    sendManualMessage,
    resolvePhoneNumber,
    loadLidMappingsFromDisk,
    runRetargetingCampaign,
    getRetargetingStatus,
    stopRetargetingCampaign
};
