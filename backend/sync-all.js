const { getDbConnection } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function syncAllUsersAndData() {
  const db = await getDbConnection();
  const pwdHash = hashPassword('123456');

  console.log('🔄 Sincronizando contraseñas y desbloqueos para todos los usuarios...');

  // 1. Actualizar contraseñas de todos los usuarios a '123456' y desbloquear
  await db.run(
    `UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, is_active = 1`,
    [pwdHash]
  );

  // 2. Asegurar que 'alidea' exista con id 'user-alidea-oficial'
  await db.run(
    `INSERT OR IGNORE INTO users (id, username, password_hash, business_name, role, plan, currency_code, currency_symbol, is_active, failed_login_attempts, locked_until)
     VALUES ('user-alidea-oficial', 'alidea', ?, 'Alidea Academia', 'user', 'Plan Pro', 'PEN', 'S/', 1, 0, NULL)`,
    [pwdHash]
  );

  // 3. Ejecutar los seeders completos
  console.log('🚀 Ejecutando seeders de chats y contabilidad...');
  const users = await db.all('SELECT id, username FROM users');
  for (const u of users) {
    console.log(`- Usuario: ${u.username} (ID: ${u.id})`);
  }

  console.log('✅ Todo sincronizado correctamente.');
}

syncAllUsersAndData().then(() => {
  // Run mock chats seed & accounting seed
  require('./seed-mock-chats');
  require('./seed-accounting-metrics');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
