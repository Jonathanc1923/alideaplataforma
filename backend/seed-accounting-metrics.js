const { getDbConnection } = require('./db');

async function seedAccountingAndMetrics() {
  console.log('📊 Generando datos contables, productos, órdenes y telemetría para Alidea...');
  const db = await getDbConnection();

  const targetUsers = await db.all(
    'SELECT id, username, business_name FROM users WHERE username IN (?, ?, ?)',
    ['jony', 'demo', 'alidea']
  );

  for (const user of targetUsers) {
    console.log(`\n💼 Sembrando métricas para usuario '${user.username}' (${user.id})...`);

    // Obtener sesión
    let session = await db.get('SELECT id FROM sessions WHERE user_id = ?', [user.id]);
    const sessionId = session ? session.id : `session-${user.id}`;

    // ==========================================
    // 1. CONFIGURACIÓN DE IMPUESTOS (Tax Settings)
    // ==========================================
    await db.run(
      `INSERT INTO accounting_tax_settings (user_id, default_tax_percentage, income_tax_percentage, income_tax_manual_amount, income_tax_mode)
       VALUES (?, 18, 29.5, 0, 'percentage')
       ON CONFLICT(user_id) DO UPDATE SET
         default_tax_percentage = 18,
         income_tax_percentage = 29.5`,
      [user.id]
    );

    // ==========================================
    // 2. PRODUCTOS EN CATÁLOGO
    // ==========================================
    const productsData = [
      {
        name: 'Ecosistema de Ventas IA 24/7 (Acceso 1 Año)',
        sku: 'ALI-ECO-049',
        price: 49.00,
        category: 'Software & Licencias',
        description: 'Acceso completo por 1 año a tu Asesor Bot en servidor dedicado, CRM de ventas y curso táctico de anuncios.',
        inStock: 1
      },
      {
        name: 'Programa Táctico de Atracción con IA',
        sku: 'ALI-MKT-089',
        price: 89.00,
        category: 'Cursos & Capacitación',
        description: 'Estrategias probadas de pauta publicitaria directa en TikTok Ads y Meta Ads para captar clientes calificados.',
        inStock: 1
      },
      {
        name: 'Pack 50 Plantillas de Respuestas & Prompts',
        sku: 'ALI-TMP-029',
        price: 29.00,
        category: 'Plantillas Digitales',
        description: 'Scripts de venta persuasivos, cierres por objeciones de precio y prompts de IA para WhatsApp.',
        inStock: 1
      },
      {
        name: 'Sesión 1 a 1 de Auditoría & Implementación',
        sku: 'ALI-VIP-149',
        price: 149.00,
        category: 'Consultoría VIP',
        description: 'Revisión privada de tus embudos, optimización del bot y conexión de tu base de clientes.',
        inStock: 1
      }
    ];

    await db.run('DELETE FROM products WHERE user_id = ?', [user.id]);
    for (let pIdx = 0; pIdx < productsData.length; pIdx++) {
      const p = productsData[pIdx];
      await db.run(
        `INSERT INTO products (id, user_id, name, sku, price, category, description, image_url, in_stock, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, datetime('now', '-${pIdx * 2} days'))`,
        [`prod-${user.id}-${pIdx + 1}`, user.id, p.name, p.sku, p.price, p.category, p.description, p.inStock]
      );
    }

    // ==========================================
    // 3. ASIENTOS CONTABLES (Libro Diario / Mayor / Balance)
    // ==========================================
    await db.run('DELETE FROM accounting_entries WHERE user_id = ?', [user.id]);

    const entries = [
      // Octubre 2026 (Mes Actual - Muy Dinámico)
      {
        date: '2026-10-09',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Yape)',
        desc: 'Venta Ecosistema IA 24/7 - Carlos Mendoza (Yape #84920)',
        amount: 41.53,
        tax: 7.47,
        total: 49.00,
        ref: 'Bol-B001-0482'
      },
      {
        date: '2026-10-09',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Plin)',
        desc: 'Venta Ecosistema IA 24/7 - Lic. Roberto Gómez (Plin #91823)',
        amount: 41.53,
        tax: 7.47,
        total: 49.00,
        ref: 'Bol-B001-0483'
      },
      {
        date: '2026-10-08',
        type: 'ingreso',
        classification: 'activo',
        account: 'Pasarela de Pagos (Tarjeta Visa)',
        desc: 'Venta Ecosistema IA 24/7 - Lucía Santillán (Culqi/Stripe)',
        amount: 41.53,
        tax: 7.47,
        total: 49.00,
        ref: 'Bol-B001-0481'
      },
      {
        date: '2026-10-08',
        type: 'egreso',
        classification: 'pasivo',
        account: 'Publicidad Meta Ads',
        desc: 'Campaña Atracción Facebook & Instagram Ads - Tráfico WhatsApp',
        amount: 120.00,
        tax: 21.60,
        total: 141.60,
        ref: 'Fact-FB-2026-1008'
      },
      {
        date: '2026-10-07',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Yape)',
        desc: 'Venta Pack 50 Plantillas + Asesoría - Dra. Valeria Ruiz',
        amount: 126.27,
        tax: 22.73,
        total: 149.00,
        ref: 'Fact-F001-0129'
      },
      {
        date: '2026-10-06',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Yape)',
        desc: 'Venta Ecosistema IA S/49 - 3 Licencias Nuevas Negocios',
        amount: 124.58,
        tax: 22.42,
        total: 147.00,
        ref: 'Bol-B001-0478'
      },
      {
        date: '2026-10-05',
        type: 'egreso',
        classification: 'pasivo',
        account: 'Infraestructura & Servidores',
        desc: 'Servidor Cloud VPS Dedicado WhatsApp Baileys & Ollama IA',
        amount: 85.00,
        tax: 15.30,
        total: 100.30,
        ref: 'Inv-HETZNER-992'
      },
      {
        date: '2026-10-04',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Plin)',
        desc: 'Venta Programa Táctico de Atracción S/89 - Cusco Adventure',
        amount: 75.42,
        tax: 13.58,
        total: 89.00,
        ref: 'Bol-B001-0475'
      },
      {
        date: '2026-10-03',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Yape)',
        desc: 'Venta Ecosistema IA S/49 - Mariana Paredes Boutique',
        amount: 41.53,
        tax: 7.47,
        total: 49.00,
        ref: 'Bol-B001-0474'
      },
      {
        date: '2026-10-02',
        type: 'egreso',
        classification: 'pasivo',
        account: 'Herramientas de Software',
        desc: 'Suscripción OpenAI API & Servidores CDN',
        amount: 45.00,
        tax: 8.10,
        total: 53.10,
        ref: 'Rec-OAI-5510'
      },
      {
        date: '2026-10-01',
        type: 'ingreso',
        classification: 'activo',
        account: 'Caja / Banco (Yape)',
        desc: 'Venta Ecosistema IA S/49 - 2 Clientes Campaña Fin de Mes',
        amount: 83.05,
        tax: 14.95,
        total: 98.00,
        ref: 'Bol-B001-0471'
      },

      // Septiembre 2026
      {
        date: '2026-09-28',
        type: 'ingreso',
        classification: 'activo',
        account: 'Ventas Ecosistema IA',
        desc: 'Lote 6 Ventas Ecosistema IA S/49 Promoción Lanzamiento',
        amount: 249.15,
        tax: 44.85,
        total: 294.00,
        ref: 'Bol-B001-0450'
      },
      {
        date: '2026-09-20',
        type: 'ingreso',
        classification: 'activo',
        account: 'Consultoría & Asesorías VIP',
        desc: 'Implementación Inmobiliaria Horizon 5 Asesores',
        amount: 296.61,
        tax: 53.39,
        total: 350.00,
        ref: 'Fact-F001-0115'
      },
      {
        date: '2026-09-15',
        type: 'egreso',
        classification: 'pasivo',
        account: 'Publicidad Meta Ads',
        desc: 'Pauta TikTok Ads & Meta Ads Escalamiento Septiembre',
        amount: 180.00,
        tax: 32.40,
        total: 212.40,
        ref: 'Fact-FB-2026-0915'
      },
      {
        date: '2026-09-10',
        type: 'ingreso',
        classification: 'activo',
        account: 'Ventas Cursos Digitales',
        desc: 'Ventas Curso Marketing con IA (5 alumnos)',
        amount: 377.12,
        tax: 67.88,
        total: 445.00,
        ref: 'Bol-B001-0430'
      },

      // Agosto 2026
      {
        date: '2026-08-25',
        type: 'ingreso',
        classification: 'activo',
        account: 'Ventas Ecosistema IA',
        desc: 'Venta Lote 8 Licencias Ecosistema IA',
        amount: 332.20,
        tax: 59.80,
        total: 392.00,
        ref: 'Bol-B001-0390'
      },
      {
        date: '2026-08-15',
        type: 'egreso',
        classification: 'pasivo',
        account: 'Publicidad Meta Ads',
        desc: 'Pauta Publicitaria Campaña Escalamiento Agosto',
        amount: 150.00,
        tax: 27.00,
        total: 177.00,
        ref: 'Fact-FB-2026-0815'
      },
      {
        date: '2026-08-05',
        type: 'ingreso',
        classification: 'activo',
        account: 'Ventas Software',
        desc: 'Renovaciones y Paquetes de Automatizaciones Pro',
        amount: 211.86,
        tax: 38.14,
        total: 250.00,
        ref: 'Fact-F001-0098'
      }
    ];

    for (let eIdx = 0; eIdx < entries.length; eIdx++) {
      const ent = entries[eIdx];
      const entryId = `acc-${user.id}-${eIdx + 1}`;
      await db.run(
        `INSERT INTO accounting_entries (
          id, user_id, entry_date, entry_type, classification, account_name, description, amount, tax_percentage, tax_amount, total_amount, reference_doc, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 18, ?, ?, ?, ?)`,
        [
          entryId,
          user.id,
          ent.date,
          ent.type,
          ent.classification,
          ent.account,
          ent.desc,
          ent.amount,
          ent.tax,
          ent.total,
          ent.ref,
          `Registro automatizado en Bóveda Alidea. Vía ${ent.account}`
        ]
      );
    }

    // ==========================================
    // 4. ÓRDENES DE VENTA (Orders)
    // ==========================================
    await db.run('DELETE FROM orders WHERE user_id = ?', [user.id]);
    const ordersData = [
      { orderNum: 'ORD-2026-1089', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }], leadId: `lead-${user.id}-1` },
      { orderNum: 'ORD-2026-1088', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }], leadId: `lead-${user.id}-5` },
      { orderNum: 'ORD-2026-1087', amount: 49.00, status: 'completado', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }], leadId: `lead-${user.id}-8` },
      { orderNum: 'ORD-2026-1086', amount: 149.00, status: 'procesando', items: [{ name: 'Pack 50 Plantillas + Asesoría VIP', qty: 1, price: 149.00 }], leadId: `lead-${user.id}-3` },
      { orderNum: 'ORD-2026-1085', amount: 89.00, status: 'pendiente', items: [{ name: 'Programa Táctico de Atracción', qty: 1, price: 89.00 }], leadId: `lead-${user.id}-6` },
      { orderNum: 'ORD-2026-1084', amount: 49.00, status: 'pendiente', items: [{ name: 'Ecosistema de Ventas IA 24/7', qty: 1, price: 49.00 }], leadId: `lead-${user.id}-2` }
    ];

    for (let oIdx = 0; oIdx < ordersData.length; oIdx++) {
      const ord = ordersData[oIdx];
      await db.run(
        `INSERT INTO orders (id, user_id, lead_id, order_number, total_amount, status, items_json, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Generado desde WhatsApp Bot', datetime('now', '-${oIdx * 12} hours'))`,
        [`ord-${user.id}-${oIdx + 1}`, user.id, ord.leadId, ord.orderNum, ord.amount, ord.status, JSON.stringify(ord.items)]
      );
    }

    // ==========================================
    // 5. CAMPAÑAS DE RETARGETING (Historial de Emisión)
    // ==========================================
    await db.run('DELETE FROM retargeting_campaigns WHERE user_id = ?', [user.id]);
    const campaignsData = [
      {
        name: '🚀 Difusión Relámpago Ecosistema IA S/49',
        tag: 'Todos los Contactos',
        total: 142,
        sent: 142,
        failed: 0,
        status: 'completed',
        hoursAgo: 4
      },
      {
        name: '🔥 Seguimiento Clientes Pendientes Yape/Plin',
        tag: 'Interesado',
        total: 38,
        sent: 38,
        failed: 0,
        status: 'completed',
        hoursAgo: 24
      },
      {
        name: '💎 Promoción Exclusiva VIP Clientes Antiguos',
        tag: 'VIP',
        total: 65,
        sent: 65,
        failed: 0,
        status: 'completed',
        hoursAgo: 72
      }
    ];

    for (let cIdx = 0; cIdx < campaignsData.length; cIdx++) {
      const c = campaignsData[cIdx];
      const campId = `camp-${user.id}-${cIdx + 1}`;
      const messagesJson = JSON.stringify([
        { type: 'text', text: '¡Hola! ⚡ Últimas horas para acceder al Ecosistema IA 24/7 por solo S/ 49. ¿Deseas activar tu usuario hoy?' }
      ]);
      const logsJson = JSON.stringify([
        `🚀 Campaña iniciada para ${c.total} contactos.`,
        `✅ Progreso: ${c.sent}/${c.total} mensajes enviados exitosamente con delay anti-bloqueo.`,
        `🏁 Campaña completada al 100%.`
      ]);

      await db.run(
        `INSERT INTO retargeting_campaigns (
          id, user_id, session_id, name, target_tag, messages_json, media_files, batch_size, msg_delay_min, msg_delay_max, batch_delay_seconds, total_recipients, sent_count, failed_count, status, logs_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, '[]', 5, 2, 5, 30, ?, ?, ?, ?, ?, datetime('now', '-${c.hoursAgo} hours'))`,
        [campId, user.id, sessionId, c.name, c.tag, messagesJson, c.total, c.sent, c.failed, c.status, logsJson]
      );
    }

    console.log(`✅ Contabilidad, productos, órdenes y campañas cargadas para ${user.username}.`);
  }

  console.log('\n🎉 ¡Métricas y datos contables inyectados con éxito!');
  process.exit(0);
}

seedAccountingAndMetrics().catch(err => {
  console.error('❌ Error al sembrar contabilidad:', err);
  process.exit(1);
});
