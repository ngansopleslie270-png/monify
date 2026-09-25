const db = require('./backend/config/db');

async function checkStock() {
  const [rows] = await db.execute('SELECT id, type, produit_service, quantite FROM transactions');
  console.log(rows);
  process.exit();
}

checkStock();
