const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDbConnection, hashPassword, seedDefaultTagsForUser } = require('./db');
const { 
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
} = require('./baileys-service');
const { generateLocalAIResponse, checkLocalAIStatus } = require('./ai-service');
require('dotenv').config();

const DATA_DIR = process.env.DATA_DIR || process.env.PERSISTENT_DIR || __dirname;
const uploadDir = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) {}
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadDir));

// Master Admin PIN (Configurable via environment variable on Render)
const ADMIN_PIN = process.env.ADMIN_PIN || '2732';

// Middleware for Admin validation
function requireAdmin(req, res, next) {
    const authHeader = req.headers['x-admin-key'] || req.headers['authorization'];
    if (authHeader === ADMIN_PIN || authHeader === `Bearer ${ADMIN_PIN}` || req.query.admin_pin === ADMIN_PIN) {
        return next();
    }
    return res.status(401).json({ error: 'Acceso no autorizado al panel de administración de Alidea' });
}

function getUserId(req) {
    return req.headers['x-user-id'] || req.headers['x_user_id'] || req.query.user_id || req.query.userId || req.body?.user_id || req.body?.userId;
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================
// 1. AUTHENTICATION ENDPOINTS (CON CONTROL DE 3 INTENTOS Y BLOQUEO POR HORAS)
// ==========================================

// User Login (for clients)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        const db = await getDbConnection();
        const user = await db.get(
            'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
            [username.trim()]
        );

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si la cuenta se encuentra actualmente bloqueada
        if (user.locked_until) {
            const lockTime = new Date(user.locked_until).getTime();
            const now = Date.now();
            if (lockTime > now) {
                const diffMs = lockTime - now;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const timeRemainingStr = hours > 0 ? `${hours} hora(s) y ${minutes} minuto(s)` : `${minutes} minuto(s)`;
                return res.status(423).json({
                    error: `Cuenta bloqueada temporalmente por seguridad tras superar 3 intentos fallidos. Debes esperar ${timeRemainingStr} para volver a probar.`,
                    isLocked: true,
                    lockedUntil: user.locked_until
                });
            } else {
                // El tiempo de bloqueo ya expiró, reiniciamos el contador
                await db.run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
                user.failed_login_attempts = 0;
                user.locked_until = null;
            }
        }

        const inputHash = hashPassword(password);
        if (user.password_hash !== inputHash) {
            const attempts = (user.failed_login_attempts || 0) + 1;
            const maxAttempts = 3;
            if (attempts >= maxAttempts) {
                const lockHours = 2; // Bloqueo de 2 horas tras 3 intentos
                const lockUntilDate = new Date(Date.now() + lockHours * 60 * 60 * 1000).toISOString();
                await db.run('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', [attempts, lockUntilDate, user.id]);
                return res.status(423).json({
                    error: `Has superado los 3 intentos permitidos de contraseña. Tu cuenta ha sido bloqueada temporalmente por ${lockHours} horas por motivos de seguridad.`,
                    isLocked: true,
                    lockedUntil: lockUntilDate
                });
            } else {
                await db.run('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [attempts, user.id]);
                const remaining = maxAttempts - attempts;
                return res.status(401).json({
                    error: `Contraseña incorrecta. Te queda${remaining === 1 ? '' : 'n'} ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta se bloquee por varias horas.`
                });
            }
        }

        if (user.is_active === 0) {
            return res.status(403).json({ error: 'Tu cuenta se encuentra inactiva. Contacta al soporte de Alidea.' });
        }

        // Login exitoso: reiniciar contador de intentos fallidos
        if (user.failed_login_attempts > 0 || user.locked_until) {
            await db.run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
        }

        let session = await db.get('SELECT * FROM sessions WHERE user_id = ?', [user.id]);
        if (!session) {
            const sessionId = `session-${user.id}`;
            await db.run(
                'INSERT INTO sessions (id, user_id, session_name, status) VALUES (?, ?, ?, ?)',
                [sessionId, user.id, user.business_name || user.username, 'DISCONNECTED']
            );
            session = { id: sessionId, user_id: user.id, session_name: user.business_name, status: 'DISCONNECTED' };
            initSession(sessionId, getDbConnection);
        }

        // Asegurar que el usuario tenga etiquetas iniciales en el CRM
        await seedDefaultTagsForUser(db, user.id);

        const { password_hash, failed_login_attempts, locked_until, ...safeUserData } = user;
        res.json({
            user: safeUserData,
            sessionId: session.id,
            sessionName: session.session_name
        });
    } catch (err) {
        console.error('Error in user login:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Login with Master PIN (Bloqueo estricto tras 3 intentos)
app.post('/api/auth/admin-login', async (req, res) => {
    try {
        const { pin } = req.body;
        const db = await getDbConnection();
        
        let sec = await db.get('SELECT * FROM admin_security WHERE id = "admin_master"');
        if (!sec) {
            await db.run('INSERT INTO admin_security (id, failed_attempts) VALUES ("admin_master", 0)');
            sec = { id: 'admin_master', failed_attempts: 0, locked_until: null };
        }

        // Verificar si la cuenta se encuentra bloqueada
        if (sec.locked_until) {
            const lockTime = new Date(sec.locked_until).getTime();
            const now = Date.now();
            if (lockTime > now) {
                const diffMs = lockTime - now;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const timeRemainingStr = hours > 0 ? `${hours} hora(s) y ${minutes} minuto(s)` : `${minutes} minuto(s)`;
                return res.status(423).json({
                    error: `Acceso maestro bloqueado por seguridad tras superar 3 intentos fallidos. Espera ${timeRemainingStr} para volver a probar.`,
                    isLocked: true,
                    lockedUntil: sec.locked_until
                });
            } else {
                await db.run('UPDATE admin_security SET failed_attempts = 0, locked_until = NULL WHERE id = "admin_master"');
                sec.failed_attempts = 0;
            }
        }

        if (pin === ADMIN_PIN) {
            await db.run('UPDATE admin_security SET failed_attempts = 0, locked_until = NULL WHERE id = "admin_master"');
            return res.json({
                success: true,
                role: 'admin',
                token: ADMIN_PIN,
                message: 'Bienvenido al panel maestro de Alidea'
            });
        }

        const attempts = (sec.failed_attempts || 0) + 1;
        if (attempts >= 3) {
            const lockHours = 2;
            const lockUntilDate = new Date(Date.now() + lockHours * 60 * 60 * 1000).toISOString();
            await db.run('UPDATE admin_security SET failed_attempts = ?, locked_until = ? WHERE id = "admin_master"', [attempts, lockUntilDate]);
            return res.status(423).json({
                error: `Has superado los 3 intentos permitidos. El acceso administrativo ha sido bloqueado durante ${lockHours} horas por seguridad.`,
                isLocked: true,
                lockedUntil: lockUntilDate
            });
        } else {
            await db.run('UPDATE admin_security SET failed_attempts = ? WHERE id = "admin_master"', [attempts]);
            const remaining = 3 - attempts;
            return res.status(401).json({
                error: `Clave de administrador incorrecta. Te queda${remaining === 1 ? '' : 'n'} ${remaining} intento${remaining === 1 ? '' : 's'} antes del bloqueo.`
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta Secreta Encriptada de Desbloqueo Maestro (Solo conocida por el dueño)
app.get('/api/auth/unlock/:secretToken', async (req, res) => {
    try {
        const { secretToken } = req.params;
        const currentPin = process.env.ADMIN_PIN || '2732';
        const expectedHash = crypto.createHash('sha256').update(currentPin + '::alidea::master::unlock::2026').digest('hex').slice(0, 24);
        
        // Verifica si coincide con el hash encriptado o con el PIN maestro
        const isValid = secretToken === expectedHash || secretToken === currentPin;
        
        if (!isValid) {
            return res.status(404).send('Not Found');
        }

        const db = await getDbConnection();
        await db.run('UPDATE admin_security SET failed_attempts = 0, locked_until = NULL');
        await db.run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL');

        return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Desbloqueo Maestro - Alidea</title>
                <style>
                    body { background: #0b0f19; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .box { background: #111827; border: 1px solid #10b981; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px; }
                    h3 { color: #10b981; margin: 0 0 0.5rem 0; }
                    p { color: #9ca3af; font-size: 0.9rem; line-height: 1.4; }
                    a { display: inline-block; margin-top: 1.2rem; background: #f59e0b; color: #000; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h3>✓ Seguridad Desbloqueada</h3>
                    <p>Los bloqueos por intentos fallidos han sido eliminados. Ya puedes volver a ingresar.</p>
                    <a href="/login?mode=admin">Ir al Panel de Administración</a>
                </div>
            </body>
            </html>
        `);
    } catch(e) {
        res.status(500).send('Error');
    }
});

// ==========================================
// 2. ADMIN USER & PLATFORM MANAGEMENT
// ==========================================

app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const db = await getDbConnection();
        const users = await db.all('SELECT id, username, business_name, phone, role, plan, is_active, total_tokens_used, created_at FROM users ORDER BY created_at DESC');
        
        const memorySessions = getAllSessions();
        const usersWithDetails = await Promise.all(users.map(async (u) => {
            const session = await db.get('SELECT id, session_name, status, phone_number FROM sessions WHERE user_id = ?', [u.id]);
            const mem = session ? memorySessions.find(m => m.id === session.id) : null;
            
            const leadsCountResult = await db.get('SELECT COUNT(*) as count, SUM(deal_value) as totalValue FROM crm_leads WHERE user_id = ?', [u.id]);
            const keywordsCountResult = session ? await db.get('SELECT COUNT(*) as count FROM keywords WHERE session_id = ?', [session.id]) : { count: 0 };

            return {
                ...u,
                session_id: session ? session.id : null,
                session_status: mem ? mem.status : (session ? session.status : 'DISCONNECTED'),
                session_phone: session ? session.phone_number : null,
                leads_count: leadsCountResult ? leadsCountResult.count : 0,
                pipeline_value: (leadsCountResult && leadsCountResult.totalValue) ? leadsCountResult.totalValue : 0,
                keywords_count: keywordsCountResult ? keywordsCountResult.count : 0
            };
        }));

        res.json(usersWithDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const { username, password, business_name, phone, plan } = req.body;
        if (!username || !password || !business_name) {
            return res.status(400).json({ error: 'Usuario, contraseña y nombre del negocio son obligatorios' });
        }

        const db = await getDbConnection();
        const existing = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
        if (existing) {
            return res.status(400).json({ error: 'Ese nombre de usuario ya está registrado en Alidea' });
        }

        const userId = uuidv4();
        const passwordHash = hashPassword(password);
        const userPlan = plan || 'Plan Pro';

        await db.run(
            `INSERT INTO users (id, username, password_hash, business_name, phone, role, plan, is_active)
             VALUES (?, ?, ?, ?, ?, 'user', ?, 1)`,
            [userId, username.trim(), passwordHash, business_name.trim(), phone || '', userPlan]
        );

        const sessionId = `session-${userId}`;
        await db.run(
            `INSERT INTO sessions (id, user_id, session_name, status)
             VALUES (?, ?, ?, 'DISCONNECTED')`,
            [sessionId, userId, business_name.trim()]
        );

        initSession(sessionId, getDbConnection);
        await seedDefaultTagsForUser(db, userId);

        res.json({
            id: userId,
            username: username.trim(),
            business_name: business_name.trim(),
            phone: phone || '',
            plan: userPlan,
            sessionId,
            message: 'Usuario y bot creados con éxito en Alidea'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { business_name, phone, plan, is_active, password } = req.body;
        
        const db = await getDbConnection();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (password && password.trim().length > 0) {
            const passwordHash = hashPassword(password);
            await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
        }

        await db.run(
            `UPDATE users 
             SET business_name = COALESCE(?, business_name),
                 phone = COALESCE(?, phone),
                 plan = COALESCE(?, plan),
                 is_active = COALESCE(?, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [business_name, phone, plan, is_active !== undefined ? (is_active ? 1 : 0) : null, userId]
        );

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDbConnection();
        
        const session = await db.get('SELECT id FROM sessions WHERE user_id = ?', [userId]);
        if (session) {
            await logoutSession(session.id);
            await db.run('DELETE FROM keywords WHERE session_id = ?', [session.id]);
            await db.run('DELETE FROM sessions WHERE id = ?', [session.id]);
        }

        await db.run('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM crm_tasks WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM products WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM orders WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM crm_activities WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM crm_leads WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ message: 'Usuario y sus recursos eliminados con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const db = await getDbConnection();
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
        const totalLeads = await db.get('SELECT COUNT(*) as count, SUM(deal_value) as totalValue FROM crm_leads');
        const activeSessions = getAllSessions().filter(s => s.status === 'CONNECTED').length;
        
        res.json({
            totalUsers: totalUsers.count,
            activeBots: activeSessions,
            totalLeads: totalLeads.count,
            totalPipelineValue: totalLeads.totalValue || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. CRM LEADS & ACTIVITIES
// ==========================================

app.get('/api/crm/leads', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const { stage, search } = req.query;
        const db = await getDbConnection();

        // Auto-sync stages for leads that have matching stage tags
        try {
            await db.run(`UPDATE crm_leads SET stage = 'ganado' WHERE user_id = ? AND (tags LIKE '%ganad%' OR tags LIKE '%cerrad%') AND stage = 'nuevo'`, [userId]);
            await db.run(`UPDATE crm_leads SET stage = 'propuesta' WHERE user_id = ? AND (tags LIKE '%propuest%' OR tags LIKE '%cotizac%') AND stage = 'nuevo'`, [userId]);
            await db.run(`UPDATE crm_leads SET stage = 'negociacion' WHERE user_id = ? AND (tags LIKE '%negocia%' OR tags LIKE '%interesad%') AND stage = 'nuevo'`, [userId]);
            await db.run(`UPDATE crm_leads SET stage = 'contactado' WHERE user_id = ? AND (tags LIKE '%conversac%' OR tags LIKE '%contactad%') AND stage = 'nuevo'`, [userId]);
            await db.run(`UPDATE crm_leads SET stage = 'perdido' WHERE user_id = ? AND (tags LIKE '%descart%' OR tags LIKE '%perdid%') AND stage = 'nuevo'`, [userId]);
        } catch(e) {}

        let query = 'SELECT * FROM crm_leads WHERE user_id = ?';
        const params = [userId];

        if (stage && stage !== 'all') {
            query += ' AND stage = ?';
            params.push(stage);
        }

        if (search) {
            query += ' AND (name LIKE ? OR phone LIKE ? OR notes LIKE ? OR tags LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        query += ' ORDER BY last_interaction DESC';

        const leads = await db.all(query, params);
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crm/leads', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, phone, email, stage, deal_value, source, tags, notes } = req.body;
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });
        if (!name || !phone) return res.status(400).json({ error: 'Nombre y teléfono requeridos' });

        const leadId = uuidv4();
        const db = await getDbConnection();

        await db.run(
            `INSERT INTO crm_leads 
             (id, user_id, name, phone, email, stage, deal_value, source, tags, notes, last_message)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                leadId,
                userId,
                name.trim(),
                phone.trim(),
                email || '',
                stage || 'nuevo',
                parseFloat(deal_value) || 0,
                source || 'manual',
                tags || '',
                notes || '',
                'Lead registrado manualmente'
            ]
        );

        await db.run(
            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
             VALUES (?, ?, ?, 'note', ?)`,
            [uuidv4(), leadId, userId, `Lead creado en el CRM con etapa inicial: ${stage || 'Nuevo Lead'}`]
        );

        res.json({ id: leadId, message: 'Lead creado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/crm/leads/:leadId', async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const currentLead = await db.get('SELECT * FROM crm_leads WHERE id = ? AND user_id = ?', [leadId, userId]);
        if (!currentLead) return res.status(404).json({ error: 'Lead no encontrado o no autorizado' });

        const updates = [];
        const params = [];

        if (req.body.name !== undefined) { updates.push('name = ?'); params.push(req.body.name.trim()); }
        if (req.body.phone !== undefined) { updates.push('phone = ?'); params.push(req.body.phone.trim()); }
        if (req.body.email !== undefined) { updates.push('email = ?'); params.push(req.body.email ? req.body.email.trim() : ''); }
        if (req.body.stage !== undefined && req.body.stage) {
            updates.push('stage = ?');
            params.push(req.body.stage);
            if (req.body.stage !== currentLead.stage) {
                await db.run(
                    `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                     VALUES (?, ?, ?, 'stage_change', ?)`,
                    [uuidv4(), leadId, userId, `Etapa comercial actualizada a "${req.body.stage}"`]
                );
            }
        }
        if (req.body.deal_value !== undefined) { updates.push('deal_value = ?'); params.push(parseFloat(req.body.deal_value) || 0); }
        if (req.body.source !== undefined) { updates.push('source = ?'); params.push(req.body.source); }
        if (req.body.tags !== undefined) { updates.push('tags = ?'); params.push(req.body.tags); }
        if (req.body.notes !== undefined) { updates.push('notes = ?'); params.push(req.body.notes); }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(leadId, userId);

        await db.run(
            `UPDATE crm_leads SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            params
        );

        res.json({ message: 'Lead actualizado correctamente' });
    } catch (err) {
        console.error('Error in PUT /api/crm/leads/:leadId:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/crm/leads/:leadId', async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const lead = await db.get('SELECT id FROM crm_leads WHERE id = ? AND user_id = ?', [leadId, userId]);
        if (!lead) return res.status(404).json({ error: 'Lead no encontrado o no autorizado' });

        await db.run('DELETE FROM crm_activities WHERE lead_id = ? AND user_id = ?', [leadId, userId]);
        await db.run('DELETE FROM crm_tasks WHERE lead_id = ? AND user_id = ?', [leadId, userId]);
        await db.run('DELETE FROM orders WHERE lead_id = ? AND user_id = ?', [leadId, userId]);
        await db.run('DELETE FROM crm_leads WHERE id = ? AND user_id = ?', [leadId, userId]);
        res.json({ message: 'Lead eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/crm/leads/:leadId/activities', async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const lead = await db.get('SELECT id FROM crm_leads WHERE id = ? AND user_id = ?', [leadId, userId]);
        if (!lead) return res.status(404).json({ error: 'Lead no encontrado o no autorizado' });

        const activities = await db.all(
            'SELECT * FROM crm_activities WHERE lead_id = ? AND user_id = ? ORDER BY created_at DESC',
            [leadId, userId]
        );
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crm/leads/:leadId/activities', async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const { content, type } = req.body;
        if (!content) return res.status(400).json({ error: 'Contenido de actividad requerido' });

        const db = await getDbConnection();
        const lead = await db.get('SELECT user_id FROM crm_leads WHERE id = ? AND user_id = ?', [leadId, userId]);
        if (!lead) return res.status(404).json({ error: 'Lead no encontrado o no autorizado' });

        const actId = uuidv4();
        await db.run(
            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
             VALUES (?, ?, ?, ?, ?)`,
            [actId, leadId, userId, type || 'note', content]
        );

        await db.run('UPDATE crm_leads SET last_interaction = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [leadId, userId]);

        res.json({ id: actId, message: 'Actividad registrada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/crm/stats', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const leads = await db.all('SELECT stage, deal_value FROM crm_leads WHERE user_id = ?', [userId]);

        const totalLeads = leads.length;
        const totalPipelineValue = leads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
        const wonLeads = leads.filter(l => l.stage === 'ganado');
        const wonValue = wonLeads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
        const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : 0;

        const stageCounts = {
            nuevo: leads.filter(l => l.stage === 'nuevo').length,
            contactado: leads.filter(l => l.stage === 'contactado').length,
            propuesta: leads.filter(l => l.stage === 'propuesta').length,
            negociacion: leads.filter(l => l.stage === 'negociacion').length,
            ganado: wonLeads.length,
            perdido: leads.filter(l => l.stage === 'perdido').length
        };

        res.json({
            totalLeads,
            totalPipelineValue,
            wonValue,
            conversionRate,
            stageCounts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. BANDEJA DE CHAT EN VIVO (LIVE CHAT)
// ==========================================

// Get list of conversations for current user
// Get list of conversations for current user
app.get('/api/chat/conversations', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const jids = await db.all(
            'SELECT DISTINCT jid FROM chat_messages WHERE user_id = ?',
            [userId]
        );

        const conversations = [];
        for (const { jid } of jids) {
            const lastMsg = await db.get(
                'SELECT * FROM chat_messages WHERE user_id = ? AND jid = ? ORDER BY created_at DESC LIMIT 1',
                [userId, jid]
            );
            if (!lastMsg) continue;

            const clientMsg = await db.get(
                'SELECT sender_name, sender_phone FROM chat_messages WHERE user_id = ? AND jid = ? AND from_me = 0 ORDER BY created_at DESC LIMIT 1',
                [userId, jid]
            );

            // Attempt resolving real phone number from JID / LID mapping
            const resolvedPhone = resolvePhoneNumber(null, jid);
            let phoneDigits = (resolvedPhone || lastMsg.sender_phone || jid.split('@')[0]).replace(/[^0-9]/g, '');
            let formattedPhone = '+' + phoneDigits;

            // If we resolved a real phone number different from old LID digits, sync database
            if (resolvedPhone && lastMsg.sender_phone !== formattedPhone) {
                try {
                    await db.run(
                        'UPDATE chat_messages SET sender_phone = ? WHERE user_id = ? AND jid = ?',
                        [formattedPhone, userId, jid]
                    );
                } catch(e) {}
            }

            const cleanLid = jid.split('@')[0];
            const lead = await db.get(
                'SELECT * FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ? OR phone = ? OR phone = ? OR notes LIKE ?)',
                [userId, formattedPhone, phoneDigits, lastMsg.sender_phone, '+' + cleanLid, `%${cleanLid}%`]
            );

            // If lead exists with old LID phone, update lead phone to real phone
            if (lead && resolvedPhone && lead.phone !== formattedPhone) {
                try {
                    await db.run(
                        'UPDATE crm_leads SET phone = ? WHERE id = ?',
                        [formattedPhone, lead.id]
                    );
                    lead.phone = formattedPhone;
                } catch(e) {}
            }

            const contactName = (lead && lead.name && lead.name !== 'Alidea Bot') 
                ? lead.name 
                : (clientMsg?.sender_name && clientMsg.sender_name !== 'Alidea Bot' 
                    ? clientMsg.sender_name 
                    : (jid.endsWith('@lid') && !resolvedPhone ? `Cliente WhatsApp (${phoneDigits.slice(-4)})` : `Contacto ${phoneDigits.slice(-4)}`));

            conversations.push({
                jid: lastMsg.jid,
                sender_phone: formattedPhone,
                sender_name: contactName,
                text: lastMsg.text,
                last_message: lastMsg.text,
                from_me: lastMsg.from_me,
                last_from_me: lastMsg.from_me,
                created_at: lastMsg.created_at,
                lead_id: lead ? lead.id : null,
                lead_name: contactName,
                lead_stage: lead ? lead.stage : 'nuevo',
                lead_tags: lead ? lead.tags : ''
            });
        }

        conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get message history for a specific conversation
app.get('/api/chat/messages/:jid', async (req, res) => {
    try {
        const { jid } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const messages = await db.all(
            'SELECT * FROM chat_messages WHERE user_id = ? AND (jid = ? OR sender_phone = ?) ORDER BY created_at ASC',
            [userId, jid, jid]
        );
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send message live through connected WhatsApp socket
app.post('/api/chat/send', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { sessionId, jid, text } = req.body;
        if (!sessionId || !jid || !text) {
            return res.status(400).json({ error: 'sessionId, jid y text son requeridos' });
        }

        const db = await getDbConnection();
        // Verificar que la sesión pertenezca al usuario si se envía userId
        if (userId) {
            const userSession = await db.get('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
            if (!userSession) {
                return res.status(403).json({ error: 'Acceso no autorizado a esta sesión de WhatsApp' });
            }
        }

        const result = await sendManualMessage(sessionId, jid, text, getDbConnection);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. TAREAS Y RECORDATORIOS (TASKS)
// ==========================================

app.get('/api/crm/tasks', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const tasks = await db.all(`
            SELECT t.*, l.name as lead_name, l.phone as lead_phone
            FROM crm_tasks t
            LEFT JOIN crm_leads l ON l.id = t.lead_id
            WHERE t.user_id = ?
            ORDER BY t.status ASC, t.due_date ASC, t.created_at DESC
        `, [userId]);

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crm/tasks', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { title, description, lead_id, due_date, due_time, priority } = req.body;
        if (!userId || !title) return res.status(400).json({ error: 'Título y usuario son requeridos' });

        const db = await getDbConnection();
        const taskId = uuidv4();

        await db.run(
            `INSERT INTO crm_tasks (id, user_id, lead_id, title, description, due_date, due_time, priority, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
            [taskId, userId, lead_id || null, title.trim(), description || '', due_date || null, due_time || '', priority || 'media']
        );

        res.json({ id: taskId, message: 'Tarea creada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/crm/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const { title, description, due_date, due_time, priority, status } = req.body;

        const db = await getDbConnection();
        await db.run(
            `UPDATE crm_tasks 
             SET title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 due_date = COALESCE(?, due_date),
                 due_time = COALESCE(?, due_time),
                 priority = COALESCE(?, priority),
                 status = COALESCE(?, status)
             WHERE id = ? AND user_id = ?`,
            [title, description, due_date, due_time, priority, status, taskId, userId]
        );

        res.json({ message: 'Tarea actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/crm/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        await db.run('DELETE FROM crm_tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
        res.json({ message: 'Tarea eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 6. CATÁLOGO DE PRODUCTOS Y PEDIDOS
// ==========================================

// Products list
app.get('/api/products', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const products = await db.all('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, sku, price, category, description, image_url } = req.body;
        if (!userId || !name || !price) {
            return res.status(400).json({ error: 'Nombre, precio y usuario son requeridos' });
        }

        const uploadedUrl = req.file ? `/uploads/${req.file.filename}` : (image_url || '');
        const prodId = uuidv4();
        const db = await getDbConnection();

        await db.run(
            `INSERT INTO products (id, user_id, name, sku, price, category, description, image_url, in_stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [prodId, userId, name.trim(), sku || '', parseFloat(price), category || 'General', description || '', uploadedUrl]
        );

        res.json({ id: prodId, message: 'Producto agregado al catálogo' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product
app.put('/api/products/:prodId', upload.single('image'), async (req, res) => {
    try {
        const { prodId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const { name, sku, price, category, description, image_url, in_stock } = req.body;
        const db = await getDbConnection();
        const uploadedUrl = req.file ? `/uploads/${req.file.filename}` : image_url;

        await db.run(
            `UPDATE products
             SET name = COALESCE(?, name),
                 sku = COALESCE(?, sku),
                 price = COALESCE(?, price),
                 category = COALESCE(?, category),
                 description = COALESCE(?, description),
                 image_url = COALESCE(?, image_url),
                 in_stock = COALESCE(?, in_stock)
             WHERE id = ? AND user_id = ?`,
            [
                name,
                sku,
                price !== undefined ? parseFloat(price) : null,
                category,
                description,
                uploadedUrl,
                in_stock !== undefined ? (in_stock ? 1 : 0) : null,
                prodId,
                userId
            ]
        );

        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
app.delete('/api/products/:prodId', async (req, res) => {
    try {
        const { prodId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        await db.run('DELETE FROM products WHERE id = ? AND user_id = ?', [prodId, userId]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Orders list
app.get('/api/orders', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const orders = await db.all(`
            SELECT o.*, l.name as lead_name, l.phone as lead_phone
            FROM orders o
            LEFT JOIN crm_leads l ON l.id = o.lead_id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Order / Quote
app.post('/api/orders', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { lead_id, total_amount, status, items, notes } = req.body;
        if (!userId || !items) return res.status(400).json({ error: 'Items y usuario requeridos' });

        const orderId = uuidv4();
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
        const db = await getDbConnection();

        await db.run(
            `INSERT INTO orders (id, user_id, lead_id, order_number, total_amount, status, items_json, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                userId,
                lead_id || null,
                orderNumber,
                parseFloat(total_amount) || 0,
                status || 'pendiente',
                typeof items === 'string' ? items : JSON.stringify(items),
                notes || ''
            ]
        );

        // Also log activity in CRM if lead is linked
        if (lead_id) {
            await db.run(
                `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
                 VALUES (?, ?, ?, 'order', ?)`,
                [uuidv4(), lead_id, userId, `Pedido generado: ${orderNumber} por $${total_amount}`]
            );
        }

        res.json({ id: orderId, orderNumber, message: 'Pedido generado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Order status
app.put('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const { status, notes } = req.body;
        const db = await getDbConnection();

        await db.run(
            `UPDATE orders 
             SET status = COALESCE(?, status),
                 notes = COALESCE(?, notes)
             WHERE id = ? AND user_id = ?`,
            [status, notes, orderId, userId]
        );

        res.json({ message: 'Estado del pedido actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Order
app.delete('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        await db.run('DELETE FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
        res.json({ message: 'Pedido eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 6.5. CRM CUSTOM TAGS & CHAT TAGGING
// ==========================================

// Get all tags for user
app.get('/api/crm/tags', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        await seedDefaultTagsForUser(db, userId);
        const tags = await db.all('SELECT * FROM crm_tags WHERE user_id = ? ORDER BY name ASC', [userId]);
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new custom tag
app.post('/api/crm/tags', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, color } = req.body;
        if (!userId || !name || !name.trim()) {
            return res.status(400).json({ error: 'Nombre de etiqueta y usuario son requeridos' });
        }

        const db = await getDbConnection();
        const tagId = uuidv4();
        const cleanName = name.trim();
        const tagColor = color || '#6366f1';

        await db.run(
            'INSERT OR REPLACE INTO crm_tags (id, user_id, name, color) VALUES (?, ?, ?, ?)',
            [tagId, userId, cleanName, tagColor]
        );

        res.json({ id: tagId, name: cleanName, color: tagColor, message: 'Etiqueta creada con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete custom tag
app.delete('/api/crm/tags/:tagId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { tagId } = req.params;
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        await db.run('DELETE FROM crm_tags WHERE id = ? AND user_id = ?', [tagId, userId]);
        res.json({ message: 'Etiqueta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign or toggle tag on a chat contact / lead
app.post('/api/chat/set-tag', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { leadId: inputLeadId, jid, phone, sessionId, tagName, tags, action } = req.body;
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        let lead = null;

        if (inputLeadId) {
            lead = await db.get('SELECT * FROM crm_leads WHERE id = ? AND user_id = ?', [inputLeadId, userId]);
        }

        let resolvedPhone = phone;
        if (!resolvedPhone && jid) {
            resolvedPhone = resolvePhoneNumber(sessionId, jid);
        }
        const phoneDigits = (resolvedPhone || (jid ? jid.split('@')[0] : '')).replace(/[^0-9]/g, '');
        const formattedPhone = phoneDigits ? ('+' + phoneDigits) : '';

        if (!lead && phoneDigits) {
            lead = await db.get(
                'SELECT * FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ? OR phone LIKE ?)',
                [userId, formattedPhone, phoneDigits, `%${phoneDigits.slice(-8)}`]
            );
        }

        let currentTags = [];
        if (lead && lead.tags) {
            currentTags = lead.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        let newTags = [];
        if (tags && Array.isArray(tags)) {
            newTags = tags.map(t => t.trim()).filter(Boolean);
        } else if (tagName) {
            const cleanTag = tagName.trim();
            if (action === 'remove') {
                newTags = currentTags.filter(t => t.toLowerCase() !== cleanTag.toLowerCase());
            } else if (action === 'add') {
                if (!currentTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
                    newTags = [...currentTags, cleanTag];
                } else {
                    newTags = currentTags;
                }
            } else if (action === 'toggle') {
                if (currentTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
                    newTags = currentTags.filter(t => t.toLowerCase() !== cleanTag.toLowerCase());
                } else {
                    newTags = [...currentTags, cleanTag];
                }
            } else {
                if (!currentTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
                    newTags = [...currentTags, cleanTag];
                } else {
                    newTags = currentTags;
                }
            }
        } else {
            newTags = currentTags;
        }

        // Deduplicate
        newTags = [...new Set(newTags)];
        const tagsString = newTags.join(', ');

        // Auto-detect stage from tag if matching
        let autoStage = req.body.stage || null;
        if (!autoStage && action !== 'remove' && tagName) {
            const tLower = tagName.toLowerCase();
            if (tLower.includes('ganad') || tLower.includes('cerrad')) autoStage = 'ganado';
            else if (tLower.includes('propuest') || tLower.includes('cotizac')) autoStage = 'propuesta';
            else if (tLower.includes('negocia') || tLower.includes('interesad')) autoStage = 'negociacion';
            else if (tLower.includes('conversac') || tLower.includes('contactad')) autoStage = 'contactado';
            else if (tLower.includes('descart') || tLower.includes('perdid')) autoStage = 'perdido';
            else if (tLower.includes('nuevo')) autoStage = 'nuevo';
        }

        let leadId;
        if (lead) {
            leadId = lead.id;
            if (autoStage) {
                await db.run(
                    'UPDATE crm_leads SET tags = ?, stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                    [tagsString, autoStage, leadId, userId]
                );
            } else {
                await db.run(
                    'UPDATE crm_leads SET tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                    [tagsString, leadId, userId]
                );
            }
        } else {
            leadId = uuidv4();
            await db.run(
                `INSERT INTO crm_leads (id, user_id, name, phone, stage, deal_value, source, tags, notes)
                 VALUES (?, ?, ?, ?, ?, 0, 'whatsapp', ?, 'Lead creado desde el chat en vivo')`,
                [leadId, userId, `Contacto ${phoneDigits.slice(-4) || 'WhatsApp'}`, formattedPhone || phoneDigits, autoStage || 'nuevo', tagsString]
            );
        }

        await db.run(
            `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
             VALUES (?, ?, ?, 'tag_change', ?)`,
            [uuidv4(), leadId, userId, `Etiquetas actualizadas: ${tagsString || '(Sin etiquetas)'}`]
        );

        res.json({
            success: true,
            leadId,
            tags: tagsString,
            tagsArray: newTags
        });
    } catch (err) {
        console.error('Error in /api/chat/set-tag:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 7. BOT & SESSION ENDPOINTS
// ==========================================

app.get('/api/sessions/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const session = getSession(id);
        
        if (!session) {
            const db = await getDbConnection();
            const dbSession = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);
            if (dbSession) {
                initSession(id, getDbConnection);
                return res.json({ status: 'INITIALIZING', qr: null, phone: null });
            }
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        if (session.qr) {
            const qrImageBase64 = await QRCode.toDataURL(session.qr);
            res.json({ status: session.status, qr: qrImageBase64, phone: session.phone });
        } else {
            res.json({ status: session.status, qr: null, phone: session.phone });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sessions/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        const dbSession = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);
        if (!dbSession) return res.status(404).json({ error: 'Sesión no encontrada' });
        
        await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['INITIALIZING', id]);
        initSession(id, getDbConnection, true);
        res.json({ message: 'Conectando bot de WhatsApp...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sessions/:id/logout', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        await db.run('UPDATE sessions SET status = ?, phone_number = NULL WHERE id = ?', ['DISCONNECTED', id]);
        await logoutSession(id);
        res.json({ message: 'Sesión de WhatsApp desconectada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bot/simulate', async (req, res) => {
    try {
        const { sessionId, messageText } = req.body;
        if (!sessionId || !messageText) {
            return res.status(400).json({ error: 'sessionId y messageText requeridos' });
        }

        const db = await getDbConnection();
        const keywords = await db.all('SELECT * FROM keywords WHERE session_id = ?', [sessionId]);

        const textLower = messageText.toLowerCase().trim();
        let matchedKw = null;

        for (const kw of keywords) {
            const parts = kw.keyword.toLowerCase().split(',').map(p => p.trim());
            if (parts.some(p => p !== '' && textLower.includes(p))) {
                matchedKw = kw;
                break;
            }
        }

        if (matchedKw) {
            let mediaFiles = [];
            if (matchedKw.media_files) {
                try { mediaFiles = JSON.parse(matchedKw.media_files); } catch(e) {}
            } else if (matchedKw.media_path) {
                mediaFiles = [{
                    path: matchedKw.media_path,
                    type: matchedKw.media_type,
                    name: path.basename(matchedKw.media_path)
                }];
            }

            let responseMessages = [];
            if (matchedKw.response_messages) {
                try {
                    const parsed = JSON.parse(matchedKw.response_messages);
                    if (Array.isArray(parsed)) {
                        responseMessages = parsed.map(m => typeof m === 'string' ? m.trim() : (m.text ? m.text.trim() : '')).filter(Boolean);
                    }
                } catch(e) {}
            }
            if (responseMessages.length === 0 && matchedKw.response_text && matchedKw.response_text.trim()) {
                responseMessages = [matchedKw.response_text.trim()];
            }

            const minSec = matchedKw.delay_min || 2;
            const maxSec = matchedKw.delay_max || 6;
            const simulatedDelayMs = Math.round((minSec + Math.random() * (maxSec - minSec)) * 1000);

            return res.json({
                matched: true,
                keywordTriggered: matchedKw.keyword,
                responseText: matchedKw.response_text || (responseMessages[0] || ''),
                responseMessages: responseMessages,
                mediaFiles,
                simulatedDelayMs
            });
        }

        // If no fixed keyword matched, check if Alidea Genesis AI is active for this session
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (session && session.ai_enabled === 1 && session.ai_system_prompt && session.ai_system_prompt.trim()) {
            const aiRes = await generateLocalAIResponse({
                sessionId: sessionId,
                prompt: messageText,
                systemPrompt: session.ai_system_prompt,
                conversationHistory: req.body.conversationHistory || [],
                endpoint: session.ai_endpoint || 'http://127.0.0.1:11434',
                temperature: session.ai_temperature || 0.35,
                allowGreeting: true
            });

            const minSec = session.ai_delay_min || 2;
            const maxSec = session.ai_delay_max || 5;
            const simulatedDelayMs = Math.round((minSec + Math.random() * (maxSec - minSec)) * 1000);

            if (aiRes.success && aiRes.shouldAnswer && aiRes.messages && aiRes.messages.length > 0) {
                return res.json({
                    matched: true,
                    isAi: true,
                    keywordTriggered: '🧠 Alidea Genesis AI™',
                    responseText: aiRes.messages[0],
                    responseMessages: aiRes.messages,
                    mediaFiles: [],
                    simulatedDelayMs: simulatedDelayMs
                });
            } else if (aiRes.success && !aiRes.shouldAnswer) {
                return res.json({
                    matched: true,
                    isAi: true,
                    isTransferredToHuman: true,
                    keywordTriggered: '🛡️ Filtro de Seguridad Alidea AI',
                    responseText: '🛡️ [Transferencia a Humano] Esta consulta no está cubierta con certeza en el contexto del negocio configurado. Por seguridad anti-alucinaciones, la IA no envió mensaje al cliente y dejó el chat abierto para que responda un asesor humano.',
                    responseMessages: [
                        '🛡️ [Transferencia a Humano] Esta consulta no está cubierta con certeza en el contexto del negocio configurado. Por seguridad anti-alucinaciones, la IA no envió mensaje al cliente y dejó el chat abierto para que responda un asesor humano.'
                    ],
                    mediaFiles: [],
                    simulatedDelayMs: 1000
                });
            } else {
                return res.json({
                    matched: false,
                    isAi: true,
                    aiError: aiRes.error,
                    message: `⚠️ Alidea Genesis AI™ está activado pero el servicio central de IA no respondió (${aiRes.error || 'Servicio no disponible'}).`
                });
            }
        }

        res.json({
            matched: false,
            message: 'Ninguna palabra clave coincidió con este mensaje.'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 7.5. ALIDEA GENESIS AI™ SETTINGS & TEST
// ==========================================

// Get AI settings and status
app.get('/api/sessions/:id/ai-settings', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        const session = await db.get('SELECT ai_enabled, ai_endpoint, ai_system_prompt, ai_temperature, ai_delay_min, ai_delay_max FROM sessions WHERE id = ?', [id]);
        
        if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

        const endpoint = session.ai_endpoint || 'http://localhost:11434';
        const aiStatus = await checkLocalAIStatus(endpoint);

        res.json({
            ai_enabled: session.ai_enabled === 1,
            ai_system_prompt: session.ai_system_prompt || '',
            ai_temperature: session.ai_temperature !== undefined ? session.ai_temperature : 0.5,
            ai_delay_min: session.ai_delay_min !== null && session.ai_delay_min !== undefined ? session.ai_delay_min : 2,
            ai_delay_max: session.ai_delay_max !== null && session.ai_delay_max !== undefined ? session.ai_delay_max : 5,
            status: aiStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update AI settings (enforces 3000 word limit & configurable delays)
app.put('/api/sessions/:id/ai-settings', async (req, res) => {
    try {
        const { id } = req.params;
        const { ai_enabled, ai_system_prompt, ai_temperature, ai_delay_min, ai_delay_max } = req.body;
        const db = await getDbConnection();

        let prompt = ai_system_prompt || '';
        
        // Enforce maximum 3,000 words limit
        const words = prompt.trim().split(/\s+/).filter(Boolean);
        if (words.length > 3000) {
            prompt = words.slice(0, 3000).join(' ');
        }

        const minDelay = ai_delay_min !== undefined ? parseInt(ai_delay_min, 10) || 2 : 2;
        const maxDelay = ai_delay_max !== undefined ? parseInt(ai_delay_max, 10) || 5 : 5;

        await db.run(
            `UPDATE sessions 
             SET ai_enabled = ?, 
                 ai_system_prompt = ?, 
                 ai_temperature = ?,
                 ai_delay_min = ?,
                 ai_delay_max = ?
             WHERE id = ?`,
            [
                ai_enabled ? 1 : 0,
                prompt,
                ai_temperature !== undefined ? parseFloat(ai_temperature) : 0.5,
                minDelay,
                maxDelay,
                id
            ]
        );

        res.json({ 
            success: true, 
            wordCount: words.length,
            ai_delay_min: minDelay,
            ai_delay_max: maxDelay,
            message: 'Configuración de Alidea Genesis AI™ guardada correctamente' 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Test AI response directly
app.post('/api/sessions/:id/ai-test', async (req, res) => {
    try {
        const { id } = req.params;
        const { prompt, systemPrompt, temperature } = req.body;
        const db = await getDbConnection();

        let sysPrompt = systemPrompt;

        if (!sysPrompt) {
            const session = await db.get('SELECT ai_system_prompt, ai_temperature FROM sessions WHERE id = ?', [id]);
            if (session) {
                sysPrompt = session.ai_system_prompt;
            }
        }

        const aiRes = await generateLocalAIResponse({
            sessionId: id,
            prompt: prompt || 'Hola',
            systemPrompt: sysPrompt || '',
            temperature: temperature !== undefined ? parseFloat(temperature) : 0.65
        });

        if (aiRes.success) {
            res.json({
                success: true,
                shouldAnswer: aiRes.shouldAnswer,
                messages: aiRes.messages || [],
                response: aiRes.messages ? aiRes.messages.join('\n\n') : '',
                reason: aiRes.reason || null
            });
        } else {
            res.status(500).json({ success: false, error: aiRes.error || 'Error al procesar consulta' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions/:id/keywords', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        const keywords = await db.all('SELECT * FROM keywords WHERE session_id = ? ORDER BY created_at DESC', [id]);
        res.json(keywords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sessions/:id/keywords', upload.array('media', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const { keyword, response_text, response_messages, delay_min, delay_max, media_delay_min, media_delay_max } = req.body;
        const files = req.files || [];
        
        if (!keyword) return res.status(400).json({ error: 'Palabra clave requerida' });

        let parsedMessages = [];
        if (response_messages) {
            try {
                const parsed = typeof response_messages === 'string' ? JSON.parse(response_messages) : response_messages;
                if (Array.isArray(parsed)) {
                    parsedMessages = parsed.map(m => typeof m === 'string' ? m.trim() : (m.text ? m.text.trim() : '')).filter(Boolean);
                }
            } catch(e) {}
        }
        if (parsedMessages.length === 0 && response_text && response_text.trim()) {
            parsedMessages = [response_text.trim()];
        }

        const messagesJSON = JSON.stringify(parsedMessages);
        const mainResponseText = parsedMessages.length > 0 ? parsedMessages[0] : (response_text || '');

        const kwId = uuidv4();
        const mediaFilesArray = files.map(file => ({
            path: file.path,
            type: file.mimetype,
            name: file.originalname
        }));
        const mediaFilesJSON = JSON.stringify(mediaFilesArray);
        const mediaPath = mediaFilesArray.length > 0 ? mediaFilesArray[0].path : null;
        const mediaType = mediaFilesArray.length > 0 ? mediaFilesArray[0].type : null;

        const db = await getDbConnection();
        await db.run(
            'INSERT INTO keywords (id, session_id, keyword, response_text, response_messages, delay_min, delay_max, media_path, media_type, media_files, media_delay_min, media_delay_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                kwId,
                id,
                keyword,
                mainResponseText,
                messagesJSON,
                parseInt(delay_min, 10) || 2,
                parseInt(delay_max, 10) || 6,
                mediaPath,
                mediaType,
                mediaFilesJSON,
                parseInt(media_delay_min, 10) || 2,
                parseInt(media_delay_max, 10) || 6
            ]
        );
        res.json({
            id: kwId,
            session_id: id,
            keyword,
            response_text: mainResponseText,
            response_messages: messagesJSON,
            delay_min: parseInt(delay_min, 10) || 2,
            delay_max: parseInt(delay_max, 10) || 6,
            media_path: mediaPath,
            media_type: mediaType,
            media_files: mediaFilesArray,
            media_delay_min: parseInt(media_delay_min, 10) || 2,
            media_delay_max: parseInt(media_delay_max, 10) || 6
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sessions/:id/keywords/:kwId', upload.array('media', 10), async (req, res) => {
    try {
        const { id, kwId } = req.params;
        const { keyword, response_text, response_messages, delay_min, delay_max, media_delay_min, media_delay_max, existing_media } = req.body;
        const newFiles = req.files || [];

        if (!keyword) return res.status(400).json({ error: 'Palabra clave requerida' });

        const db = await getDbConnection();
        const existing = await db.get('SELECT * FROM keywords WHERE id = ?', [kwId]);
        if (!existing) return res.status(404).json({ error: 'Palabra clave no encontrada' });

        let parsedMessages = [];
        if (response_messages) {
            try {
                const parsed = typeof response_messages === 'string' ? JSON.parse(response_messages) : response_messages;
                if (Array.isArray(parsed)) {
                    parsedMessages = parsed.map(m => typeof m === 'string' ? m.trim() : (m.text ? m.text.trim() : '')).filter(Boolean);
                }
            } catch(e) {}
        }
        if (parsedMessages.length === 0 && response_text && response_text.trim()) {
            parsedMessages = [response_text.trim()];
        }

        const messagesJSON = JSON.stringify(parsedMessages);
        const mainResponseText = parsedMessages.length > 0 ? parsedMessages[0] : (response_text || '');

        let existingMedia = [];
        if (existing_media) {
            try {
                existingMedia = JSON.parse(existing_media);
            } catch (e) {
                console.error('Error parsing existing_media:', e);
            }
        }

        const newMediaFilesArray = newFiles.map(file => ({
            path: file.path,
            type: file.mimetype,
            name: file.originalname
        }));

        const mergedMediaFiles = [...existingMedia, ...newMediaFilesArray];
        const mediaFilesJSON = JSON.stringify(mergedMediaFiles);
        const mediaPath = mergedMediaFiles.length > 0 ? mergedMediaFiles[0].path : null;
        const mediaType = mergedMediaFiles.length > 0 ? mergedMediaFiles[0].type : null;

        await db.run(
            'UPDATE keywords SET keyword = ?, response_text = ?, response_messages = ?, delay_min = ?, delay_max = ?, media_path = ?, media_type = ?, media_files = ?, media_delay_min = ?, media_delay_max = ? WHERE id = ?',
            [
                keyword,
                mainResponseText,
                messagesJSON,
                parseInt(delay_min, 10) || 2,
                parseInt(delay_max, 10) || 6,
                mediaPath,
                mediaType,
                mediaFilesJSON,
                parseInt(media_delay_min, 10) || 2,
                parseInt(media_delay_max, 10) || 6,
                kwId
            ]
        );
        res.json({
            id: kwId,
            session_id: id,
            keyword,
            response_text: mainResponseText,
            response_messages: messagesJSON,
            delay_min: parseInt(delay_min, 10) || 2,
            delay_max: parseInt(delay_max, 10) || 6,
            media_path: mediaPath,
            media_type: mediaType,
            media_files: mergedMediaFiles,
            media_delay_min: parseInt(media_delay_min, 10) || 2,
            media_delay_max: parseInt(media_delay_max, 10) || 6
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sessions/:id/keywords/:kwId', async (req, res) => {
    try {
        const { id, kwId } = req.params;
        const db = await getDbConnection();
        await db.run('DELETE FROM keywords WHERE id = ? AND session_id = ?', [kwId, id]);
        res.json({ message: 'Palabra clave eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        const userId = getUserId(req);
        const db = await getDbConnection();
        let dbSessions;
        if (userId) {
            dbSessions = await db.all('SELECT * FROM sessions WHERE user_id = ?', [userId]);
        } else {
            dbSessions = await db.all('SELECT * FROM sessions');
        }
        const memorySessions = getAllSessions();
        
        const responseData = dbSessions.map(dbS => {
            const mem = memorySessions.find(m => m.id === dbS.id);
            return {
                ...dbS,
                status: mem ? mem.status : dbS.status
            };
        });
        
        res.json(responseData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generic media upload endpoint for Chat & Retargeting
app.post('/api/upload', upload.array('files', 10), (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length === 0) {
            return res.status(400).json({ error: 'No se subieron archivos' });
        }

        const uploadedList = files.map(file => {
            let mediaType = 'document';
            if (file.mimetype.startsWith('image/')) mediaType = 'image';
            else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
            else if (file.mimetype.startsWith('video/')) mediaType = 'video';

            return {
                path: file.path,
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                type: mediaType,
                url: `/uploads/${file.filename}`
            };
        });

        res.json({ success: true, files: uploadedList });
    } catch (err) {
        console.error('Error in /api/upload:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 8. RETARGETING & BROADCAST CAMPAIGNS
// ==========================================

// Start Retargeting Campaign
app.post('/api/retargeting/start', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const {
            name,
            sessionId: inputSessionId,
            targetTags, // array of tag strings or single string
            messages,   // array of message objects: { text, type, mediaUrl, filename, caption }
            settings    // { msgDelayMin, msgDelayMax, batchSize, batchDelaySeconds }
        } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Debes configurar al menos un mensaje para la campaña de retargeting' });
        }

        const db = await getDbConnection();

        // Resolve Session ID
        let sessionId = inputSessionId;
        if (!sessionId) {
            const userSession = await db.get('SELECT id FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
            sessionId = userSession ? userSession.id : null;
        }

        if (!sessionId) {
            return res.status(400).json({ error: 'No hay una sesión de WhatsApp activa vinculada' });
        }

        // Auto-sync any distinct WhatsApp chat contacts into crm_leads so they can be targeted
        try {
            const chatJids = await db.all('SELECT DISTINCT jid, sender_phone, sender_name FROM chat_messages WHERE user_id = ?', [userId]);
            for (const c of chatJids) {
                const resolvedPhone = resolvePhoneNumber(sessionId, c.jid);
                const phoneDigits = (resolvedPhone || c.sender_phone || c.jid.split('@')[0]).replace(/[^0-9]/g, '');
                if (phoneDigits.length >= 6) {
                    const formatted = '+' + phoneDigits;
                    const existing = await db.get(
                        'SELECT id FROM crm_leads WHERE user_id = ? AND (phone = ? OR phone = ? OR phone LIKE ?)',
                        [userId, formatted, phoneDigits, `%${phoneDigits.slice(-8)}`]
                    );
                    if (!existing) {
                        await db.run(
                            `INSERT INTO crm_leads (id, user_id, name, phone, stage, deal_value, source, tags, notes)
                             VALUES (?, ?, ?, ?, 'nuevo', 0, 'whatsapp', 'WhatsApp Lead', 'Contacto capturado automáticamente')`,
                            [uuidv4(), userId, (c.sender_name && c.sender_name !== 'Alidea Bot') ? c.sender_name : `Contacto ${phoneDigits.slice(-4)}`, formatted]
                        );
                    }
                }
            }
        } catch (syncErr) {
            console.warn('[Retargeting] Error auto-syncing chat contacts to leads:', syncErr);
        }

        // Fetch matching leads
        const allLeads = await db.all('SELECT * FROM crm_leads WHERE user_id = ?', [userId]);
        
        let filteredLeads = allLeads;
        let tagsArray = [];
        if (targetTags) {
            tagsArray = Array.isArray(targetTags) ? targetTags.map(t => t.trim().toLowerCase()) : [targetTags.trim().toLowerCase()];
            tagsArray = tagsArray.filter(t => t && t !== 'all' && t !== 'todos');
        }

        if (tagsArray.length > 0) {
            filteredLeads = allLeads.filter(lead => {
                if (!lead.tags) return false;
                const leadTagList = lead.tags.split(',').map(t => t.trim().toLowerCase());
                return tagsArray.some(t => leadTagList.some(item => item.includes(t) || t.includes(item)));
            });
        }

        // Filter valid contacts with phone numbers
        const contacts = filteredLeads
            .filter(lead => lead.phone && lead.phone.replace(/[^0-9]/g, '').length >= 6)
            .map(lead => ({
                id: lead.id,
                name: lead.name || 'Cliente',
                phone: lead.phone,
                tags: lead.tags || ''
            }));

        if (contacts.length === 0) {
            return res.status(400).json({ 
                error: tagsArray.length > 0 
                    ? `No se encontraron contactos con la etiqueta seleccionada (${tagsArray.join(', ')}). Selecciona "Todas las etiquetas" o asigna etiquetas a tus contactos en el chat.` 
                    : 'No se encontraron contactos con número de WhatsApp válido en tu sistema.'
            });
        }

        const campaignId = uuidv4();
        const campaignName = name && name.trim() ? name.trim() : `Retargeting ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`;

        const campaignSettings = {
            msgDelayMin: Number(settings?.msgDelayMin) || 3,
            msgDelayMax: Number(settings?.msgDelayMax) || 6,
            batchSize: Number(settings?.batchSize) || 5,
            batchDelaySeconds: Number(settings?.batchDelaySeconds) || 30
        };

        // Persist initial campaign row in DB
        await db.run(
            `INSERT INTO retargeting_campaigns 
             (id, user_id, session_id, name, target_tags, messages_json, settings_json, total_contacts, sent_count, failed_count, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'running')`,
            [
                campaignId,
                userId,
                sessionId,
                campaignName,
                tagsArray.join(', '),
                JSON.stringify(messages),
                JSON.stringify(campaignSettings),
                contacts.length
            ]
        );

        // Start async background execution
        runRetargetingCampaign({
            campaignId,
            sessionId,
            contacts,
            messages,
            settings: campaignSettings,
            getDbConnection
        }).catch(err => {
            console.error(`[Retargeting] Error background campaign ${campaignId}:`, err);
        });

        res.json({
            success: true,
            campaignId,
            campaignName,
            totalContacts: contacts.length,
            message: `Campaña iniciada para ${contacts.length} contacto(s).`
        });
    } catch (err) {
        console.error('Error starting retargeting campaign:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Live Campaign Status
app.get('/api/retargeting/status/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        // First check in-memory status
        const memStatus = getRetargetingStatus(campaignId);
        if (memStatus) {
            return res.json(memStatus);
        }

        // Fallback to DB
        const db = await getDbConnection();
        const campaign = await db.get('SELECT * FROM retargeting_campaigns WHERE id = ?', [campaignId]);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaña no encontrada' });
        }

        let logs = [];
        try { logs = JSON.parse(campaign.logs_json || '[]'); } catch(e) {}

        res.json({
            campaignId: campaign.id,
            status: campaign.status,
            total: campaign.total_contacts,
            sent: campaign.sent_count,
            failed: campaign.failed_count,
            logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stop / Cancel Campaign
app.post('/api/retargeting/stop/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const stopped = stopRetargetingCampaign(campaignId);

        const db = await getDbConnection();
        await db.run(
            `UPDATE retargeting_campaigns 
             SET status = 'stopped', completed_at = CURRENT_TIMESTAMP 
             WHERE id = ? AND status = 'running'`,
            [campaignId]
        );

        res.json({ success: true, message: 'Campaña detenida exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Campaign History for User
app.get('/api/retargeting/history', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' });

        const db = await getDbConnection();
        const campaigns = await db.all(
            'SELECT * FROM retargeting_campaigns WHERE user_id = ? ORDER BY started_at DESC LIMIT 50',
            [userId]
        );

        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Static serve frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`===============================================`);
    console.log(`🚀 ALIDEA PLATFORM - Server running on port ${PORT}`);
    console.log(`💼 CRM + Live Chat + Products + Tasks Suite Active`);
    console.log(`🌐 Bound to:`, server.address());
    console.log(`===============================================`);
    
    try {
        const db = await getDbConnection();
        const dbSessions = await db.all('SELECT * FROM sessions');
        for (const s of dbSessions) {
            console.log(`[Alidea] Inicializando sesión ${s.session_name} (${s.id})`);
            initSession(s.id, getDbConnection);
        }
    } catch(err) {
        console.error('Error starting initial sessions:', err);
    }
});
