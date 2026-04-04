const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getDbConnection } = require('./db');
const { initSession, getSession, getAllSessions, logoutSession } = require('./baileys-service');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
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
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));


app.get('/api/sessions', async (req, res) => {
    try {
        const db = await getDbConnection();
        const dbSessions = await db.all('SELECT * FROM sessions');
        const memorySessions = getAllSessions();
        
        // Merge state
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

app.post('/api/sessions', async (req, res) => {
    try {
        const { session_name } = req.body;
        if (!session_name) return res.status(400).json({ error: 'session_name required' });

        const id = uuidv4();
        const db = await getDbConnection();
        await db.run('INSERT INTO sessions (id, session_name, status) VALUES (?, ?, ?)', [id, session_name, 'INITIALIZING']);
        
        initSession(id, getDbConnection); // Start session non-blocking
        res.json({ id, session_name, status: 'INITIALIZING' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const session = getSession(id);
        
        if (!session) {
            // Check DB to initiate if disconnected
            const db = await getDbConnection();
            const dbSession = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);
            if (dbSession) {
             initSession(id, getDbConnection);
             return res.json({ status: 'INITIALIZING', qr: null });
            }
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.qr) {
            const qrImageBase64 = await QRCode.toDataURL(session.qr);
            res.json({ status: session.status, qr: qrImageBase64 });
        } else {
            res.json({ status: session.status, qr: null });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restart or start a disconnected session manually
app.post('/api/sessions/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        const dbSession = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);
        if (!dbSession) return res.status(404).json({ error: 'Session not found' });
        
        await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['INITIALIZING', id]);
        initSession(id, getDbConnection, true);
        res.json({ message: 'Session starting' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout session explicitly
app.post('/api/sessions/:id/logout', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDbConnection();
        await db.run('UPDATE sessions SET status = ? WHERE id = ?', ['DISCONNECTED', id]);
        await logoutSession(id);
        res.json({ message: 'Session logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Keywords Endpoints ---

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

app.post('/api/sessions/:id/keywords', upload.single('media'), async (req, res) => {
    try {
        const { id } = req.params;
        const { keyword, response_text, delay_min, delay_max } = req.body;
        const mediaFile = req.file;
        
        if (!keyword) return res.status(400).json({ error: 'Keyword required' });

        const kwId = uuidv4();
        const mediaPath = mediaFile ? mediaFile.path : null;
        const mediaType = mediaFile ? mediaFile.mimetype : null;

        const db = await getDbConnection();
        await db.run(
            'INSERT INTO keywords (id, session_id, keyword, response_text, delay_min, delay_max, media_path, media_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [kwId, id, keyword, response_text || '', delay_min || 2, delay_max || 6, mediaPath, mediaType]
        );
        res.json({ id: kwId, session_id: id, keyword, response_text, delay_min, delay_max, media_path: mediaPath, media_type: mediaType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sessions/:id/keywords/:kwId', upload.single('media'), async (req, res) => {
    try {
        const { id, kwId } = req.params;
        const { keyword, response_text, delay_min, delay_max } = req.body;
        const mediaFile = req.file;

        if (!keyword) return res.status(400).json({ error: 'Keyword required' });

        const db = await getDbConnection();
        const existing = await db.get('SELECT * FROM keywords WHERE id = ?', [kwId]);
        if (!existing) return res.status(404).json({ error: 'Keyword not found' });

        let mediaPath = existing.media_path;
        let mediaType = existing.media_type;

        // Update media if a new file is uploaded
        if (mediaFile) {
            mediaPath = mediaFile.path;
            mediaType = mediaFile.mimetype;
            // Note: old file cleanup could be implemented here
        }

        await db.run(
            'UPDATE keywords SET keyword = ?, response_text = ?, delay_min = ?, delay_max = ?, media_path = ?, media_type = ? WHERE id = ?',
            [keyword, response_text || '', delay_min || 2, delay_max || 6, mediaPath, mediaType, kwId]
        );
        res.json({ id: kwId, session_id: id, keyword, response_text, delay_min, delay_max, media_path: mediaPath, media_type: mediaType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sessions/:id/keywords/:kwId', async (req, res) => {
    try {
        const { kwId } = req.params;
        const db = await getDbConnection();
        await db.run('DELETE FROM keywords WHERE id = ?', [kwId]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Static serve frontend files locally
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Auto-start sessions on server start
    const db = await getDbConnection();
    const dbSessions = await db.all('SELECT * FROM sessions');
    for (const s of dbSessions) {
        console.log(`Auto-starting session ${s.id}`);
        initSession(s.id, getDbConnection);
    }
});
