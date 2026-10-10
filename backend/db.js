const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function getDbConnection() {
  const DATA_DIR = process.env.DATA_DIR || process.env.PERSISTENT_DIR || __dirname;
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}
  }
  const dbPath = process.env.DB_PATH || path.join(DATA_DIR, 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable WAL mode, concurrency safety and crash persistence
  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
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
    const existingSim = await db.get("SELECT id FROM simulator_config WHERE id = 'default'");
    if (!existingSim) {
      const defaultKeywords = JSON.stringify([
        {
          keyword: 'precio,costo,plan,cuanto cuesta',
          response: '💳 Contamos con el Plan Acceso Total Anual por solo S/ 350 que incluye Bot 24/7, CRM Kanban, Retargeting Masivo y Curso de Anuncios en Meta y TikTok. Te acabamos de registrar en el sistema.',
          stage: 'Propuesta Enviada'
        },
        {
          keyword: 'comprar,cerrar,asesor,pedido,adquirir',
          response: '🎉 ¡Excelente decisión! Tu asesor asignado se pondrá en contacto contigo de inmediato al WhatsApp 907318642.',
          stage: 'Cerrado / Ganado'
        }
      ]);
      const defaultPrompt = 'Eres Sofia, la asesora virtual comercial de Alidea en la demostración en vivo de nuestra página web. Tu objetivo es explicar de forma concisa, cálida, entusiasta y con emojis cómo Alidea ayuda a negocios a automatizar su atención por WhatsApp 24/7, capturar leads en CRM Kanban y lanzar retargeting masivo. Responde en 1 o 2 párrafos breves ideales para chat de WhatsApp.';
      await db.run(
        `INSERT INTO simulator_config (id, bot_name, welcome_message, keywords_json, delay_min, delay_max, ai_enabled, ai_system_prompt)
         VALUES ('default', 'Alidea Bot Asistente', '¡Hola! Bienvenido a Alidea 🚀. Automatizamos tus ventas en WhatsApp y organizamos tus clientes en un CRM inteligente.', ?, 2, 5, 1, ?)`,
        [defaultKeywords, defaultPrompt]
      );
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

  return db;
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

module.exports = { getDbConnection, hashPassword, seedDefaultTagsForUser };
