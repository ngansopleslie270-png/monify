const db = require('../config/db');

class Compte {
  static async createForUser(utilisateur_id) {
    const [result] = await db.execute(
      'INSERT INTO comptes (utilisateur_id, solde) VALUES (?, ?)',
      [utilisateur_id, 0]
    );
    return result.insertId;
  }

  static async findByUserId(utilisateur_id) {
    const [rows] = await db.execute(
      'SELECT * FROM comptes WHERE utilisateur_id = ?',
      [utilisateur_id]
    );
    if (rows.length === 0) {
      // S'il n'y a pas de compte, on en crée un par défaut
      await this.createForUser(utilisateur_id);
      const [newRows] = await db.execute(
        'SELECT * FROM comptes WHERE utilisateur_id = ?',
        [utilisateur_id]
      );
      return newRows[0];
    }
    return rows[0];
  }

  static async updateSolde(compte_id, montant, type_transaction) {
    // Si c'est une dépense, on soustrait, si c'est un revenu, on ajoute
    const operateur = type_transaction === 'depense' ? '-' : '+';
    await db.execute(
      `UPDATE comptes SET solde = solde ${operateur} ? WHERE id = ?`,
      [montant, compte_id]
    );
  }
}

module.exports = Compte;
