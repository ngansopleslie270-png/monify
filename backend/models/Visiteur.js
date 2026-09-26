const db = require('../config/db');

class Visiteur {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS visiteurs (
        id          INT               NOT NULL AUTO_INCREMENT,
        device_id   VARCHAR(255)      NOT NULL,
        created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (device_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.execute(sql);
  }

  static async registerVisit(device_id) {
    await this.createTable();
    // Insert Ignore to avoid duplicates if the same device visits multiple times
    const [result] = await db.execute(
      `INSERT IGNORE INTO visiteurs (device_id) VALUES (?)`,
      [device_id]
    );
    return result.affectedRows;
  }

  static async countVisitors() {
    await this.createTable();
    const [rows] = await db.execute(`SELECT COUNT(*) as total FROM visiteurs`);
    return rows[0].total;
  }
}

module.exports = Visiteur;
