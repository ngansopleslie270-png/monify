const mysql = require('mysql2/promise');
require('dotenv').config();

// ─────────────────────────────────────────────
// Création du pool de connexions MySQL
// ─────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monify_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// ─────────────────────────────────────────────
// Test de connexion au démarrage
// ─────────────────────────────────────────────
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL connecté → base : ${process.env.DB_NAME || 'monify_db'}`);
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL :', error.message);
    console.error('   Vérifiez les variables DB_* dans le fichier .env');
    // Ne pas quitter le process pour permettre le démarrage sans DB (tests)
  }
};

testConnection();

module.exports = pool;
