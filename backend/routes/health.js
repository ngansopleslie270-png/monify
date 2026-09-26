const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * GET /api/health
 * Vérifie que le serveur Express et la connexion MySQL sont opérationnels.
 */
router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    dbStatus = 'connected';
  } catch (error) {
    dbError = error.message;
  }

  const response = {
    status: 'ok',
    application: 'Monify API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: process.env.DB_NAME || 'monify_db',
      ...(dbError && { error: dbError }),
    },
  };

  const httpStatus = dbStatus === 'connected' ? 200 : 200; // toujours 200, db peut être optionnelle en dev
  res.status(httpStatus).json(response);
});

const Visiteur = require('../models/Visiteur');

router.post('/visit', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (deviceId) {
      await Visiteur.registerVisit(deviceId);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur registerVisit:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
