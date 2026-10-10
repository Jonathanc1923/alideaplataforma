const { getDbConnection } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedMockData() {
  console.log('🚀 Iniciando sembrado de 10 conversaciones ficticias para Alidea...');
  const db = await getDbConnection();

  // 1. Asegurar o identificar usuarios objetivo: 'jony', 'demo', 'alidea'
  let targetUsers = await db.all('SELECT id, username, business_name FROM users WHERE username IN (?, ?, ?)', ['jony', 'demo', 'alidea']);

  // Si no existe usuario alidea, crearlo también para máxima compatibilidad
  const hasAlidea = targetUsers.some(u => u.username === 'alidea');
  if (!hasAlidea) {
    const alideaId = 'user-alidea-oficial';
    const pwdHash = hashPassword('alidea123');
    await db.run(
      `INSERT OR IGNORE INTO users (id, username, password_hash, business_name, role, plan, currency_code, currency_symbol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [alideaId, 'alidea', pwdHash, 'Alidea Academia', 'user', 'Plan Pro', 'PEN', 'S/']
    );
    const alideaSessionId = 'session-alidea-oficial';
    await db.run(
      `INSERT OR IGNORE INTO sessions (id, user_id, session_name, status, phone_number, ai_enabled)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [alideaSessionId, alideaId, 'Alidea Bot Principal', 'CONNECTED', '51907318642']
    );
  }

  // Volver a consultar todos los usuarios destinatarios
  targetUsers = await db.all('SELECT id, username, business_name FROM users WHERE username IN (?, ?, ?)', ['jony', 'demo', 'alidea']);
  console.log(`👤 Usuarios encontrados para poblar: ${targetUsers.map(u => u.username).join(', ')}`);

  // Lista de 10 conversaciones realistas y completas
  const mockConversations = [
    {
      name: 'Carlos Mendoza',
      phone: '+51984123456',
      cleanPhone: '51984123456',
      email: 'carlos.mendoza.peru@gmail.com',
      stage: 'ganado',
      dealValue: 49.00,
      source: 'facebook_ads',
      tags: 'VIP, Pagado, Yape, Ecosistema S/49',
      notes: 'Cliente transfirió por Yape S/ 49. Acceso al aula virtual y Bot IA activado exitosamente.',
      timeOffsetHours: 1,
      messages: [
        { fromMe: 0, text: 'Hola Alidea, vi el anuncio en Facebook sobre el Ecosistema de Ventas IA por S/ 49. ¿Sigue disponible la oferta?' },
        { fromMe: 1, text: '¡Hola Carlos! ⚡ Qué gusto saludarte. Soy el Asistente IA de Alidea Academia. ¡Sí, exactamente! La promoción del Ecosistema de Ventas IA 24/7 por solo S/ 49 está activa por tiempo limitado (pago único, sin mensualidades).' },
        { fromMe: 0, text: 'Excelente. ¿Qué incluye exactamente y cómo hago para pagar por Yape?' },
        { fromMe: 1, text: 'Te incluye:\n✅ Curso completo de Marketing & Anuncios con IA.\n✅ Tu propio Bot de WhatsApp 24/7 alojado por 1 año.\n✅ CRM de gestión y seguimiento de clientes.\n\n📲 Puedes cancelar S/ 49 al Yape/Plin: 907 318 642 a nombre de Alidea Academia. Envíame la captura por aquí.' },
        { fromMe: 0, text: 'Listo, aquí te adjunto la captura del Yape por S/ 49. Mi nombre es Carlos Mendoza.' },
        { fromMe: 1, text: '🎉 ¡Pago confirmado Carlos! Bienvenido al Ecosistema Alidea. Tus credenciales son:\n👤 Usuario: carlos.mendoza\n🔑 Acceso: https://academia.alidea.pe\n\nTu bot ya está listo para configurarse.' }
      ]
    },
    {
      name: 'Dra. Valeria Ruiz - Clínica Dental',
      phone: '+51972654321',
      cleanPhone: '51972654321',
      email: 'contacto@odontoruiz.com',
      stage: 'propuesta',
      dealValue: 49.00,
      source: 'instagram',
      tags: 'Clínica Dental, Interesado, Cita Agendada',
      notes: 'Requiere bot para automatizar respuestas de precios de brackets y blanqueamiento.',
      timeOffsetHours: 3,
      messages: [
        { fromMe: 0, text: 'Buenas tardes, tengo una clínica odontológica. ¿El bot puede responder las dudas de precios de ortodoncia y agendar citas automáticamente?' },
        { fromMe: 1, text: '¡Buenas tardes Dra. Valeria! 🩺 Por supuesto. Nuestro Bot IA clasifica a los pacientes según el tratamiento (brackets, implantes, profilaxis) y les envía tus horarios disponibles de forma 100% autónoma.' },
        { fromMe: 0, text: 'Me parece genial porque actualmente pierdo muchos pacientes en las noches cuando no estamos en la clínica.' },
        { fromMe: 1, text: 'Exacto, el Bot responde en menos de 3 segundos las 24 horas. ¿Deseas que te reservemos el acceso promocional por S/ 49 con pago Yape o Tarjeta?' },
        { fromMe: 0, text: 'Por favor, resérvamelo. En una hora que termine mi consulta te transfiero por Yape.' }
      ]
    },
    {
      name: 'Ing. Fernando Castillo - Inmobiliaria',
      phone: '+51961889012',
      cleanPhone: '51961889012',
      email: 'fcastillo@horizoninmobiliaria.pe',
      stage: 'negociacion',
      dealValue: 149.00,
      source: 'google_ads',
      tags: 'Inmobiliaria, Proyectos, Telemetría BI',
      notes: 'Interesado en gestionar 5 asesores y campañas masivas de retargeting de departamentos.',
      timeOffsetHours: 5,
      messages: [
        { fromMe: 0, text: 'Buenos días, manejamos proyectos inmobiliarios en San Isidro y Miraflores. ¿El CRM permite segmentar compradores por rango de presupuesto?' },
        { fromMe: 1, text: '¡Buenos días Ing. Fernando! 🏢 Efectivamente. El panel incluye etiquetas comerciales inteligentes, embudo de ventas (Kanban) y difusión masiva con delays anti-bloqueo para invitar a tus prospectos a los Open House.' },
        { fromMe: 0, text: '¿Puedo conectar varios números o ver las métricas de cuántos leads ingresan cada día?' },
        { fromMe: 1, text: 'Sí, la sección de Telemetría & BI te grafica en tiempo real los ingresos, leads por canal y efectividad de cada asesor en vivo.' },
        { fromMe: 0, text: 'Muy completo. Pásame los datos de cuenta bancaria BCP o enlace de pago corporativo por favor.' }
      ]
    },
    {
      name: 'Mariana Paredes - Boutique & Moda',
      phone: '+51993445120',
      cleanPhone: '51993445120',
      email: 'mariana.boutique@gmail.com',
      stage: 'contactado',
      dealValue: 49.00,
      source: 'tiktok',
      tags: 'E-commerce, Catálogo PDF, Calzado',
      notes: 'Le enviamos el catálogo y video demostrativo. Vende vestidos de fiesta.',
      timeOffsetHours: 8,
      messages: [
        { fromMe: 0, text: 'Hola! Vi el video en TikTok. ¿Cómo hace el bot para enviar las fotos de los vestidos cuando la gente pide catálogo?' },
        { fromMe: 1, text: '¡Hola Mariana! 👗 El sistema detecta automáticamente palabras como "catálogo", "precios", "tallas" o "fotos" y envía al instante tu PDF o imágenes en alta resolución con la lista de precios.' },
        { fromMe: 0, text: '¡Qué maravilla! Justo lo que necesito para no tener que estar enviando fotos una por una todo el día.' },
        { fromMe: 1, text: 'Totalmente. Te ahorra hasta 4 horas diarias de trabajo repetitivo. Aprovecha la promoción única de S/ 49 antes de que finalice hoy.' }
      ]
    },
    {
      name: 'Lic. Roberto Gómez - Academia Pre',
      phone: '+51950112334',
      cleanPhone: '51950112334',
      email: 'director@academiapre.edu.pe',
      stage: 'ganado',
      dealValue: 49.00,
      source: 'whatsapp',
      tags: 'Educación, Pagado, Plin, Alumno Activo',
      notes: 'Matrícula de ciclo verano 2026. Pagó por Plin.',
      timeOffsetHours: 12,
      messages: [
        { fromMe: 0, text: 'Hola, deseo adquirir el Ecosistema para nuestra sede central de informes preuniversitarios.' },
        { fromMe: 1, text: '¡Hola Lic. Roberto! Un gusto saludarte. Con el Ecosistema Alidea podrás automatizar la entrega de mallas curriculares, costos de matrícula y horarios de clase automáticamente.' },
        { fromMe: 0, text: 'Excelente. Acabo de hacer el pago por Plin por S/ 49.' },
        { fromMe: 1, text: '¡Recibido con éxito! 🎓 Tu plataforma ya está activa con acceso ilimitado durante 1 año. Ya puedes escanear el QR y comenzar a atender a tus postulantes.' }
      ]
    },
    {
      name: 'Andrea Benavides - Cusco Travel Agency',
      phone: '+51941778990',
      cleanPhone: '51941778990',
      email: 'andrea@cuscoadventuretours.com',
      stage: 'negociacion',
      dealValue: 99.00,
      source: 'facebook_ads',
      tags: 'Turismo, Cusco Tours, Retargeting Activo',
      notes: 'Interesada en recontactar a 2,000 turistas que viajaron el año pasado con paquetes a Machu Picchu.',
      timeOffsetHours: 16,
      messages: [
        { fromMe: 0, text: 'Hola amigos de Alidea, tengo una base de datos de 2000 turistas en Excel. ¿Puedo importar sus contactos y mandarles una oferta especial de Semana Santa?' },
        { fromMe: 1, text: '¡Hola Andrea! 🏔️ Claro que sí. En la pestaña "Emisión" puedes importar tu base de clientes y lanzar difusiones segmentadas por lotes de 5 a 10 contactos con intervalos aleatorios para proteger tu WhatsApp.' },
        { fromMe: 0, text: '¡Espectacular! ¿Y les puedo adjuntar el PDF del itinerario con fotos del tour a la Montaña de 7 Colores?' },
        { fromMe: 1, text: 'Exactamente, permite texto enriquecido, imágenes, audios y documentos PDF en el mismo envío.' }
      ]
    },
    {
      name: 'Gustavo Morales - Taller & Autopartes',
      phone: '+51987234567',
      cleanPhone: '51987234567',
      email: 'repuestos.morales@hotmail.com',
      stage: 'nuevo',
      dealValue: 49.00,
      source: 'facebook_ads',
      tags: 'Autopartes, Nuevo Lead, Cotización',
      notes: 'Nuevo contacto solicitando información general sobre cómo cargar su inventario de repuestos.',
      timeOffsetHours: 20,
      messages: [
        { fromMe: 0, text: 'Buenas noches, vi su publicidad de automatización para negocios. ¿Cómo me sirve para un taller de mecánica y venta de baterías y aceites?' },
        { fromMe: 1, text: '¡Buenas noches Gustavo! 🚗 Te permite registrar tus repuestos y servicios en el Catálogo Digital, enviar presupuestos rápidos por WhatsApp y llevar el control contable de tus ingresos diarios.' },
        { fromMe: 0, text: '¿Es difícil de configurar? No soy muy tecnológico.' },
        { fromMe: 1, text: 'Para nada Gustavo, el sistema viene pre-configurado y en el curso paso a paso te enseñamos a dejarlo funcionando en solo 15 minutos.' }
      ]
    },
    {
      name: 'Lucía Santillán - Belleza & Spa',
      phone: '+51963852741',
      cleanPhone: '51963852741',
      email: 'luciasantillan.spa@gmail.com',
      stage: 'ganado',
      dealValue: 49.00,
      source: 'instagram',
      tags: 'Spa, Pagado, Tarjeta, Acceso Enviado',
      notes: 'Pagó con tarjeta Visa. Ya sincronizó su WhatsApp Business con Alidea Bot.',
      timeOffsetHours: 24,
      messages: [
        { fromMe: 0, text: 'Hola! Pagué por la web con tarjeta Visa los S/ 49. ¿Por dónde entro al panel?' },
        { fromMe: 1, text: '¡Hola Lucía! 🌸 Muchas gracias por tu compra. Te confirmamos el registro. Tu usuario es tu correo (luciasantillan.spa@gmail.com) y tu acceso ya está disponible.' },
        { fromMe: 0, text: '¡Muchas gracias! Ya entré y está súper claro el video de bienvenida. Ya vinculé mi QR.' },
        { fromMe: 1, text: '¡Genial Lucía! A romperla en ventas con tu Spa. Cualquier consulta estamos para apoyarte. ✨' }
      ]
    },
    {
      name: 'Marcos Alarcón - Sabor Criollo Restaurant',
      phone: '+51978965214',
      cleanPhone: '51978965214',
      email: 'marcos.alida.delivery@gmail.com',
      stage: 'propuesta',
      dealValue: 49.00,
      source: 'facebook_ads',
      tags: 'Restaurante, Delivery, Carta Digital',
      notes: 'Quiere que el bot envíe la carta del día a las 11:30 AM a clientes de oficinas cercanas.',
      timeOffsetHours: 28,
      messages: [
        { fromMe: 0, text: 'Hola, tengo un restaurante en San Borja. ¿Puedo programar envíos del menú ejecutivo diario a mis clientes habituales?' },
        { fromMe: 1, text: '¡Hola Marcos! 🍲 Totalmente. Puedes usar la función de "Emisión" de Alidea para mandar la carta del día con fotos de los platos en 1 solo clic a todos tus comensales registrados.' },
        { fromMe: 0, text: 'Perfecto, eso me ahorraría mucho tiempo. ¿Hasta cuándo dura la oferta de S/ 49?' },
        { fromMe: 1, text: 'El precio especial de S/ 49 se mantiene si realizas tu activación el día de hoy.' }
      ]
    },
    {
      name: 'Diana Cárdenas - Joyería Fina',
      phone: '+51991321654',
      cleanPhone: '51991321654',
      email: 'diana.joyas@gmail.com',
      stage: 'contactado',
      dealValue: 49.00,
      source: 'instagram',
      tags: 'Joyería, Seguimiento 24h, Consulta Pagos',
      notes: 'Consultó sobre pagos recurrentes. Aclarado que es 1 solo pago anual sin letra chica.',
      timeOffsetHours: 32,
      messages: [
        { fromMe: 0, text: 'Hola, una consulta sincera: ¿después de pagar los S/ 49 me van a cobrar mensualidades adicionales?' },
        { fromMe: 1, text: '¡Hola Diana! ✨ Cero letras pequeñas. En Alidea Academia haces un ÚNICO PAGO de S/ 49. Con eso tienes 1 año completo de servidor para tu Bot, la plantilla de CRM de Ventas y el curso completo de Marketing con IA. ¡Sin cobros sorpresa!' },
        { fromMe: 0, text: '¡Qué tranquilidad! Había probado otros programas que cobraban 30 dólares al mes. Me parece una excelente oportunidad.' },
        { fromMe: 1, text: '¡Exacto! Nuestro objetivo es que todo emprendedor pueda automatizar sus ventas sin desangrarse en mensualidades.' }
      ]
    }
  ];

  // Tags estándar para registrar en crm_tags
  const defaultTags = [
    { name: 'VIP', color: '#ec4899' },
    { name: 'Pagado', color: '#10b981' },
    { name: 'Yape', color: '#8b5cf6' },
    { name: 'Plin', color: '#06b6d4' },
    { name: 'Tarjeta', color: '#3b82f6' },
    { name: 'Interesado', color: '#f59e0b' },
    { name: 'Catálogo Enviado', color: '#6366f1' },
    { name: 'Seguimiento 24h', color: '#f97316' },
    { name: 'Nuevo Lead', color: '#14b8a6' },
    { name: 'Clínica Dental', color: '#0ea5e9' },
    { name: 'Inmobiliaria', color: '#64748b' },
    { name: 'E-commerce', color: '#d946ef' },
    { name: 'Turismo', color: '#84cc16' },
    { name: 'Restaurante', color: '#e11d48' }
  ];

  for (const user of targetUsers) {
    console.log(`\n📦 Procesando datos para usuario '${user.username}' (ID: ${user.id})...`);

    // Obtener la sesión asociada a este usuario
    let session = await db.get('SELECT id FROM sessions WHERE user_id = ?', [user.id]);
    if (!session) {
      const newSessionId = `session-${user.id}`;
      await db.run(
        `INSERT INTO sessions (id, user_id, session_name, status, phone_number, ai_enabled)
         VALUES (?, ?, ?, 'CONNECTED', '51907318642', 1)`,
        [newSessionId, user.id, `${user.business_name || user.username} Bot`]
      );
      session = { id: newSessionId };
    }
    const sessionId = session.id;

    // 1. Insertar Tags
    for (const tag of defaultTags) {
      await db.run(
        `INSERT OR IGNORE INTO crm_tags (id, user_id, name, color, ai_disabled)
         VALUES (?, ?, ?, ?, 0)`,
        [`tag-${user.id}-${tag.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, user.id, tag.name, tag.color]
      );
    }

    // 2. Insertar Leads y Conversaciones
    for (let i = 0; i < mockConversations.length; i++) {
      const conv = mockConversations[i];
      const leadId = `lead-${user.id}-${i + 1}`;
      const jid = `${conv.cleanPhone}@s.whatsapp.net`;
      const baseTime = new Date(Date.now() - conv.timeOffsetHours * 3600 * 1000);
      const lastMsg = conv.messages[conv.messages.length - 1].text;

      // Insertar o actualizar Lead
      await db.run(
        `INSERT INTO crm_leads (
          id, user_id, name, phone, email, stage, deal_value, source, tags, notes, last_message, ai_disabled, last_interaction, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          phone = excluded.phone,
          email = excluded.email,
          stage = excluded.stage,
          deal_value = excluded.deal_value,
          source = excluded.source,
          tags = excluded.tags,
          notes = excluded.notes,
          last_message = excluded.last_message,
          last_interaction = excluded.last_interaction,
          updated_at = excluded.updated_at`,
        [
          leadId,
          user.id,
          conv.name,
          conv.phone,
          conv.email,
          conv.stage,
          conv.dealValue,
          conv.source,
          conv.tags,
          conv.notes,
          lastMsg,
          baseTime.toISOString(),
          baseTime.toISOString(),
          baseTime.toISOString()
        ]
      );

      // Limpiar mensajes anteriores de este JID para este usuario si existían
      await db.run('DELETE FROM chat_messages WHERE user_id = ? AND jid = ?', [user.id, jid]);

      // Insertar mensajes de chat secuenciales con timestamps coherentes
      for (let mIdx = 0; mIdx < conv.messages.length; mIdx++) {
        const msg = conv.messages[mIdx];
        const msgTime = new Date(baseTime.getTime() + mIdx * 90 * 1000); // separados por 1.5 minutos
        const msgId = `msg-${user.id}-${i + 1}-${mIdx + 1}-${Date.now().toString(36)}`;

        await db.run(
          `INSERT INTO chat_messages (
            id, user_id, session_id, jid, sender_phone, sender_name, from_me, text, media_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
          [
            msgId,
            user.id,
            sessionId,
            jid,
            conv.cleanPhone,
            msg.fromMe ? (user.business_name || 'Alidea Academia') : conv.name,
            msg.fromMe ? 1 : 0,
            msg.text,
            msgTime.toISOString()
          ]
        );
      }

      // Insertar una actividad en el CRM para este lead
      await db.run(
        `INSERT OR IGNORE INTO crm_activities (id, lead_id, user_id, type, content, created_at)
         VALUES (?, ?, ?, 'system', ?, ?)`,
        [
          `act-${user.id}-${i + 1}`,
          leadId,
          user.id,
          `Chat iniciado vía ${conv.source}. Estado: ${conv.stage.toUpperCase()}`,
          baseTime.toISOString()
        ]
      );
    }

    // 3. Crear 3 tareas/misiones de ejemplo para el panel
    const sampleTasks = [
      { title: `Enviar credenciales a Carlos Mendoza`, desc: 'Confirmó pago Yape S/ 49.', prio: 'alta', due: new Date().toISOString().slice(0, 10), time: '11:30 AM', status: 'completada' },
      { title: `Seguimiento con Dra. Valeria Ruiz`, desc: 'Llamar después de su consulta dental para coordinar demo del bot.', prio: 'alta', due: new Date().toISOString().slice(0, 10), time: '04:00 PM', status: 'pendiente' },
      { title: `Preparar propuesta empresarial Inmobiliaria Horizon`, desc: 'Cotización para 5 asesores y módulo de BI.', prio: 'media', due: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: '10:00 AM', status: 'pendiente' }
    ];

    for (let tIdx = 0; tIdx < sampleTasks.length; tIdx++) {
      const task = sampleTasks[tIdx];
      await db.run(
        `INSERT OR IGNORE INTO crm_tasks (id, user_id, lead_id, title, description, due_date, due_time, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`task-${user.id}-${tIdx + 1}`, user.id, `lead-${user.id}-${tIdx + 1}`, task.title, task.desc, task.due, task.time, task.prio, task.status]
      );
    }

    console.log(`✅ 10 conversaciones, leads y tareas inyectados con éxito para ${user.username}.`);
  }

  console.log('\n🎉 ¡Sembrado de datos ficticios completado al 100%!');
  process.exit(0);
}

seedMockData().catch(err => {
  console.error('❌ Error al sembrar datos:', err);
  process.exit(1);
});
