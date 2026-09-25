const db = require('../config/db');

class Utilisateur {
  static async create(nom, commerce, typeActivite, telephone, email, motDePasseHash, role = 'commerçant') {
    const [result] = await db.execute(
      'INSERT INTO utilisateurs (nom, commerce, type_activite, telephone, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, commerce, typeActivite, telephone, email, motDePasseHash, role]
    );
    return result.insertId;
  }

  static async findByEmailOrPhone(identifier) {
    const [rows] = await db.execute(
      'SELECT * FROM utilisateurs WHERE email = ? OR telephone = ?',
      [identifier, identifier]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, nom, commerce, type_activite, telephone, email, role, created_at FROM utilisateurs WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT id, nom, commerce, type_activite, telephone, email, role, created_at FROM utilisateurs ORDER BY created_at DESC'
    );
    return rows;
  }

  static async deleteById(id) {
    const [result] = await db.execute('DELETE FROM utilisateurs WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Utilisateur;
