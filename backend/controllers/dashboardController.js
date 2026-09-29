const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;

    // 1. Récupérer les stats du mois courant
    const monthlyStats = await Transaction.getDashboardMetrics(utilisateur_id);
    
    let totalVentes = 0;
    let totalAchats = 0;
    let totalDepenses = 0;
    let nbOperations = 0;

    monthlyStats.forEach(stat => {
      const montant = parseFloat(stat.total) || 0;
      nbOperations += parseInt(stat.nb_operations) || 0;
      
      if (stat.type === 'vente' || stat.type === 'revenu') {
        totalVentes += montant;
      } else if (stat.type === 'achat') {
        totalAchats += montant;
      } else if (stat.type === 'depense') {
        totalDepenses += montant;
      }
    });

    totalVentes = Math.round(totalVentes);
    totalAchats = Math.round(totalAchats);
    totalDepenses = Math.round(totalDepenses);

    const solde = totalVentes - totalDepenses - totalAchats;
    const panierMoyen = nbOperations > 0 ? Math.round(totalVentes / nbOperations) : 0;

    // 2. Générer des alertes dynamiques
    const alerts = [];
    const Notification = require('../models/Notification');
    
    const checkAndCreateNotification = async (type, message) => {
      try {
        const recentNotifs = await Notification.findByUserId(utilisateur_id);
        const todayStr = new Date().toISOString().split('T')[0];
        const exists = recentNotifs.some(n => {
          const notifDate = new Date(n.created_at).toISOString().split('T')[0];
          return n.type === type && n.message === message && notifDate === todayStr;
        });
        if (!exists) {
          await Notification.create({ utilisateur_id, type, message });
        }
      } catch (err) {
        console.error("Erreur création notification auto:", err);
      }
    };

    if (totalDepenses > totalVentes && totalVentes > 0) {
      const text = 'Dépenses critiques';
      const sub = 'Vos dépenses ont dépassé vos revenus ce mois-ci.';
      alerts.push({ id: 1, type: 'danger', icon: 'alert-triangle', text, sub });
      await checkAndCreateNotification('alerte', `${text} : ${sub}`);
    } else if (totalDepenses > totalVentes * 0.8) {
      const text = 'Attention au budget';
      const sub = 'Vos dépenses représentent plus de 80% de vos revenus.';
      alerts.push({ id: 2, type: 'warning', icon: 'alert-circle', text, sub });
      await checkAndCreateNotification('alerte', `${text} : ${sub}`);
    }

    // 3. Récupérer les dépenses par catégorie
    const categoryStats = await Transaction.getStatsByCategory(utilisateur_id);
    
    // Filtrer pour ne garder que les achats et dépenses
    const sortiesByCategory = categoryStats.filter(c => c.type === 'depense' || c.type === 'achat');
    
    res.status(200).json({
      totalVentes,
      totalAchats,
      totalDepenses,
      solde,
      nbOperations,
      panierMoyen,
      alerts,
      sortiesByCategory
    });
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
  }
};

const cloturerCaisse = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const dateAujourdhui = new Date().toISOString().split('T')[0];

    // 1. Vérifier si une clôture a déjà été faite aujourd'hui
    const [existing] = await require('../config/db').execute(
      `SELECT id FROM caisse_journaliere WHERE utilisateur_id = ? AND date_cloture = ?`,
      [utilisateur_id, dateAujourdhui]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'La caisse a déjà été clôturée pour aujourd\'hui.' });
    }

    // 2. Calculer les statistiques du jour
    // On réutilise une logique similaire mais filtrée sur la journée
    const [rows] = await require('../config/db').execute(
      `SELECT type, SUM(montant_total) as total 
       FROM transactions 
       WHERE utilisateur_id = ? 
         AND DATE(date_operation) = ?
       GROUP BY type`,
      [utilisateur_id, dateAujourdhui]
    );

    let totalVentes = 0;
    let totalAchats = 0;
    let totalDepenses = 0;

    rows.forEach(stat => {
      const montant = parseFloat(stat.total) || 0;
      if (stat.type === 'vente' || stat.type === 'revenu') {
        totalVentes += montant;
      } else if (stat.type === 'achat') {
        totalAchats += montant;
      } else if (stat.type === 'depense') {
        totalDepenses += montant;
      }
    });

    totalVentes = Math.round(totalVentes);
    totalAchats = Math.round(totalAchats);
    totalDepenses = Math.round(totalDepenses);

    const solde_final = totalVentes - totalAchats - totalDepenses;

    // 3. Récupérer le stock actuel
    const [stockRows] = await require('../config/db').execute(
      `SELECT produit_service as nom, 
              SUM(CASE WHEN type = 'achat' THEN quantite ELSE 0 END) - 
              SUM(CASE WHEN type = 'vente' THEN quantite ELSE 0 END) as stock
       FROM transactions 
       WHERE utilisateur_id = ? AND (type = 'achat' OR type = 'vente')
       GROUP BY produit_service
       HAVING stock >= 0`,
      [utilisateur_id]
    );
    const stock_restant = JSON.stringify(stockRows);

    // 4. Enregistrer la clôture
    await require('../config/db').execute(
      `INSERT INTO caisse_journaliere (utilisateur_id, date_cloture, solde_final, total_ventes, total_achats, total_depenses, stock_restant) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [utilisateur_id, dateAujourdhui, solde_final, totalVentes, totalAchats, totalDepenses, stock_restant]
    );

    res.status(201).json({ 
      message: 'Caisse clôturée avec succès.', 
      solde_final,
      totalVentes,
      totalAchats,
      totalDepenses 
    });
  } catch (error) {
    console.error('Erreur lors de la clôture:', error);
    res.status(500).json({ message: 'Erreur interne.' });
  }
};

const getClotures = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const [rows] = await require('../config/db').execute(
      `SELECT * FROM caisse_journaliere WHERE utilisateur_id = ? ORDER BY date_cloture DESC`,
      [utilisateur_id]
    );
    res.status(200).json({ clotures: rows });
  } catch (error) {
    console.error('Erreur lors du chargement des clotures:', error);
    res.status(500).json({ message: 'Erreur interne.' });
  }
};

module.exports = {
  getDashboardStats,
  cloturerCaisse,
  getClotures
};
