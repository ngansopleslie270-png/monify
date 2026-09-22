const db = require('../config/db');

class Utilisateur {
  static async create(nom, email, motDePasseHash, role = 'utilisateur') {
    const [result] = await db.execute(
      'INSERT INTO utilisateurs (nom_complet, nom_commerce, telephone, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, nom + ' Commerce', '00000000', email, motDePasseHash, role]
    );
    return result.insertId;
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
      'SELECT id, nom_complet as nom, nom_commerce, email, role, actif, created_at as date_creation FROM utilisateurs WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT id, nom_complet as nom, nom_commerce, email, role, actif, created_at as date_creation FROM utilisateurs ORDER BY created_at DESC'
    );
    return rows;
  }

  static async toggleActif(id) {
    const [rows] = await db.execute('SELECT actif FROM utilisateurs WHERE id = ?', [id]);
    if (rows.length === 0) return false;
    
    const newStatus = rows[0].actif === 1 ? 0 : 1;
    await db.execute('UPDATE utilisateurs SET actif = ? WHERE id = ?', [newStatus, id]);
    return newStatus;
  }

  static async deleteById(id) {
    const [result] = await db.execute('DELETE FROM utilisateurs WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Utilisateur;
