const Transaction = require('../models/Transaction');
// const notificationService = require('../services/notificationService');

const createTransaction = async (req, res) => {
  try {
    const { categorie_id, type, produit_service, quantite, prix_unitaire, mode_paiement, description } = req.body;
    const utilisateur_id = req.user.id;

    if (!type || !produit_service || !quantite || !prix_unitaire) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations obligatoires.' });
    }

    // Vérification du stock si c'est une vente
    if (type === 'vente') {
      const stockActuel = await Transaction.getProductStock(utilisateur_id, produit_service);
      if (stockActuel < parseFloat(quantite)) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour '${produit_service}'. Stock actuel : ${stockActuel}, Quantité demandée : ${quantite}` 
        });
      }
    }

    const montant_total = parseFloat(quantite) * parseFloat(prix_unitaire);

    // Insérer la transaction
    const transactionId = await Transaction.create({
      utilisateur_id,
      categorie_id: categorie_id || null,
      type,
      produit_service,
      quantite,
      prix_unitaire,
      montant_total,
      mode_paiement: mode_paiement || 'especes',
      description: description || ''
    });

    // Vérifier les règles de notification de budget (Phase 6)
    // if (type === 'depense') {
    //   await notificationService.checkTransactionRules(utilisateur_id);
    // }

    res.status(201).json({
      message: 'Transaction enregistrée avec succès.',
      transactionId
    });
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const dateQuery = req.query.date;
    
    let transactions = await Transaction.findByUserId(utilisateur_id);
    
    if (dateQuery) {
      transactions = transactions.filter(t => new Date(t.date_operation).toISOString().split('T')[0] === dateQuery);
    }
    
    // Calculer le solde actuel sur la volée
    const stats = await Transaction.getDashboardMetrics(utilisateur_id);
    let solde = 0;
    stats.forEach(s => {
      if (s.type === 'vente' || s.type === 'revenu') solde += parseFloat(s.total);
      if (s.type === 'depense' || s.type === 'achat') solde -= parseFloat(s.total);
    });
    
    solde = Math.round(solde);

    res.status(200).json({
      transactions,
      solde
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur_id = req.user.id;

    // Retrouver la transaction
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction introuvable.' });
    }

    // Vérifier que la transaction appartient bien à l'utilisateur
    if (transaction.utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    // Si on supprime un achat, on vérifie que cela ne rend pas le stock négatif
    if (transaction.type === 'achat') {
      const stockActuel = await Transaction.getProductStock(utilisateur_id, transaction.produit_service, id);
      if (stockActuel < 0) {
        return res.status(400).json({ 
          message: `Impossible de supprimer cet achat. Des ventes ont déjà été effectuées pour '${transaction.produit_service}'.` 
        });
      }
    }

    // Supprimer la transaction
    await Transaction.deleteById(id);

    res.status(200).json({ message: 'Transaction supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la transaction:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { categorie_id, type, produit_service, quantite, prix_unitaire, mode_paiement, description } = req.body;
    const utilisateur_id = req.user.id;

    if (!type || !produit_service || !quantite || !prix_unitaire) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations obligatoires.' });
    }

    // Retrouver l'ancienne transaction
    const oldTransaction = await Transaction.findById(id);
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction introuvable.' });
    }

    if (oldTransaction.utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    // Vérification du stock si c'est une vente
    if (type === 'vente') {
      const stockActuel = await Transaction.getProductStock(utilisateur_id, produit_service, id);
      if (stockActuel < parseFloat(quantite)) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour '${produit_service}'. Stock actuel : ${stockActuel}, Quantité demandée : ${quantite}` 
        });
      }
    }

    // Si on modifie un achat (baisse de quantité par exemple)
    if (type === 'achat') {
      const stockActuel = await Transaction.getProductStock(utilisateur_id, produit_service, id);
      const stockFutur = stockActuel + parseFloat(quantite);
      if (stockFutur < 0) {
        return res.status(400).json({ 
          message: `Impossible de réduire la quantité à ${quantite}. Des ventes ont déjà été effectuées et le stock deviendrait négatif.` 
        });
      }
    }

    // Calcul du nouveau montant
    const montant_total = parseFloat(quantite) * parseFloat(prix_unitaire);

    // Mettre à jour la transaction
    await Transaction.updateById(id, {
      categorie_id: categorie_id || null,
      type,
      produit_service,
      quantite,
      prix_unitaire,
      montant_total,
      mode_paiement: mode_paiement || 'especes',
      description: description || ''
    });

    // Vérifier les règles de notification de budget
    // if (type === 'depense') {
    //   await notificationService.checkTransactionRules(utilisateur_id);
    // }

    res.status(200).json({
      message: 'Transaction modifiée avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la transaction:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const getStock = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    // We group by produit_service and calculate stock
    const [rows] = await require('../config/db').execute(
      `SELECT categorie_id, produit_service, 
              SUM(CASE WHEN type = 'achat' THEN quantite ELSE 0 END) - 
              SUM(CASE WHEN type = 'vente' THEN quantite ELSE 0 END) as stockActuel
       FROM transactions 
       WHERE utilisateur_id = ? AND (type = 'achat' OR type = 'vente')
       GROUP BY categorie_id, produit_service
       HAVING stockActuel >= 0
       ORDER BY produit_service ASC`,
      [utilisateur_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur lors de la recup du stock:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getStock
};
