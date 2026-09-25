const db = require('../config/db');

class Categorie {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY type, nom');
    return rows;
  }

  static async findByType(type) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE type = ? ORDER BY nom', [type]);
    return rows;
  }

  static async create({ utilisateur_id, nom, type, color, icon }) {
    const [result] = await db.execute(
      'INSERT INTO categories (utilisateur_id, nom, type, color, icon) VALUES (?, ?, ?, ?, ?)',
      [utilisateur_id || null, nom, type || 'general', color || '#607D8B', icon || 'tag']
    );
    return result.insertId;
  }

  static async createDefaultCategories() {
    const count = await this.findAll();
    if (count.length === 0) {
      const defaultCategories = [
        { nom: 'Alimentation', type: 'revenu' },
        { nom: 'Vêtements', type: 'revenu' },
        { nom: 'Boissons', type: 'revenu' },
        { nom: 'Loyer', type: 'depense' },
        { nom: 'Électricité', type: 'depense' },
        { nom: 'Transport', type: 'depense' }
      ];

      for (let cat of defaultCategories) {
        await db.execute('INSERT INTO categories (nom, type) VALUES (?, ?)', [cat.nom, cat.type]);
      }
    }
  }
}

module.exports = Categorie;
