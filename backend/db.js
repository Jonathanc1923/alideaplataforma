const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Automated Database Backup & Persistence Helper
function backupDatabaseFile(DATA_DIR, dbPath) {
  try {
    if (!fs.existsSync(dbPath)) return;
    const backupDir = path.join(DATA_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Primary fast backup
    const primaryBak = path.join(DATA_DIR, 'database.sqlite.bak');
    fs.copyFileSync(dbPath, primaryBak);

    // 2. Rolling timestamped snapshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotPath = path.join(backupDir, `db-snapshot-${timestamp}.sqlite`);
    fs.copyFileSync(dbPath, snapshotPath);

    // Keep only the last 10 snapshots to save disk space
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('db-snapshot-') && f.endsWith('.sqlite'))
      .map(f => ({ name: f, path: path.join(backupDir, f), time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
      files.slice(10).forEach(f => {
        try { fs.unlinkSync(f.path); } catch(e) {}
      });
    }
  } catch(err) {
    console.warn('[Alidea DB] Advertencia al generar copia de seguridad de la base de datos:', err.message);
  }
}

let backupScheduled = false;

async function getDbConnection() {
  const DATA_DIR = process.env.DATA_DIR || process.env.PERSISTENT_DIR || __dirname;
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}
  }
  const dbPath = process.env.DB_PATH || path.join(DATA_DIR, 'database.sqlite');

  // Create automatic safety backup on startup
  backupDatabaseFile(DATA_DIR, dbPath);

  // Schedule periodic backup every 3 hours
  if (!backupScheduled) {
    backupScheduled = true;
    setInterval(() => {
      backupDatabaseFile(DATA_DIR, dbPath);
    }, 3 * 60 * 60 * 1000);
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable WAL mode, concurrency safety and crash persistence
  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 10000;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = -32000;
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      business_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      plan TEXT DEFAULT 'Plan Pro',
      currency_code TEXT DEFAULT 'PEN',
      currency_symbol TEXT DEFAULT 'S/',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_name TEXT NOT NULL,
      status TEXT DEFAULT 'DISCONNECTED',
      phone_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      keyword TEXT NOT NULL,
      response_text TEXT,
      response_messages TEXT,
      delay_min INTEGER DEFAULT 2,
      delay_max INTEGER DEFAULT 6,
      media_path TEXT,
      media_type TEXT,
      media_files TEXT,
      media_delay_min INTEGER DEFAULT 2,
      media_delay_max INTEGER DEFAULT 6,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      stage TEXT DEFAULT 'nuevo',
      deal_value REAL DEFAULT 0,
      source TEXT DEFAULT 'whatsapp',
      tags TEXT,
      notes TEXT,
      last_message TEXT,
      ai_disabled INTEGER DEFAULT 0,
      last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crm_activities (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'note',
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      jid TEXT NOT NULL,
      sender_phone TEXT NOT NULL,
      sender_name TEXT,
      from_me INTEGER DEFAULT 0,
      text TEXT NOT NULL,
      media_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS crm_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lead_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      due_time TEXT,
      priority TEXT DEFAULT 'media',
      status TEXT DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT,
      price REAL NOT NULL,
      category TEXT DEFAULT 'General',
      description TEXT,
      image_url TEXT,
      in_stock INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lead_id TEXT,
      order_number TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pendiente',
      items_json TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS crm_tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      ai_disabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS retargeting_campaigns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_tag TEXT,
      messages_json TEXT NOT NULL,
      media_files TEXT,
      batch_size INTEGER DEFAULT 5,
      msg_delay_min INTEGER DEFAULT 3,
      msg_delay_max INTEGER DEFAULT 6,
      batch_delay_seconds INTEGER DEFAULT 30,
      total_recipients INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      logs_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_security (
      id TEXT PRIMARY KEY,
      failed_attempts INTEGER DEFAULT 0,
      locked_until DATETIME DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Multi-tenant composite indices for lightning-fast queries and strict profile isolation
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_keywords_session_id ON keywords(session_id);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON crm_leads(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_user_stage ON crm_leads(user_id, stage);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_user_phone ON crm_leads(user_id, phone);
    CREATE INDEX IF NOT EXISTS idx_crm_activities_user_lead ON crm_activities(user_id, lead_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_user_jid ON chat_messages(user_id, jid);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at);
    CREATE TABLE IF NOT EXISTS simulator_config (
      id TEXT PRIMARY KEY DEFAULT 'default',
      bot_name TEXT DEFAULT 'Alidea Bot Asistente',
      welcome_message TEXT DEFAULT '¡Hola! Bienvenido a Alidea 🚀. Automatizamos tus ventas en WhatsApp y organizamos tus clientes en un CRM inteligente.',
      keywords_json TEXT DEFAULT '[]',
      catalog_json TEXT DEFAULT '[]',
      currency_code TEXT DEFAULT 'PEN',
      currency_symbol TEXT DEFAULT 'S/',
      delay_min INTEGER DEFAULT 2,
      delay_max INTEGER DEFAULT 5,
      ai_enabled INTEGER DEFAULT 1,
      ai_system_prompt TEXT DEFAULT '',
      ai_temperature REAL DEFAULT 0.35,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounting_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      entry_date DATE NOT NULL,
      entry_type TEXT NOT NULL, -- 'ingreso' | 'egreso'
      classification TEXT NOT NULL, -- 'activo' | 'pasivo' | 'patrimonio' | 'nota_credito' | 'nota_debito'
      account_name TEXT NOT NULL, -- ej: 'Caja / Banco', 'Ventas', 'Servicios', 'Proveedores', 'Sueldos', 'Alquiler', etc.
      description TEXT NOT NULL,
      amount REAL NOT NULL, -- Monto neto / base
      tax_percentage REAL DEFAULT 0, -- Porcentaje de impuesto (ej: 18)
      tax_amount REAL DEFAULT 0, -- Monto calculado del impuesto
      total_amount REAL NOT NULL, -- Monto total (amount + tax_amount)
      reference_doc TEXT, -- 'Factura F001-123', 'Boleta B002-456', etc.
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounting_tax_settings (
      user_id TEXT PRIMARY KEY,
      default_tax_percentage REAL DEFAULT 18,
      income_tax_percentage REAL DEFAULT 29.5,
      income_tax_manual_amount REAL DEFAULT 0,
      income_tax_mode TEXT DEFAULT 'percentage', -- 'percentage' | 'manual'
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS catalog_config (
      user_id TEXT PRIMARY KEY,
      trigger_keywords TEXT DEFAULT 'catalogo, catálago, catalogo pdf, productos, servicios, lista de precios, precios, menu, carta, lista, cotizar, fotos de productos, ver catalogo',
      auto_reply_enabled INTEGER DEFAULT 1,
      custom_message TEXT DEFAULT '',
      media_files TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_crm_tasks_user_id ON crm_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_tags_user_id ON crm_tags(user_id);
    CREATE INDEX IF NOT EXISTS idx_catalog_config_user_id ON catalog_config(user_id);
    CREATE INDEX IF NOT EXISTS idx_accounting_user_date ON accounting_entries(user_id, entry_date);
    CREATE INDEX IF NOT EXISTS idx_accounting_user_type ON accounting_entries(user_id, entry_type);
    CREATE INDEX IF NOT EXISTS idx_accounting_user_class ON accounting_entries(user_id, classification);
  `);

  // Seed default simulator configuration if not present
  try {
    const existingSim = await db.get("SELECT id, keywords_json FROM simulator_config WHERE id = 'default'");
    if (!existingSim) {
      const defaultPrompt = 'Eres Sofia, la asesora virtual comercial de Alidea en la demostración en vivo de nuestra página web. Tu objetivo es explicar de forma concisa, cálida, entusiasta y con emojis cómo Alidea ayuda a negocios a automatizar su atención por WhatsApp 24/7, capturar leads en el CRM de Ventas y lanzar retargeting. Responde en 1 o 2 párrafos breves ideales para chat de WhatsApp.';
      await db.run(
        `INSERT INTO simulator_config (id, bot_name, welcome_message, keywords_json, delay_min, delay_max, ai_enabled, ai_system_prompt)
         VALUES ('default', 'Alidea Bot Asistente', '¡Hola! Bienvenido a Alidea 🚀. Automatizamos tus ventas en WhatsApp y organizamos tus clientes en un CRM inteligente.', '[]', 2, 5, 1, ?)`,
        [defaultPrompt]
      );
    } else if (existingSim.keywords_json && existingSim.keywords_json.includes('907318642')) {
      // Clean up legacy hardcoded seeds so user configured rules have 100% priority
      try {
        let kwList = JSON.parse(existingSim.keywords_json || '[]');
        kwList = kwList.filter(k => !(k.response || '').includes('907318642') && !k.keyword.includes('907318642'));
        await db.run("UPDATE simulator_config SET keywords_json = ? WHERE id = 'default'", [JSON.stringify(kwList)]);
      } catch (err) {}
    }
  } catch(e) {}

  // Column Migrations
  const columnMigrations = [
    { table: 'users', column: 'failed_login_attempts INTEGER DEFAULT 0' },
    { table: 'users', column: 'locked_until DATETIME DEFAULT NULL' },
    { table: 'users', column: 'total_tokens_used INTEGER DEFAULT 0' },
    { table: 'sessions', column: 'user_id TEXT' },
    { table: 'sessions', column: 'phone_number TEXT' },
    { table: 'keywords', column: 'media_path TEXT' },
    { table: 'keywords', column: 'media_type TEXT' },
    { table: 'keywords', column: 'media_files TEXT' },
    { table: 'keywords', column: 'media_delay_min INTEGER DEFAULT 2' },
    { table: 'keywords', column: 'media_delay_max INTEGER DEFAULT 6' },
    { table: 'keywords', column: 'response_messages TEXT' },
    { table: 'crm_leads', column: 'deal_value REAL DEFAULT 0' },
    { table: 'crm_leads', column: 'source TEXT DEFAULT "whatsapp"' },
    { table: 'crm_leads', column: 'tags TEXT' },
    { table: 'crm_leads', column: 'last_message TEXT' },
    { table: 'sessions', column: 'ai_enabled INTEGER DEFAULT 0' },
    { table: 'sessions', column: "ai_provider TEXT DEFAULT 'ollama'" },
    { table: 'sessions', column: "ai_model TEXT DEFAULT 'qwen2.5:7b'" },
    { table: 'sessions', column: "ai_endpoint TEXT DEFAULT 'http://localhost:11434'" },
    { table: 'sessions', column: "ai_system_prompt TEXT DEFAULT ''" },
    { table: 'sessions', column: 'ai_temperature REAL DEFAULT 0.35' },
    { table: 'sessions', column: 'ai_delay_min INTEGER DEFAULT 2' },
    { table: 'sessions', column: 'ai_delay_max INTEGER DEFAULT 5' },
    { table: 'simulator_config', column: "catalog_json TEXT DEFAULT '[]'" },
    { table: 'simulator_config', column: "catalog_keywords TEXT DEFAULT 'catalogo, catálago, catalogo pdf, productos, servicios, lista de precios, precios, menu, carta, lista, cotizar, fotos de productos, ver catalogo'" },
    { table: 'simulator_config', column: "catalog_custom_message TEXT DEFAULT ''" },
    { table: 'simulator_config', column: "catalog_media_files TEXT DEFAULT '[]'" },
    { table: 'simulator_config', column: "currency_code TEXT DEFAULT 'PEN'" },
    { table: 'simulator_config', column: "currency_symbol TEXT DEFAULT 'S/'" },
    { table: 'simulator_config', column: 'delay_min INTEGER DEFAULT 2' },
    { table: 'simulator_config', column: 'delay_max INTEGER DEFAULT 5' },
    { table: 'users', column: "currency_code TEXT DEFAULT 'PEN'" },
    { table: 'users', column: "currency_symbol TEXT DEFAULT 'S/'" },
    { table: 'crm_leads', column: 'ai_disabled INTEGER DEFAULT 0' },
    { table: 'crm_tags', column: 'ai_disabled INTEGER DEFAULT 0' }
  ];

  for (const m of columnMigrations) {
    try {
      await db.exec(`ALTER TABLE ${m.table} ADD COLUMN ${m.column}`);
    } catch (e) {}
  }

  // Seed default demo user and session if no users exist
  const existingUser = await db.get('SELECT id FROM users LIMIT 1');
  if (!existingUser) {
    const demoUserId = 'demo-user-alidea-01';
    const demoSessionId = 'session-demo-01';
    const demoPasswordHash = hashPassword('demo123');

    await db.run(
      `INSERT INTO users (id, username, password_hash, business_name, phone, role, plan, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [demoUserId, 'demo', demoPasswordHash, 'Alidea Negocio Demo', '+51 987 654 321', 'user', 'Plan Pro', 1]
    );

    await db.run(
      `INSERT OR REPLACE INTO sessions (id, user_id, session_name, status)
       VALUES (?, ?, ?, ?)`,
      [demoSessionId, demoUserId, 'Alidea Bot Principal', 'DISCONNECTED']
    );

    // Seed demo keywords
    const demoKeywords = [
      {
        id: 'kw-demo-1',
        keyword: 'hola, buenos dias, buenas tardes, informacion, info',
        response_text: '¡Hola! Bienvenido a Alidea Automatizaciones 🚀. Conectamos WhatsApp con CRM inteligente para multiplicar tus ventas.\n1. Ver Planes y Precios\n2. Solicitar Asesoría Personalizada\n3. Probar Demostración en Vivo',
        delay_min: 2,
        delay_max: 5
      },
      {
        id: 'kw-demo-2',
        keyword: 'precio, precios, planes, cuanto cuesta, costo',
        response_text: 'Nuestros planes de Alidea están diseñados para todo tipo de negocio:\n\n✨ *Plan Emprendedor*: Bot 24/7 + CRM Básico ($29/mes)\n🚀 *Plan Pro Empresa*: Multi-respuestas, multimedia ilimitada y embudo Kanban ($59/mes)\n🏢 *Plan Corporativo*: Soporte dedicado y multi-agente ($119/mes)\n\nEscribe *ASESOR* para hablar con nuestro equipo comercial.',
        delay_min: 2,
        delay_max: 4
      },
      {
        id: 'kw-demo-3',
        keyword: 'asesor, humano, contacto, hablar, vender',
        response_text: '¡Perfecto! Un asesor comercial de Alidea se pondrá en contacto contigo de inmediato. Tu solicitud ha quedado registrada en nuestro CRM con prioridad alta ⭐.',
        delay_min: 1,
        delay_max: 3
      }
    ];

    for (const kw of demoKeywords) {
      await db.run(
        `INSERT OR REPLACE INTO keywords (id, session_id, keyword, response_text, delay_min, delay_max)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [kw.id, demoSessionId, kw.keyword, kw.response_text, kw.delay_min, kw.delay_max]
      );
    }

    // Seed demo leads for CRM
    const demoLeads = [
      {
        id: 'lead-demo-1',
        name: 'Carlos Mendoza (Inmobiliaria Horizonte)',
        phone: '+51 912 345 678',
        email: 'carlos@horizonte.com',
        stage: 'nuevo',
        deal_value: 1200,
        source: 'whatsapp',
        tags: 'Interesado, Inmobiliaria',
        notes: 'Preguntó por automatización de respuestas para proyectos inmobiliarios.',
        last_message: 'Hola, vi su anuncio sobre el bot de WhatsApp para inmobiliarias, ¿cómo funciona?'
      },
      {
        id: 'lead-demo-2',
        name: 'Dra. Patricia Valdivia (Clínica Dental)',
        phone: '+51 945 678 123',
        email: 'patricia@clinicav.com',
        stage: 'contactado',
        deal_value: 850,
        source: 'whatsapp',
        tags: 'Salud, Citas',
        notes: 'Requiere recordatorio automático de citas y respuestas rápidas.',
        last_message: '¿Tienen soporte para agendar pacientes automáticamente?'
      },
      {
        id: 'lead-demo-3',
        name: 'Rodrigo Silva (Tech Store)',
        phone: '+51 987 112 334',
        email: 'rodrigo@techstore.pe',
        stage: 'propuesta',
        deal_value: 2400,
        source: 'whatsapp',
        tags: 'E-commerce, Catálogo PDF',
        notes: 'Enviada cotización de Plan Pro Anual con integración de catálogo.',
        last_message: 'Quedo a la espera de la cotización formal para revisarla con gerencia.'
      },
      {
        id: 'lead-demo-4',
        name: 'Andrea Morales (Academia de Idiomas)',
        phone: '+51 963 852 741',
        email: 'andrea@academia.org',
        stage: 'negociacion',
        deal_value: 1650,
        source: 'whatsapp',
        tags: 'Educación, Cierre Próximo',
        notes: 'Negociando fecha de inicio para capacitar al equipo docente.',
        last_message: 'Nos parece excelente la demo. ¿Podemos arrancar este lunes?'
      },
      {
        id: 'lead-demo-5',
        name: 'Marcos Benítez (Distribuidora Mayorista)',
        phone: '+51 922 446 880',
        email: 'marcos@distribuidora.com',
        stage: 'ganado',
        deal_value: 3200,
        source: 'whatsapp',
        tags: 'VIP, Cliente Activo',
        notes: 'Contrato firmado. Bot conectado y embudo Kanban funcionando al 100%.',
        last_message: '¡Excelente servicio! Ya estamos recibiendo pedidos en automático.'
      }
    ];

    for (const lead of demoLeads) {
      await db.run(
        `INSERT OR REPLACE INTO crm_leads (id, user_id, name, phone, email, stage, deal_value, source, tags, notes, last_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lead.id, demoUserId, lead.name, lead.phone, lead.email, lead.stage, lead.deal_value, lead.source, lead.tags, lead.notes, lead.last_message]
      );

      await db.run(
        `INSERT INTO crm_activities (id, lead_id, user_id, type, content)
         VALUES (?, ?, ?, ?, ?)`,
        ['act-' + lead.id, lead.id, demoUserId, 'whatsapp_in', `Mensaje inicial recibido: "${lead.last_message}"`]
      );
    }
  }

  // Seed demo Products, Tasks and Orders if empty
  const demoUserId = 'demo-user-alidea-01';
  const existingProduct = await db.get('SELECT id FROM products LIMIT 1');
  if (!existingProduct) {
    const sampleProducts = [
      {
        id: 'prod-1',
        user_id: demoUserId,
        name: 'Pack Automatización WhatsApp Pro',
        sku: 'WSP-PRO-01',
        price: 99.00,
        category: 'Software / Servicios',
        description: 'Configuración llave en mano de bot de WhatsApp con 25 flujos de venta y CRM.',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        in_stock: 1
      },
      {
        id: 'prod-2',
        user_id: demoUserId,
        name: 'Suscripción CRM Alidea Anual',
        sku: 'CRM-ANNUAL',
        price: 490.00,
        category: 'Suscripciones',
        description: 'Licencia anual de CRM Kanban con embudos ilimitados y métricas comerciales.',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
        in_stock: 1
      },
      {
        id: 'prod-3',
        user_id: demoUserId,
        name: 'Capacitación para Equipo de Ventas (3h)',
        sku: 'TRAIN-3H',
        price: 150.00,
        category: 'Consultoría',
        description: 'Taller personalizado por Zoom para enseñar a tus asesores a cerrar leads con el CRM.',
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=80',
        in_stock: 1
      },
      {
        id: 'prod-4',
        user_id: demoUserId,
        name: 'Integración de Catálogo Multimedia PDF',
        sku: 'MEDIA-CAT-01',
        price: 75.00,
        category: 'Diseño',
        description: 'Diseño y optimización de catálogo interactivo para envío automático por WhatsApp.',
        image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=500&auto=format&fit=crop&q=80',
        in_stock: 1
      }
    ];

    for (const p of sampleProducts) {
      await db.run(
        `INSERT OR REPLACE INTO products (id, user_id, name, sku, price, category, description, image_url, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.user_id, p.name, p.sku, p.price, p.category, p.description, p.image_url, p.in_stock]
      );
    }
  }

  // Seed sample Tasks
  const existingTask = await db.get('SELECT id FROM crm_tasks LIMIT 1');
  if (!existingTask) {
    const today = new Date().toISOString().slice(0, 10);
    const sampleTasks = [
      {
        id: 'task-1',
        user_id: demoUserId,
        lead_id: 'lead-demo-3',
        title: 'Llamar a Rodrigo Silva para revisar cotización',
        description: 'Preguntó por formas de pago y contrato anual con descuento.',
        due_date: today,
        due_time: '11:00 AM',
        priority: 'alta',
        status: 'pendiente'
      },
      {
        id: 'task-2',
        user_id: demoUserId,
        lead_id: 'lead-demo-4',
        title: 'Enviar temario de capacitación a Andrea Morales',
        description: 'Coordinar horarios disponibles de los docentes.',
        due_date: today,
        due_time: '03:30 PM',
        priority: 'media',
        status: 'pendiente'
      },
      {
        id: 'task-3',
        user_id: demoUserId,
        lead_id: 'lead-demo-1',
        title: 'Enviar demo en video del bot inmobiliario',
        description: 'Enviar video corto mostrando cómo responde las fichas técnicas.',
        due_date: today,
        due_time: '05:00 PM',
        priority: 'alta',
        status: 'completada'
      }
    ];

    for (const t of sampleTasks) {
      await db.run(
        `INSERT OR REPLACE INTO crm_tasks (id, user_id, lead_id, title, description, due_date, due_time, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.user_id, t.lead_id, t.title, t.description, t.due_date, t.due_time, t.priority, t.status]
      );
    }
  }

  // Seed sample Orders
  const existingOrder = await db.get('SELECT id FROM orders LIMIT 1');
  if (!existingOrder) {
    const sampleOrders = [
      {
        id: 'order-1',
        user_id: demoUserId,
        lead_id: 'lead-demo-5',
        order_number: 'ORD-2026-001',
        total_amount: 589.00,
        status: 'pagado',
        items_json: JSON.stringify([
          { name: 'Pack Automatización WhatsApp Pro', quantity: 1, price: 99.00 },
          { name: 'Suscripción CRM Alidea Anual', quantity: 1, price: 490.00 }
        ]),
        notes: 'Pago recibido vía transferencia. Bot activado.'
      },
      {
        id: 'order-2',
        user_id: demoUserId,
        lead_id: 'lead-demo-3',
        order_number: 'ORD-2026-002',
        total_amount: 2400.00,
        status: 'pendiente',
        items_json: JSON.stringify([
          { name: 'Plan Corporativo + CRM Multi-Sucursal', quantity: 1, price: 2400.00 }
        ]),
        notes: 'Cotización formal enviada por WhatsApp.'
      }
    ];

    for (const o of sampleOrders) {
      await db.run(
        `INSERT OR REPLACE INTO orders (id, user_id, lead_id, order_number, total_amount, status, items_json, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [o.id, o.user_id, o.lead_id, o.order_number, o.total_amount, o.status, o.items_json, o.notes]
      );
    }
  }

  // Seed initial chat messages if empty
  const existingChat = await db.get('SELECT id FROM chat_messages LIMIT 1');
  if (!existingChat) {
    const jid = '51987112334@s.whatsapp.net';
    const sampleChats = [
      {
        id: 'chat-1',
        user_id: demoUserId,
        session_id: 'session-demo-01',
        jid: jid,
        sender_phone: '+51 987 112 334',
        sender_name: 'Rodrigo Silva (Tech Store)',
        from_me: 0,
        text: 'Hola, vi su publicidad de Alidea. ¿Cómo funciona la automatización con el CRM?'
      },
      {
        id: 'chat-2',
        user_id: demoUserId,
        session_id: 'session-demo-01',
        jid: jid,
        sender_phone: '+51 987 112 334',
        sender_name: 'Alidea Bot',
        from_me: 1,
        text: '¡Hola Rodrigo! Bienvenido a Alidea 🚀. Conectamos WhatsApp con CRM inteligente para registrar tus clientes y responder 24/7 en automático.'
      },
      {
        id: 'chat-3',
        user_id: demoUserId,
        session_id: 'session-demo-01',
        jid: jid,
        sender_phone: '+51 987 112 334',
        sender_name: 'Rodrigo Silva (Tech Store)',
        from_me: 0,
        text: 'Quedo a la espera de la cotización formal para revisarla con gerencia.'
      }
    ];

    for (const c of sampleChats) {
      await db.run(
        `INSERT OR REPLACE INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.user_id, c.session_id, c.jid, c.sender_phone, c.sender_name, c.from_me, c.text]
      );
    }
  }

  // Seed default tags for demo user if none exist
  await seedDefaultTagsForUser(db, demoUserId);

  // Automatic bootstrap for official user 'alidea' on both local and production environments
  await bootstrapAlideaOfficial(db);

  return db;
}

async function bootstrapAlideaOfficial(db) {
  try {
    const pwdHash = hashPassword('123456');
    const alideaId = 'user-alidea-oficial';

    // 1. Asegurar o actualizar usuario 'alidea'
    await db.run(
      `INSERT INTO users (id, username, password_hash, business_name, role, plan, currency_code, currency_symbol, is_active, failed_login_attempts, locked_until)
       VALUES (?, 'alidea', ?, 'Alidea Academia', 'user', 'Plan Pro', 'PEN', 'S/', 1, 0, NULL)
       ON CONFLICT(id) DO UPDATE SET
         password_hash = excluded.password_hash,
         business_name = 'Alidea Academia',
         currency_code = 'PEN',
         currency_symbol = 'S/',
         is_active = 1,
         failed_login_attempts = 0,
         locked_until = NULL`,
      [alideaId, pwdHash]
    );

    // Asegurar cualquier registro con username 'alidea'
    await db.run(
      `UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, is_active = 1, currency_code = 'PEN', currency_symbol = 'S/' WHERE LOWER(username) = 'alidea'`,
      [pwdHash]
    );

    // 2. Sesión para alidea
    const alideaSessionId = 'session-alidea-oficial';
    await db.run(
      `INSERT INTO sessions (id, user_id, session_name, status, phone_number, ai_enabled)
       VALUES (?, ?, 'Alidea Bot Principal', 'CONNECTED', '51907318642', 1)
       ON CONFLICT(id) DO UPDATE SET
         user_id = excluded.user_id,
         status = 'CONNECTED',
         phone_number = '51907318642',
         ai_enabled = 1`,
      [alideaSessionId, alideaId]
    );

    // 3. Tax Settings
    await db.run(
      `INSERT INTO accounting_tax_settings (user_id, default_tax_percentage, income_tax_percentage, income_tax_manual_amount, income_tax_mode)
       VALUES (?, 18, 29.5, 0, 'percentage')
       ON CONFLICT(user_id) DO UPDATE SET
         default_tax_percentage = 18,
         income_tax_percentage = 29.5`,
      [alideaId]
    );

    // 4. Chequear si faltan asientos contables
    const accCount = await db.get('SELECT COUNT(*) as count FROM accounting_entries WHERE user_id = ?', [alideaId]);
    if (!accCount || accCount.count < 10) {
      const entries = [
        { date: '2026-10-09', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Yape)', desc: 'Venta Ecosistema IA 24/7 - Carlos Mendoza (Yape #84920)', amount: 41.53, tax: 7.47, total: 49.00, ref: 'Bol-B001-0482' },
        { date: '2026-10-09', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Plin)', desc: 'Venta Ecosistema IA 24/7 - Lic. Roberto Gómez (Plin #91823)', amount: 41.53, tax: 7.47, total: 49.00, ref: 'Bol-B001-0483' },
        { date: '2026-10-08', type: 'ingreso', classification: 'activo', account: 'Pasarela de Pagos (Tarjeta Visa)', desc: 'Venta Ecosistema IA 24/7 - Lucía Santillán (Culqi/Stripe)', amount: 41.53, tax: 7.47, total: 49.00, ref: 'Bol-B001-0481' },
        { date: '2026-10-08', type: 'egreso', classification: 'pasivo', account: 'Publicidad Meta Ads', desc: 'Campaña Atracción Facebook & Instagram Ads - Tráfico WhatsApp', amount: 120.00, tax: 21.60, total: 141.60, ref: 'Fact-FB-2026-1008' },
        { date: '2026-10-07', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Yape)', desc: 'Venta Pack 50 Plantillas + Asesoría - Dra. Valeria Ruiz', amount: 126.27, tax: 22.73, total: 149.00, ref: 'Fact-F001-0129' },
        { date: '2026-10-06', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Yape)', desc: 'Venta Ecosistema IA S/49 - 3 Licencias Nuevas Negocios', amount: 124.58, tax: 22.42, total: 147.00, ref: 'Bol-B001-0478' },
        { date: '2026-10-05', type: 'egreso', classification: 'pasivo', account: 'Infraestructura & Servidores', desc: 'Servidor Cloud VPS Dedicado WhatsApp Baileys & Ollama IA', amount: 85.00, tax: 15.30, total: 100.30, ref: 'Inv-HETZNER-992' },
        { date: '2026-10-04', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Plin)', desc: 'Venta Programa Táctico de Atracción S/89 - Cusco Adventure', amount: 75.42, tax: 13.58, total: 89.00, ref: 'Bol-B001-0475' },
        { date: '2026-10-03', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Yape)', desc: 'Venta Ecosistema IA S/49 - Mariana Paredes Boutique', amount: 41.53, tax: 7.47, total: 49.00, ref: 'Bol-B001-0474' },
        { date: '2026-10-02', type: 'egreso', classification: 'pasivo', account: 'Herramientas de Software', desc: 'Suscripción OpenAI API & Servidores CDN', amount: 45.00, tax: 8.10, total: 53.10, ref: 'Rec-OAI-5510' },
        { date: '2026-10-01', type: 'ingreso', classification: 'activo', account: 'Caja / Banco (Yape)', desc: 'Venta Ecosistema IA S/49 - 2 Clientes Campaña Fin de Mes', amount: 83.05, tax: 14.95, total: 98.00, ref: 'Bol-B001-0471' },
        { date: '2026-09-28', type: 'ingreso', classification: 'activo', account: 'Ventas Ecosistema IA', desc: 'Lote 6 Ventas Ecosistema IA S/49 Promoción Lanzamiento', amount: 249.15, tax: 44.85, total: 294.00, ref: 'Bol-B001-0450' },
        { date: '2026-09-20', type: 'ingreso', classification: 'activo', account: 'Consultoría & Asesorías VIP', desc: 'Implementación Inmobiliaria Horizon 5 Asesores', amount: 296.61, tax: 53.39, total: 350.00, ref: 'Fact-F001-0115' },
        { date: '2026-09-15', type: 'egreso', classification: 'pasivo', account: 'Publicidad Meta Ads', desc: 'Pauta TikTok Ads & Meta Ads Escalamiento Septiembre', amount: 180.00, tax: 32.40, total: 212.40, ref: 'Fact-FB-2026-0915' },
        { date: '2026-09-10', type: 'ingreso', classification: 'activo', account: 'Ventas Cursos Digitales', desc: 'Ventas Curso Marketing con IA (5 alumnos)', amount: 377.12, tax: 67.88, total: 445.00, ref: 'Bol-B001-0430' },
        { date: '2026-08-25', type: 'ingreso', classification: 'activo', account: 'Ventas Ecosistema IA', desc: 'Venta Lote 8 Licencias Ecosistema IA', amount: 332.20, tax: 59.80, total: 392.00, ref: 'Bol-B001-0390' },
        { date: '2026-08-15', type: 'egreso', classification: 'pasivo', account: 'Publicidad Meta Ads', desc: 'Pauta Publicitaria Campaña Escalamiento Agosto', amount: 150.00, tax: 27.00, total: 177.00, ref: 'Fact-FB-2026-0815' },
        { date: '2026-08-05', type: 'ingreso', classification: 'activo', account: 'Ventas Software', desc: 'Renovaciones y Paquetes de Automatizaciones Pro', amount: 211.86, tax: 38.14, total: 250.00, ref: 'Fact-F001-0098' }
      ];

      for (let i = 0; i < entries.length; i++) {
        const ent = entries[i];
        await db.run(
          `INSERT OR IGNORE INTO accounting_entries (id, user_id, entry_date, entry_type, classification, account_name, description, amount, tax_percentage, tax_amount, total_amount, reference_doc, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 18, ?, ?, ?, 'Registro automatizado en Bóveda Alidea')`,
          [`acc-${alideaId}-${i + 1}`, alideaId, ent.date, ent.type, ent.classification, ent.account, ent.desc, ent.amount, ent.tax, ent.total, ent.ref]
        );
      }
    }

    // 5. Chequear si faltan leads en CRM
    const leadsCount = await db.get('SELECT COUNT(*) as count FROM crm_leads WHERE user_id = ?', [alideaId]);
    if (!leadsCount || leadsCount.count < 10) {
      const mockConversations = [
        { name: 'Carlos Mendoza', phone: '+51984123456', cleanPhone: '51984123456', email: 'carlos.mendoza.peru@gmail.com', stage: 'ganado', dealValue: 49.00, source: 'facebook_ads', tags: 'VIP, Pagado, Yape, Ecosistema S/49', notes: 'Cliente transfirió por Yape S/ 49. Acceso al aula virtual y Bot IA activado exitosamente.', messages: [
          { fromMe: 0, text: 'Hola Alidea, vi el anuncio en Facebook sobre el Ecosistema de Ventas IA por S/ 49. ¿Sigue disponible la oferta?' },
          { fromMe: 1, text: '¡Hola Carlos! ⚡ Qué gusto saludarte. Soy el Asistente IA de Alidea Academia. ¡Sí, exactamente! La promoción del Ecosistema de Ventas IA 24/7 por solo S/ 49 está activa por tiempo limitado (pago único, sin mensualidades).' },
          { fromMe: 0, text: 'Excelente. ¿Qué incluye exactamente y cómo hago para pagar por Yape?' },
          { fromMe: 1, text: 'Te incluye:\n✅ Curso completo de Marketing & Anuncios con IA.\n✅ Tu propio Bot de WhatsApp 24/7 alojado por 1 año.\n✅ CRM de gestión y seguimiento de clientes.\n\n📲 Puedes cancelar S/ 49 al Yape/Plin: 907 318 642 a nombre de Alidea Academia. Envíame la captura por aquí.' },
          { fromMe: 0, text: 'Listo, aquí te adjunto la captura del Yape por S/ 49. Mi nombre es Carlos Mendoza.' },
          { fromMe: 1, text: '🎉 ¡Pago confirmado Carlos! Bienvenido al Ecosistema Alidea. Tus credenciales son:\n👤 Usuario: carlos.mendoza\n🔑 Acceso: https://academia.alidea.pe\n\nTu bot ya está listo para configurarse.' }
        ]},
        { name: 'Dra. Valeria Ruiz - Clínica Dental', phone: '+51972654321', cleanPhone: '51972654321', email: 'contacto@odontoruiz.com', stage: 'propuesta', dealValue: 49.00, source: 'instagram', tags: 'Clínica Dental, Interesado, Cita Agendada', notes: 'Requiere bot para automatizar respuestas de precios de brackets y blanqueamiento.', messages: [
          { fromMe: 0, text: 'Buenas tardes, tengo una clínica odontológica. ¿El bot puede responder las dudas de precios de ortodoncia y agendar citas automáticamente?' },
          { fromMe: 1, text: '¡Buenas tardes Dra. Valeria! 🩺 Por supuesto. Nuestro Bot IA clasifica a los pacientes según el tratamiento y les envía tus horarios disponibles de forma 100% autónoma.' },
          { fromMe: 0, text: 'Me parece genial porque actualmente pierdo muchos pacientes en las noches cuando no estamos en la clínica.' },
          { fromMe: 1, text: 'Exacto, el Bot responde en menos de 3 segundos las 24 horas. ¿Deseas que te reservemos el acceso promocional por S/ 49?' },
          { fromMe: 0, text: 'Por favor, resérvamelo. En una hora que termine mi consulta te transfiero por Yape.' }
        ]},
        { name: 'Ing. Fernando Castillo - Inmobiliaria', phone: '+51961889012', cleanPhone: '51961889012', email: 'fcastillo@horizoninmobiliaria.pe', stage: 'negociacion', dealValue: 149.00, source: 'google_ads', tags: 'Inmobiliaria, Proyectos, Telemetría BI', notes: 'Interesado en gestionar 5 asesores y campañas masivas de retargeting de departamentos.', messages: [
          { fromMe: 0, text: 'Buenos días, manejamos proyectos inmobiliarios. ¿El CRM permite segmentar compradores por rango de presupuesto?' },
          { fromMe: 1, text: '¡Buenos días Ing. Fernando! 🏢 Efectivamente. El panel incluye etiquetas comerciales inteligentes, embudo de ventas (Kanban) y difusión masiva con delays anti-bloqueo.' },
          { fromMe: 0, text: '¿Puedo conectar varios números o ver las métricas de cuántos leads ingresan cada día?' },
          { fromMe: 1, text: 'Sí, la sección de Telemetría & BI te grafica en tiempo real los ingresos, leads por canal y efectividad de cada asesor en vivo.' },
          { fromMe: 0, text: 'Muy completo. Pásame los datos de cuenta bancaria BCP o enlace de pago corporativo por favor.' }
        ]},
        { name: 'Mariana Paredes - Boutique & Moda', phone: '+51993445120', cleanPhone: '51993445120', email: 'mariana.boutique@gmail.com', stage: 'contactado', dealValue: 49.00, source: 'tiktok', tags: 'E-commerce, Catálogo PDF, Calzado', notes: 'Le enviamos el catálogo y video demostrativo. Vende vestidos de fiesta.', messages: [
          { fromMe: 0, text: 'Hola! Vi el video en TikTok. ¿Cómo hace el bot para enviar las fotos de los vestidos cuando la gente pide catálogo?' },
          { fromMe: 1, text: '¡Hola Mariana! 👗 El sistema detecta automáticamente palabras como "catálogo", "precios", "tallas" o "fotos" y envía al instante tu PDF con la lista de precios.' },
          { fromMe: 0, text: '¡Qué maravilla! Justo lo que necesito para no tener que estar enviando fotos una por una todo el día.' },
          { fromMe: 1, text: 'Totalmente. Te ahorra hasta 4 horas diarias de trabajo repetitivo. Aprovecha la promoción única de S/ 49 antes de que finalice hoy.' }
        ]},
        { name: 'Lic. Roberto Gómez - Academia Pre', phone: '+51950112334', cleanPhone: '51950112334', email: 'director@academiapre.edu.pe', stage: 'ganado', dealValue: 49.00, source: 'whatsapp', tags: 'Educación, Pagado, Plin, Alumno Activo', notes: 'Matrícula de ciclo verano 2026. Pagó por Plin.', messages: [
          { fromMe: 0, text: 'Hola, deseo adquirir el Ecosistema para nuestra sede central de informes preuniversitarios.' },
          { fromMe: 1, text: '¡Hola Lic. Roberto! Un gusto saludarte. Con el Ecosistema Alidea podrás automatizar la entrega de mallas curriculares, costos de matrícula y horarios de clase.' },
          { fromMe: 0, text: 'Excelente. Acabo de hacer el pago por Plin por S/ 49.' },
          { fromMe: 1, text: '¡Recibido con éxito! 🎓 Tu plataforma ya está activa con acceso ilimitado durante 1 año. Ya puedes escanear el QR y comenzar a atender a tus postulantes.' }
        ]},
        { name: 'Andrea Benavides - Cusco Travel Agency', phone: '+51941778990', cleanPhone: '51941778990', email: 'andrea@cuscoadventuretours.com', stage: 'negociacion', dealValue: 99.00, source: 'facebook_ads', tags: 'Turismo, Cusco Tours, Retargeting Activo', notes: 'Interesada en recontactar a 2,000 turistas que viajaron el año pasado.', messages: [
          { fromMe: 0, text: 'Hola amigos de Alidea, tengo una base de datos de 2000 turistas en Excel. ¿Puedo importar sus contactos y mandarles una oferta especial?' },
          { fromMe: 1, text: '¡Hola Andrea! 🏔️ Claro que sí. En la pestaña "Emisión" puedes importar tu base de clientes y lanzar difusiones segmentadas por lotes de 5 a 10 contactos con intervalos aleatorios.' },
          { fromMe: 0, text: '¡Espectacular! ¿Y les puedo adjuntar el PDF del itinerario con fotos del tour a la Montaña de 7 Colores?' },
          { fromMe: 1, text: 'Exactamente, permite texto enriquecido, imágenes, audios y documentos PDF en el mismo envío.' }
        ]},
        { name: 'Gustavo Morales - Taller & Autopartes', phone: '+51987234567', cleanPhone: '51987234567', email: 'repuestos.morales@hotmail.com', stage: 'nuevo', dealValue: 49.00, source: 'facebook_ads', tags: 'Autopartes, Nuevo Lead, Cotización', notes: 'Nuevo contacto solicitando información general sobre cómo cargar su inventario.', messages: [
          { fromMe: 0, text: 'Buenas noches, vi su publicidad de automatización para negocios. ¿Cómo me sirve para un taller de mecánica y repuestos?' },
          { fromMe: 1, text: '¡Buenas noches Gustavo! 🚗 Te permite registrar tus repuestos y servicios en el Catálogo Digital, enviar presupuestos rápidos por WhatsApp y llevar el control contable de tus ingresos diarios.' },
          { fromMe: 0, text: '¿Es difícil de configurar? No soy muy tecnológico.' },
          { fromMe: 1, text: 'Para nada Gustavo, el sistema viene pre-configurado y en el curso paso a paso te enseñamos a dejarlo funcionando en solo 15 minutos.' }
        ]},
        { name: 'Lucía Santillán - Belleza & Spa', phone: '+51963852741', cleanPhone: '51963852741', email: 'luciasantillan.spa@gmail.com', stage: 'ganado', dealValue: 49.00, source: 'instagram', tags: 'Spa, Pagado, Tarjeta, Acceso Enviado', notes: 'Pagó con tarjeta Visa. Ya sincronizó su WhatsApp Business con Alidea Bot.', messages: [
          { fromMe: 0, text: 'Hola! Pagué por la web con tarjeta Visa los S/ 49. ¿Por dónde entro al panel?' },
          { fromMe: 1, text: '¡Hola Lucía! 🌸 Muchas gracias por tu compra. Te confirmamos el registro. Tu usuario es tu correo y tu acceso ya está disponible.' },
          { fromMe: 0, text: '¡Muchas gracias! Ya entré y está súper claro el video de bienvenida. Ya vinculé mi QR.' },
          { fromMe: 1, text: '¡Genial Lucía! A romperla en ventas con tu Spa. Cualquier consulta estamos para apoyarte. ✨' }
        ]},
        { name: 'Marcos Alarcón - Sabor Criollo Restaurant', phone: '+51978965214', cleanPhone: '51978965214', email: 'marcos.alida.delivery@gmail.com', stage: 'propuesta', dealValue: 49.00, source: 'facebook_ads', tags: 'Restaurante, Delivery, Carta Digital', notes: 'Quiere que el bot envíe la carta del día a las 11:30 AM a clientes.', messages: [
          { fromMe: 0, text: 'Hola, tengo un restaurante en San Borja. ¿Puedo programar envíos del menú ejecutivo diario a mis clientes habituales?' },
          { fromMe: 1, text: '¡Hola Marcos! 🍲 Totalmente. Puedes usar la función de "Emisión" de Alidea para mandar la carta del día con fotos de los platos en 1 solo clic a todos tus comensales registrados.' },
          { fromMe: 0, text: 'Perfecto, eso me ahorraría mucho tiempo. ¿Hasta cuándo dura la oferta de S/ 49?' },
          { fromMe: 1, text: 'El precio especial de S/ 49 se mantiene si realizas tu activación el día de hoy.' }
        ]},
        { name: 'Diana Cárdenas - Joyería Fina', phone: '+51991321654', cleanPhone: '51991321654', email: 'diana.joyas@gmail.com', stage: 'contactado', dealValue: 49.00, source: 'instagram', tags: 'Joyería, Seguimiento 24h, Consulta Pagos', notes: 'Consultó sobre pagos recurrentes. Aclarado que es 1 solo pago anual sin letra chica.', messages: [
          { fromMe: 0, text: 'Hola, una consulta sincera: ¿después de pagar los S/ 49 me van a cobrar mensualidades adicionales?' },
          { fromMe: 1, text: '¡Hola Diana! ✨ Cero letras pequeñas. En Alidea Academia haces un ÚNICO PAGO de S/ 49. Con eso tienes 1 año completo de servidor para tu Bot, la plantilla de CRM de Ventas y el curso completo de Marketing con IA.' },
          { fromMe: 0, text: '¡Qué tranquilidad! Había probado otros programas que cobraban 30 dólares al mes. Me parece una excelente oportunidad.' },
          { fromMe: 1, text: '¡Exacto! Nuestro objetivo es que todo emprendedor pueda automatizar sus ventas sin desangrarse en mensualidades.' }
        ]}
      ];

      for (let i = 0; i < mockConversations.length; i++) {
        const conv = mockConversations[i];
        const leadId = `lead-${alideaId}-${i + 1}`;
        const jid = `${conv.cleanPhone}@s.whatsapp.net`;
        const lastMsg = conv.messages[conv.messages.length - 1].text;

        await db.run(
          `INSERT OR REPLACE INTO crm_leads (id, user_id, name, phone, email, stage, deal_value, source, tags, notes, last_message, ai_disabled)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [leadId, alideaId, conv.name, conv.phone, conv.email, conv.stage, conv.dealValue, conv.source, conv.tags, conv.notes, lastMsg]
        );

        for (let mIdx = 0; mIdx < conv.messages.length; mIdx++) {
          const msg = conv.messages[mIdx];
          const msgId = `msg-${alideaId}-${i + 1}-${mIdx + 1}`;
          await db.run(
            `INSERT OR REPLACE INTO chat_messages (id, user_id, session_id, jid, sender_phone, sender_name, from_me, text, media_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
            [msgId, alideaId, alideaSessionId, jid, conv.cleanPhone, msg.fromMe ? 'Alidea Academia' : conv.name, msg.fromMe ? 1 : 0, msg.text]
          );
        }
      }
    }

    // 6. Productos & Órdenes & Campañas
    const prodCount = await db.get('SELECT COUNT(*) as count FROM products WHERE user_id = ?', [alideaId]);
    if (!prodCount || prodCount.count < 3) {
      const prods = [
        { name: 'Ecosistema de Ventas IA 24/7 (Acceso 1 Año)', sku: 'ALI-ECO-049', price: 49.00, cat: 'Software & Licencias', desc: 'Acceso completo por 1 año a tu Asesor Bot en servidor dedicado, CRM de ventas y curso táctico de anuncios.' },
        { name: 'Programa Táctico de Atracción con IA', sku: 'ALI-MKT-089', price: 89.00, cat: 'Cursos & Capacitación', desc: 'Estrategias probadas de pauta publicitaria directa en TikTok Ads y Meta Ads para captar clientes calificados.' },
        { name: 'Pack 50 Plantillas de Respuestas & Prompts', sku: 'ALI-TMP-029', price: 29.00, cat: 'Plantillas Digitales', desc: 'Scripts de venta persuasivos, cierres por objeciones de precio y prompts de IA para WhatsApp.' },
        { name: 'Sesión 1 a 1 de Auditoría & Implementación', sku: 'ALI-VIP-149', price: 149.00, cat: 'Consultoría VIP', desc: 'Revisión privada de tus embudos, optimización del bot y conexión de tu base de clientes.' }
      ];
      for (let pIdx = 0; pIdx < prods.length; pIdx++) {
        const p = prods[pIdx];
        await db.run(
          `INSERT OR REPLACE INTO products (id, user_id, name, sku, price, category, description, in_stock)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [`prod-${alideaId}-${pIdx + 1}`, alideaId, p.name, p.sku, p.price, p.cat, p.desc]
        );
      }
    }

    const orderCount = await db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [alideaId]);
    if (!orderCount || orderCount.count < 3) {
      const ordersData = [
        { orderNum: 'ORD-2026-1089', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }] },
        { orderNum: 'ORD-2026-1088', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }] },
        { orderNum: 'ORD-2026-1087', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }] },
        { orderNum: 'ORD-2026-1086', amount: 149.00, status: 'procesando', items: [{ name: 'Pack 50 Plantillas + Asesoría VIP', qty: 1, price: 149.00 }] },
        { orderNum: 'ORD-2026-1085', amount: 89.00, status: 'pendiente', items: [{ name: 'Programa Táctico de Atracción', qty: 1, price: 89.00 }] },
        { orderNum: 'ORD-2026-1084', amount: 49.00, status: 'pendiente', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }] }
      ];
      for (let oIdx = 0; oIdx < ordersData.length; oIdx++) {
        const ord = ordersData[oIdx];
        await db.run(
          `INSERT OR REPLACE INTO orders (id, user_id, order_number, total_amount, status, items_json, notes)
           VALUES (?, ?, ?, ?, ?, ?, 'Generado desde WhatsApp Bot')`,
          [`ord-${alideaId}-${oIdx + 1}`, alideaId, ord.orderNum, ord.amount, ord.status, JSON.stringify(ord.items)]
        );
      }
    }

    const campCount = await db.get('SELECT COUNT(*) as count FROM retargeting_campaigns WHERE user_id = ?', [alideaId]);
    if (!campCount || campCount.count < 2) {
      const campaignsData = [
        { name: '🚀 Difusión Relámpago Ecosistema IA S/49', tag: 'Todos los Contactos', total: 142, sent: 142, status: 'completed' },
        { name: '🔥 Seguimiento Clientes Pendientes Yape/Plin', tag: 'Interesado', total: 38, sent: 38, status: 'completed' },
        { name: '💎 Promoción Exclusiva VIP Clientes Antiguos', tag: 'VIP', total: 65, sent: 65, status: 'completed' }
      ];
      for (let cIdx = 0; cIdx < campaignsData.length; cIdx++) {
        const c = campaignsData[cIdx];
        await db.run(
          `INSERT OR REPLACE INTO retargeting_campaigns (id, user_id, session_id, name, target_tag, messages_json, media_files, batch_size, total_recipients, sent_count, failed_count, status, logs_json)
           VALUES (?, ?, ?, ?, ?, '[]', '[]', 5, ?, ?, 0, ?, '[]')`,
          [`camp-${alideaId}-${cIdx + 1}`, alideaId, alideaSessionId, c.name, c.tag, c.total, c.sent, c.status]
        );
      }
    }

    // 7. Seed tags
    await seedDefaultTagsForUser(db, alideaId);
  } catch (err) {
    console.warn('[Alidea Bootstrap] Error al inicializar usuario oficial alidea:', err.message);
  }
}

async function seedDefaultTagsForUser(db, userId) {
  const existingTags = await db.get('SELECT id FROM crm_tags WHERE user_id = ? LIMIT 1', [userId]);
  if (!existingTags) {
    const defaultTags = [
      { id: `tag-${userId}-1`, name: 'Nuevo Contacto', color: '#3b82f6' },
      { id: `tag-${userId}-2`, name: 'Interesado', color: '#10b981' },
      { id: `tag-${userId}-3`, name: 'Cotización Pendiente', color: '#f59e0b' },
      { id: `tag-${userId}-4`, name: 'Cliente VIP', color: '#8b5cf6' },
      { id: `tag-${userId}-5`, name: 'Soporte / Atención', color: '#06b6d4' },
      { id: `tag-${userId}-6`, name: 'Cerrado / Ganado', color: '#ec4899' },
      { id: `tag-${userId}-7`, name: 'En Pausa', color: '#64748b' }
    ];

    for (const tag of defaultTags) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO crm_tags (id, user_id, name, color) VALUES (?, ?, ?, ?)`,
          [tag.id, userId, tag.name, tag.color]
        );
      } catch (e) {}
    }
  }
}

module.exports = { getDbConnection, hashPassword, seedDefaultTagsForUser, bootstrapAlideaOfficial };
