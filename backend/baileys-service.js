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

const sessions = new Map(); // Store active socket connections and status
const chatQueues = new Map();
const isProcessing = new Map();

// Initialize a session
async function initSession(sessionId, getDbConnection, forceRecreate = false) {
    try {
        if (sessions.has(sessionId) && !forceRecreate) {
            return sessions.get(sessionId);
        }

        // Set status to INIT
        sessions.set(sessionId, { status: 'INITIALIZING', sock: null, qr: null });
    
    // Auth info directory
    const authDir = process.env.AUTH_DIR || path.join(__dirname, 'auth_info');
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
    
    const sessionAuthDir = path.join(authDir, `session_${sessionId}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionAuthDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' }); // silent to prevent spam
    
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        // User-Agent persistence strategy
        browser: Browsers.windows('Desktop'),
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return { conversation: 'hello' }
        }
    });

    sessions.set(sessionId, { ...sessions.get(sessionId), sock });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(`QR Code generated for session ${sessionId}`);
            sessions.set(sessionId, { ...sessions.get(sessionId), status: 'QR_READY', qr });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`Connection closed for session ${sessionId}. Reconnecting: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                // Ensure the previous socket doesn't block re-init loop
                sessions.delete(sessionId);
                initSession(sessionId, getDbConnection, false);
            } else {
                sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null });
                fs.rmSync(sessionAuthDir, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(`Session ${sessionId} opened!`);
            sessions.set(sessionId, { status: 'CONNECTED', sock: sock, qr: null });
            
            const db = await getDbConnection();
            await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['CONNECTED', sessionId]);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            if (m.type !== 'notify') return;
            const msg = m.messages[0];
            
            if (!msg.message || msg.key.fromMe) return;

        const db = await getDbConnection();
        const keywords = await db.all('SELECT * FROM keywords WHERE session_id = ?', [sessionId]);
        
        // Deep text extractor for various Baileys message types
        const extractText = (message) => {
            if (!message) return '';
            if (message.conversation) return message.conversation;
            if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
            if (message.imageMessage?.caption) return message.imageMessage.caption;
            if (message.videoMessage?.caption) return message.videoMessage.caption;
            
            // Check for wrappers (like disappearing messages, or view once)
            if (message.ephemeralMessage?.message) return extractText(message.ephemeralMessage.message);
            if (message.viewOnceMessage?.message) return extractText(message.viewOnceMessage.message);
            if (message.viewOnceMessageV2?.message) return extractText(message.viewOnceMessageV2.message);
            if (message.documentWithCaptionMessage?.message?.documentMessage?.caption) return message.documentWithCaptionMessage.message.documentMessage.caption;
            
            return '';
        };

        const messageText = extractText(msg.message);
        
        console.log(`[Session ${sessionId}] Incoming from ${msg.key.remoteJid}: "${messageText}"`);

        if (!messageText) return;

        const jid = msg.key.remoteJid;
        const queueKey = `${sessionId}_${jid}`;

        if (!chatQueues.has(queueKey)) chatQueues.set(queueKey, []);
        chatQueues.get(queueKey).push({ msg, messageText, sessionId });

        if (!isProcessing.get(queueKey)) {
            processQueue(queueKey, getDbConnection);
        }

        } catch(error) {
            console.error(`Error processing message loop for session ${sessionId}:`, error);
        }
    });

    return sessions.get(sessionId);
    } catch(error) {
        console.error(`FATAL ERROR in initSession for ${sessionId}:`, error);
        sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null });
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
        qr: data.qr
    }));
}

module.exports = {
    initSession,
    getSession,
    getAllSessions,
    logoutSession
};

async function logoutSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session && session.sock) {
        try {
            await session.sock.logout();
        } catch(e) {}
    }
    sessions.set(sessionId, { status: 'DISCONNECTED', sock: null, qr: null });
    
    const authDir = process.env.AUTH_DIR || path.join(__dirname, 'auth_info');
    const sessionAuthDir = path.join(authDir, `session_${sessionId}`);
    if (fs.existsSync(sessionAuthDir)) {
        fs.rmSync(sessionAuthDir, { recursive: true, force: true });
    }
}

async function processQueue(queueKey, getDbConnection) {
    isProcessing.set(queueKey, true);

    while (chatQueues.has(queueKey) && chatQueues.get(queueKey).length > 0) {
        const queue = chatQueues.get(queueKey);
        const { msg, messageText, sessionId } = queue.shift();

        // Get fresh socket to prevent using a dead one if it reconnected while queued
        const session = sessions.get(sessionId);
        if (!session || !session.sock || session.status !== 'CONNECTED') {
            continue; // Skip processing if disconnected
        }
        const sock = session.sock;
        const jid = msg.key.remoteJid;

        try {
            const db = await getDbConnection();
            const keywords = await db.all('SELECT * FROM keywords WHERE session_id = ?', [sessionId]);

            const textLower = messageText.toLowerCase();
            let matched = false;

            for (const kw of keywords) {
                const matchKeywords = kw.keyword.toLowerCase().split(',').map(k => k.trim());
                const hasMatch = matchKeywords.some(mk => mk !== '' && textLower.includes(mk));

                if (hasMatch) {
                    matched = true;
                    // Wait to pretend we just grabbed the phone
                    const waitToReadDelay = (2 + Math.random() * 3) * 1000;
                    await delay(waitToReadDelay);

                    try { await sock.readMessages([msg.key]); } catch(e) {}
                    await delay(800 + Math.random() * 1000);
                    
                    try { await sock.sendPresenceUpdate('composing', jid); } catch(e) {}

                    const minSec = kw.delay_min || 2;
                    const maxSec = kw.delay_max || 6;
                    const typingDelay = Math.max(0, (kw.response_text || '').length * 30);
                    const randomDelaySec = minSec + Math.random() * (maxSec - minSec);
                    const totalDelayMs = (randomDelaySec * 1000) + typingDelay;

                    console.log(`Session ${sessionId}: Responding to ${jid} in ${totalDelayMs}ms`);
                    await delay(totalDelayMs);

                    try { await sock.sendPresenceUpdate('paused', jid); } catch(e) {}

                    if (kw.media_path && fs.existsSync(kw.media_path)) {
                        const mediaUrl = kw.media_path;
                        if (kw.media_type.startsWith('image/')) {
                            await sock.sendMessage(jid, { image: { url: mediaUrl }, caption: kw.response_text || undefined }, { quoted: msg });
                        } else if (kw.media_type.startsWith('audio/')) {
                            await sock.sendMessage(jid, { audio: { url: mediaUrl }, ptt: true }, { quoted: msg });
                            if (kw.response_text) {
                                await delay(1000);
                                await sock.sendMessage(jid, { text: kw.response_text }, { quoted: msg });
                            }
                        } else if (kw.media_type.startsWith('video/')) {
                            await sock.sendMessage(jid, { video: { url: mediaUrl }, caption: kw.response_text || undefined }, { quoted: msg });
                        } else {
                            await sock.sendMessage(jid, { document: { url: mediaUrl }, fileName: path.basename(mediaUrl), caption: kw.response_text || undefined }, { quoted: msg });
                        }
                    } else if (kw.response_text) {
                        await sock.sendMessage(jid, { text: kw.response_text }, { quoted: msg });
                    }
                    console.log(`[Session ${sessionId}] Mensaje encolado enviado correctamente a ${jid}`);
                    
                    // Extra explicit human delay after answering before moving to the next queued message 
                    // (To avoid instantly reading/typing the next message)
                    await delay(1000 + Math.random() * 2000);
                    break;
                }
            }
            if (!matched) {
                // Not matched. Wait a split second so if there are 5 fast msgs, we don't process 5 items in 1 millisecond.
                await delay(300);
            }
        } catch (err) {
            console.error(`Error in queue processor for ${queueKey}:`, err);
        }
    }
    isProcessing.set(queueKey, false);
}
