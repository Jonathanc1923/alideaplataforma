const { getDbConnection } = require('./db');

async function check() {
  const db = await getDbConnection();
  const user = await db.get('SELECT * FROM users WHERE username = "alidea"');
  console.log('User alidea:', {
    id: user.id,
    username: user.username,
    business_name: user.business_name,
    password_hash: user.password_hash.substring(0, 10) + '...'
  });

  const session = await db.get('SELECT * FROM sessions WHERE user_id = ?', [user.id]);
  console.log('Session alidea:', session);

  const leads = await db.all('SELECT id, name, stage, deal_value, tags FROM crm_leads WHERE user_id = ?', [user.id]);
  console.log(`Leads (${leads.length}):`, leads.map(l => `${l.name} [${l.stage} - S/ ${l.deal_value}]`));

  const messages = await db.all('SELECT id, sender_name, text FROM chat_messages WHERE user_id = ? LIMIT 5', [user.id]);
  console.log(`Chat Messages Sample (${messages.length}):`, messages);

  const entries = await db.all('SELECT id, entry_date, entry_type, account_name, total_amount FROM accounting_entries WHERE user_id = ?', [user.id]);
  console.log(`Accounting Entries (${entries.length}):`, entries.slice(0, 5));

  const products = await db.all('SELECT id, name, price FROM products WHERE user_id = ?', [user.id]);
  console.log(`Products (${products.length}):`, products);

  const orders = await db.all('SELECT id, order_number, total_amount, status FROM orders WHERE user_id = ?', [user.id]);
  console.log(`Orders (${orders.length}):`, orders);
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
