const PDFDocument = require('pdfkit');
const Transaction = require('../models/Transaction');
const RapportFinancier = require('../models/RapportFinancier');

const generatePDF = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const periode = req.body.periode || new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Récupérer les stats
    const globalStats = await Transaction.getStatsByUserId(utilisateur_id);
    let total_ventes = 0;
    let total_depenses = 0;

    globalStats.forEach(stat => {
      if (stat.type === 'vente' || stat.type === 'revenu') {
        total_ventes = parseFloat(stat.total);
      } else if (stat.type === 'depense') {
        total_depenses = parseFloat(stat.total);
      }
    });

    const solde_net = total_ventes - total_depenses;

    // Enregistrer le rapport dans la BDD
    await RapportFinancier.create({
      utilisateur_id,
      periode,
      total_ventes,
      total_depenses,
      solde_net
    });

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurer l'en-tête de la réponse HTTP pour télécharger le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Rapport_Monify_${periode.replace(/ /g, '_')}.pdf"`);

    doc.pipe(res); // Envoyer directement au client

    // En-tête du PDF
    doc.fontSize(25).font('Helvetica-Bold').text('MONIFY - Rapport Financier', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica').text(`Période : ${periode}`, { align: 'center' });
    doc.moveDown(2);

    // Résumé
    doc.fontSize(18).font('Helvetica-Bold').text('Résumé Financier', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica');
    doc.text(`Total des Revenus : ${total_ventes.toLocaleString('fr-FR')} FCFA`);
    doc.text(`Total des Dépenses : ${total_depenses.toLocaleString('fr-FR')} FCFA`);
    doc.moveDown();
    doc.fontSize(16).font('Helvetica-Bold').text(`Solde Net : ${solde_net.toLocaleString('fr-FR')} FCFA`, {
      color: solde_net >= 0 ? 'green' : 'red'
    });
    
    // Reset couleur
    doc.fillColor('black');
    doc.moveDown(2);

    // Détail par catégorie
    doc.fontSize(18).font('Helvetica-Bold').text('Répartition par Catégorie', { underline: true });
    doc.moveDown(0.5);
    
    const categoryStats = await Transaction.getStatsByCategory(utilisateur_id);
    doc.fontSize(12).font('Helvetica');
    categoryStats.forEach(cat => {
        const signe = cat.type === 'depense' ? '-' : '+';
        doc.text(`${cat.nom} (${cat.type}) : ${signe} ${parseFloat(cat.total).toLocaleString('fr-FR')} FCFA`);
    });

    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica-Oblique').text('Généré automatiquement par Monify.', { align: 'center' });

    // Finaliser le document PDF
    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erreur interne du serveur lors de la génération.' });
    }
  }
};

const getHistorique = async (req, res) => {
  try {
    const rapports = await RapportFinancier.findByUserId(req.user.id);
    res.status(200).json({ rapports });
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique des rapports:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  generatePDF,
  getHistorique
};
