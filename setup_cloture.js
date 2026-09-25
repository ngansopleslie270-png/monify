const db = require('./backend/config/db');

async function createTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS caisse_journaliere (
        id INT AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT NOT NULL,
        date_cloture DATE NOT NULL,
        solde_final DECIMAL(15, 2) NOT NULL,
        total_ventes DECIMAL(15, 2) NOT NULL,
        total_depenses DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    );
  `);
  console.log('Table caisse_journaliere créée avec succès.');
  process.exit();
}

createTable();
