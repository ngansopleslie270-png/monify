const db = require('./backend/config/db');
const Transaction = require('./backend/models/Transaction');

async function testStock() {
  const stock = await Transaction.getProductStock(1, 'Lot de chemises'); // Assuming utilisateur_id = 1
  console.log('Stock pour Lot de chemises:', stock);
  
  const [achats] = await db.execute(`SELECT SUM(quantite) as total FROM transactions WHERE type = 'achat' AND produit_service = 'Lot de chemises'`);
  console.log('Achats:', achats);
  
  process.exit();
}

testStock();
