const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

const checkTransactionRules = async (utilisateur_id) => {
  try {
    // Récupérer toutes les transactions du mois en cours
    const transactions = await Transaction.findByUserId(utilisateur_id);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalDepensesMois = 0;

    transactions.forEach(t => {
      const dateOp = new Date(t.date_operation);
      if (dateOp.getMonth() === currentMonth && dateOp.getFullYear() === currentYear) {
        if (t.type === 'depense') {
          // Exclure le loyer (insensible à la casse)
          const nomCategorie = (t.categorie_nom || '').toLowerCase();
          if (!nomCategorie.includes('loyer')) {
            totalDepensesMois += parseFloat(t.montant_total);
          }
        }
      }
    });

    const SEUIL = 100000;

    // Vérifier si le seuil est dépassé
    if (totalDepensesMois > SEUIL) {
      // Vérifier si on a déjà envoyé une alerte ce mois-ci pour ne pas spammer
      const notifications = await Notification.findByUserId(utilisateur_id);
      
      const alerteExisteDeja = notifications.some(n => {
        const dateNotif = new Date(n.created_at);
        return n.type === 'ALERTE_BUDGET' && 
               dateNotif.getMonth() === currentMonth && 
               dateNotif.getFullYear() === currentYear;
      });

      if (!alerteExisteDeja) {
        await Notification.create({
          utilisateur_id,
          type: 'ALERTE_BUDGET',
          message: `Attention ! Vos dépenses mensuelles (hors loyer) ont dépassé le seuil de ${SEUIL.toLocaleString('fr-FR')} FCFA. (Total actuel : ${totalDepensesMois.toLocaleString('fr-FR')} FCFA)`
        });
      }
    }

  } catch (error) {
    console.error('Erreur dans notificationService:', error);
  }
};

module.exports = {
  checkTransactionRules
};
