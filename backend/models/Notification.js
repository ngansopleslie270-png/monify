const db = require('../config/db');

class Notification {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS notifications (
        id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        utilisateur_id  INT UNSIGNED      NOT NULL,
        type            VARCHAR(50)       NOT NULL,
        message         TEXT              NOT NULL,
        lu              TINYINT(1)        NOT NULL DEFAULT 0,
        created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.execute(sql);
  }

  static async create({ utilisateur_id, type, message }) {
    await this.createTable();
    const [result] = await db.execute(
      `INSERT INTO notifications (utilisateur_id, type, message) VALUES (?, ?, ?)`,
      [utilisateur_id, type, message]
    );
    return result.insertId;
  }

  static async findByUserId(utilisateur_id) {
    await this.createTable();
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC`,
      [utilisateur_id]
    );
    return rows;
  }

  static async countUnread(utilisateur_id) {
    await this.createTable();
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE utilisateur_id = ? AND lu = 0`,
      [utilisateur_id]
    );
    return rows[0].count;
  }

  static async markAsRead(id, utilisateur_id) {
    await this.createTable();
    const [result] = await db.execute(
      `UPDATE notifications SET lu = 1 WHERE id = ? AND utilisateur_id = ?`,
      [id, utilisateur_id]
    );
    return result.affectedRows;
  }

  static async markAllAsRead(utilisateur_id) {
    await this.createTable();
    const [result] = await db.execute(
      `UPDATE notifications SET lu = 1 WHERE utilisateur_id = ?`,
      [utilisateur_id]
    );
    return result.affectedRows;
  }
}

module.exports = Notification;
