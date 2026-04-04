const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDbConnection() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, /* Can use UUID */
      session_name TEXT NOT NULL,
      status TEXT DEFAULT 'DISCONNECTED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      keyword TEXT NOT NULL,
      response_text TEXT,
      delay_min INTEGER DEFAULT 2,
      delay_max INTEGER DEFAULT 6,
      media_path TEXT,
      media_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  try {
    await db.exec('ALTER TABLE keywords ADD COLUMN media_path TEXT');
  } catch (e) {}

  try {
    await db.exec('ALTER TABLE keywords ADD COLUMN media_type TEXT');
  } catch (e) {}

  return db;
}

module.exports = { getDbConnection };
