const db = require('../config/db');

class RapportFinancier {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS rapports_financiers (
        id              INT               NOT NULL AUTO_INCREMENT,
        utilisateur_id  INT               NOT NULL,
        periode         VARCHAR(50)       NOT NULL,
        total_ventes    DECIMAL(15,2)     NOT NULL,
        total_depenses  DECIMAL(15,2)     NOT NULL,
        solde_net       DECIMAL(15,2)     NOT NULL,
        created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.execute(sql);
  }

  static async create({ utilisateur_id, periode, total_ventes, total_depenses, solde_net }) {
    await this.createTable(); // Ensure table exists
    const [result] = await db.execute(
      `INSERT INTO rapports_financiers 
      (utilisateur_id, periode, total_ventes, total_depenses, solde_net) 
      VALUES (?, ?, ?, ?, ?)`,
      [utilisateur_id, periode, total_ventes, total_depenses, solde_net]
    );
    return result.insertId;
  }

  static async findByUserId(utilisateur_id) {
    await this.createTable();
    const [rows] = await db.execute(
      `SELECT * FROM rapports_financiers 
       WHERE utilisateur_id = ? 
       ORDER BY created_at DESC`,
      [utilisateur_id]
    );
    return rows;
  }
}

module.exports = RapportFinancier;
