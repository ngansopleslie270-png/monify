const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;

    // Récupérer les stats globales (total ventes, total dépenses)
    const globalStats = await Transaction.getStatsByUserId(utilisateur_id);
    let totalVentes = 0;
    let totalDepenses = 0;

    globalStats.forEach(stat => {
      if (stat.type === 'vente' || stat.type === 'revenu') {
        totalVentes = stat.total;
      } else if (stat.type === 'depense') {
        totalDepenses = stat.total;
      }
    });

    // Récupérer les stats par catégorie
    const categoryStats = await Transaction.getStatsByCategory(utilisateur_id);

    const categoriesVentes = categoryStats.filter(c => c.type === 'vente' || c.type === 'revenu');
    const categoriesDepenses = categoryStats.filter(c => c.type === 'depense');

    res.status(200).json({
      totalVentes,
      totalDepenses,
      categoriesVentes,
      categoriesDepenses,
      actives: categoryStats.length
    });
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  getDashboardStats
};
