const db = require('../config/db');

class Transaction {
  static async create({ utilisateur_id, categorie_id, type, produit_service, quantite, prix_unitaire, montant_total, mode_paiement, description }) {
    const [result] = await db.execute(
      `INSERT INTO transactions 
      (utilisateur_id, categorie_id, type, produit_service, quantite, prix_unitaire, montant_total, mode_paiement, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [utilisateur_id, categorie_id, type, produit_service, quantite, prix_unitaire, montant_total, mode_paiement, description]
    );
    return result.insertId;
  }

  static async findByUserId(utilisateur_id) {
    const [rows] = await db.execute(
      `SELECT t.*, c.nom as categorie_nom 
       FROM transactions t 
       LEFT JOIN categories c ON t.categorie_id = c.id 
       WHERE t.utilisateur_id = ? 
       ORDER BY t.date_operation DESC`,
      [utilisateur_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM transactions WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async deleteById(id) {
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }

  static async updateById(id, { categorie_id, type, produit_service, quantite, prix_unitaire, montant_total, mode_paiement, description }) {
    const [result] = await db.execute(
      `UPDATE transactions 
       SET categorie_id = ?, type = ?, produit_service = ?, quantite = ?, prix_unitaire = ?, montant_total = ?, mode_paiement = ?, description = ?
       WHERE id = ?`,
      [categorie_id, type, produit_service, quantite, prix_unitaire, montant_total, mode_paiement, description, id]
    );
    return result.affectedRows;
  }

  static async getStatsByUserId(utilisateur_id) {
    const [rows] = await db.execute(
      `SELECT type, SUM(montant_total) as total 
       FROM transactions 
       WHERE utilisateur_id = ? 
       GROUP BY type`,
      [utilisateur_id]
    );
    return rows;
  }

  static async getStatsByCategory(utilisateur_id) {
    const [rows] = await db.execute(
      `SELECT c.nom, c.type, COUNT(t.id) as count, SUM(t.montant_total) as total 
       FROM transactions t
       JOIN categories c ON t.categorie_id = c.id
       WHERE t.utilisateur_id = ?
       GROUP BY c.id, c.nom, c.type
       ORDER BY total DESC`,
      [utilisateur_id]
    );
    return rows;
  }

  static async getDashboardMetrics(utilisateur_id) {
    const [rows] = await db.execute(
      `SELECT 
          type, 
          COUNT(id) as nb_operations, 
          SUM(montant_total) as total 
       FROM transactions 
       WHERE utilisateur_id = ? 
         AND MONTH(date_operation) = MONTH(CURRENT_DATE()) 
         AND YEAR(date_operation) = YEAR(CURRENT_DATE())
       GROUP BY type`,
      [utilisateur_id]
    );
    return rows;
  }

  static async getProductStock(utilisateur_id, produit_service, exclude_transaction_id = null) {
    let queryAchats = `SELECT SUM(quantite) as total FROM transactions WHERE utilisateur_id = ? AND type = 'achat' AND produit_service = ?`;
    let queryVentes = `SELECT SUM(quantite) as total FROM transactions WHERE utilisateur_id = ? AND type = 'vente' AND produit_service = ?`;
    let params = [utilisateur_id, produit_service];

    if (exclude_transaction_id) {
      queryAchats += ` AND id != ?`;
      queryVentes += ` AND id != ?`;
      params.push(exclude_transaction_id);
    }

    const [achats] = await db.execute(queryAchats, params);
    const [ventes] = await db.execute(queryVentes, params);

    const totalA = achats[0]?.total || 0;
    const totalV = ventes[0]?.total || 0;

    return parseFloat(totalA) - parseFloat(totalV);
  }
}

module.exports = Transaction;
