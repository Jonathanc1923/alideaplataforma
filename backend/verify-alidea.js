const { getDbConnection } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyAndFixAlidea() {
  const db = await getDbConnection();
  const pwdHash = hashPassword('123456');

  console.log('🔍 Buscando usuario alidea en la base de datos...');
  let alidea = await db.get('SELECT * FROM users WHERE LOWER(username) = "alidea"');

  if (!alidea) {
    console.log('⚠️ Usuario alidea no existía, creándolo...');
    const alideaId = 'user-alidea-oficial';
    await db.run(
      `INSERT INTO users (id, username, password_hash, business_name, role, plan, currency_code, currency_symbol, is_active, failed_login_attempts, locked_until)
       VALUES (?, 'alidea', ?, 'Alidea Academia', 'user', 'Plan Pro', 'PEN', 'S/', 1, 0, NULL)`,
      [alideaId, pwdHash]
    );
    alidea = await db.get('SELECT * FROM users WHERE id = ?', [alideaId]);
  } else {
    console.log(`✅ Usuario alidea encontrado (ID: ${alidea.id}). Actualizando contraseña a '123456' y desbloqueando...`);
    await db.run(
      `UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, is_active = 1 WHERE id = ?`,
      [pwdHash, alidea.id]
    );
  }

  // Asegurar sesión de alidea
  let session = await db.get('SELECT * FROM sessions WHERE user_id = ?', [alidea.id]);
  if (!session) {
    const sessionId = `session-${alidea.id}`;
    await db.run(
      `INSERT INTO sessions (id, user_id, session_name, status, phone_number, ai_enabled)
       VALUES (?, ?, 'Alidea Bot Principal', 'CONNECTED', '51907318642', 1)`,
      [sessionId, alidea.id]
    );
    session = await db.get('SELECT * FROM sessions WHERE user_id = ?', [alidea.id]);
  }

  console.log(`🔑 Sesión asociada para alidea: ${session.id}`);

  // Verificar cuántos registros tiene alidea en cada tabla
  const leadsCount = await db.get('SELECT COUNT(*) as count FROM crm_leads WHERE user_id = ?', [alidea.id]);
  const msgsCount = await db.get('SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?', [alidea.id]);
  const entriesCount = await db.get('SELECT COUNT(*) as count FROM accounting_entries WHERE user_id = ?', [alidea.id]);
  const productsCount = await db.get('SELECT COUNT(*) as count FROM products WHERE user_id = ?', [alidea.id]);
  const ordersCount = await db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [alidea.id]);
  const campaignsCount = await db.get('SELECT COUNT(*) as count FROM retargeting_campaigns WHERE user_id = ?', [alidea.id]);
  const tasksCount = await db.get('SELECT COUNT(*) as count FROM crm_tasks WHERE user_id = ?', [alidea.id]);

  console.log('\n📊 ESTADO DE DATOS PARA USUARIO alidea:');
  console.log(`- Leads en CRM: ${leadsCount.count}`);
  console.log(`- Mensajes en Chat: ${msgsCount.count}`);
  console.log(`- Asientos en Bóveda (Contabilidad): ${entriesCount.count}`);
  console.log(`- Productos en Catálogo: ${productsCount.count}`);
  console.log(`- Órdenes de Venta: ${ordersCount.count}`);
  console.log(`- Campañas de Emisión (Retargeting): ${campaignsCount.count}`);
  console.log(`- Tareas / Misiones: ${tasksCount.count}`);

  // Si tiene 0 en algo, re-ejecutamos los seeders
  if (leadsCount.count === 0 || entriesCount.count === 0) {
    console.log('🔄 Ejecutando seeders de datos para completar el usuario alidea...');
    require('./seed-mock-chats');
    require('./seed-accounting-metrics');
  }

  console.log('\n🎉 Usuario alidea verificado y listo con contraseña: 123456');
}

verifyAndFixAlidea().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
