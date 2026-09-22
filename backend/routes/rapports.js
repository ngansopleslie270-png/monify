const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');
const { protect } = require('../middlewares/authMiddleware');

// Protéger toutes les routes de rapports avec le middleware d'authentification
router.use(protect);

// POST /api/rapports/generate -> Générer et télécharger le PDF
router.post('/generate', rapportController.generatePDF);

// GET /api/rapports -> Récupérer l'historique des rapports
router.get('/', rapportController.getHistorique);

module.exports = router;
