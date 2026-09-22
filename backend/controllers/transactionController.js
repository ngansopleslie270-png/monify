const Transaction = require('../models/Transaction');
const Compte = require('../models/Compte');
const notificationService = require('../services/notificationService');

const createTransaction = async (req, res) => {
  try {
    const { categorie_id, type, produit_service, quantite, prix_unitaire, mode_paiement, description } = req.body;
    const utilisateur_id = req.user.id;

    if (!categorie_id || !type || !produit_service || !quantite || !prix_unitaire) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations obligatoires.' });
    }

    const montant_total = parseFloat(quantite) * parseFloat(prix_unitaire);

    // Insérer la transaction
    const transactionId = await Transaction.create({
      utilisateur_id,
      categorie_id,
      type,
      produit_service,
      quantite,
      prix_unitaire,
      montant_total,
      mode_paiement: mode_paiement || 'especes',
      description: description || ''
    });

    // Mettre à jour le solde du compte
    const compte = await Compte.findByUserId(utilisateur_id);
    await Compte.updateSolde(compte.id, montant_total, type);

    // Vérifier les règles de notification de budget (Phase 6)
    if (type === 'depense') {
      await notificationService.checkTransactionRules(utilisateur_id);
    }

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
    const transactions = await Transaction.findByUserId(utilisateur_id);
    
    // On peut aussi récupérer le compte pour envoyer le solde
    const compte = await Compte.findByUserId(utilisateur_id);

    res.status(200).json({
      transactions,
      solde: compte.solde
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

    // Supprimer la transaction
    await Transaction.deleteById(id);

    // Mettre à jour le solde (opération inverse)
    const compte = await Compte.findByUserId(utilisateur_id);
    // Pour inverser : si c'était une dépense, on ajoute (revenu). Si c'était un revenu, on soustrait (depense).
    const reverseType = transaction.type === 'depense' ? 'revenu' : 'depense';
    await Compte.updateSolde(compte.id, transaction.montant_total, reverseType);

    res.status(200).json({ message: 'Transaction supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la transaction:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction
};
