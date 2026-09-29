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

const generatePDFJournalier = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const dateStr = req.body.date;
    
    if (!dateStr) {
      return res.status(400).json({ message: 'Date de clôture requise.' });
    }

    // Fetch closure details to get stock_restant and total_achats
    const [closureRows] = await require('../config/db').execute(
      `SELECT * FROM caisse_journaliere WHERE utilisateur_id = ? AND date_cloture = ?`,
      [utilisateur_id, dateStr]
    );

    let stock_restant = [];
    let total_achats = 0;
    if (closureRows.length > 0) {
      total_achats = parseFloat(closureRows[0].total_achats) || 0;
      try {
        stock_restant = JSON.parse(closureRows[0].stock_restant) || [];
      } catch (e) {}
    }

    // Récupérer les transactions du jour
    let transactions = await Transaction.findByUserId(utilisateur_id);
    transactions = transactions.filter(t => new Date(t.date_operation).toISOString().split('T')[0] === dateStr);

    let total_ventes = 0;
    let total_depenses = 0;

    transactions.forEach(t => {
      const montant = parseFloat(t.montant_total) || 0;
      if (t.type === 'vente' || t.type === 'revenu') {
        total_ventes += montant;
      } else if (t.type === 'depense') {
        total_depenses += montant;
      } else if (t.type === 'achat' && closureRows.length === 0) {
        // Fallback for purchases if closure record not found
        total_achats += montant;
      }
    });

    const solde_net = total_ventes - total_depenses - total_achats;
    const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Cloture_${dateStr}.pdf"`);

    doc.pipe(res);

    // En-tête du PDF
    doc.fontSize(22).font('Helvetica-Bold').text('MONIFY - Clôture Journalière', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica').text(`Date : ${formattedDate}`, { align: 'center' });
    doc.moveDown(2);

    // Résumé
    doc.fontSize(16).font('Helvetica-Bold').text('Résumé de la journée', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total des Ventes : ${total_ventes.toLocaleString('fr-FR')} FCFA`);
    doc.text(`Total des Achats : ${total_achats.toLocaleString('fr-FR')} FCFA`);
    doc.text(`Total des Dépenses : ${total_depenses.toLocaleString('fr-FR')} FCFA`);
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text(`Solde de clôture : ${solde_net.toLocaleString('fr-FR')} FCFA`, {
      color: solde_net >= 0 ? 'green' : 'red'
    });
    
    doc.fillColor('black');
    doc.moveDown(2);

    // Détail des transactions
    doc.fontSize(16).font('Helvetica-Bold').text('Opérations de la journée', { underline: true });
    doc.moveDown(0.5);
    
    if (transactions.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('Aucune opération enregistrée ce jour.');
    } else {
      doc.fontSize(11).font('Helvetica');
      transactions.forEach(tx => {
          const signe = (tx.type === 'depense' || tx.type === 'achat') ? '-' : '+';
          const montant = parseFloat(tx.montant_total).toLocaleString('fr-FR');
          doc.text(`[${tx.type.toUpperCase()}] ${tx.produit_service} : ${signe} ${montant} FCFA`);
      });
    }

    doc.moveDown(2);

    // Stock restant
    if (stock_restant && stock_restant.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Stock de marchandises restant', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      stock_restant.forEach(item => {
        doc.text(`${item.nom} : ${item.stock} en stock`);
      });
    }

    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica-Oblique').text('Généré automatiquement par Monify.', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du PDF journalier:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erreur interne du serveur lors de la génération.' });
    }
  }
};

module.exports = {
  generatePDF,
  getHistorique,
  generatePDFJournalier
};
