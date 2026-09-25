require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ─────────────────────────────────────────────
// Import des routes
// ─────────────────────────────────────────────
const healthRoute = require('./routes/health');
// Les routes suivantes seront ajoutées au fur et à mesure des phases :
const authRoute = require('./routes/auth');           // Phase 1
const transactionRoute = require('./routes/transactions'); // Phase 2
const categorieRoute = require('./routes/categories');    // Phase 2
const dashboardRoute = require('./routes/dashboard');     // Phase 3
const rapportRoute = require('./routes/rapports');        // Phase 4
const notificationRoute = require('./routes/notifications'); // Phase 6
const adminRoute = require('./routes/admin');             // Phase 7

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middlewares globaux
// ─────────────────────────────────────────────
app.use(cors({
  origin: '*', // Allow all origins during development
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Logging des requêtes (développement)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─────────────────────────────────────────────
// Routes API
// ─────────────────────────────────────────────
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);           // Phase 1
app.use('/api/transactions', transactionRoute); // Phase 2
app.use('/api/categories', categorieRoute);     // Phase 2
app.use('/api/dashboard', dashboardRoute);      // Phase 3
app.use('/api/rapports', rapportRoute);         // Phase 4
app.use('/api/notifications', notificationRoute); // Phase 6
app.use('/api/admin', adminRoute);              // Phase 7

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Monify API is running',
    docs: '/api/health',
  });
});

// ─────────────────────────────────────────────
// Gestion des routes non trouvées
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} introuvable`,
  });
});

// ─────────────────────────────────────────────
// Gestionnaire d'erreurs global
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Erreur serveur :', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur',
  });
});

// ─────────────────────────────────────────────
// Démarrage du serveur
// ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║      🏪  MONIFY API  –  v1.0.0       ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Port      : ${PORT}                     ║`);
  console.log(`║  Env       : ${process.env.NODE_ENV || 'development'}              ║`);
  console.log(`║  Health    : http://localhost:${PORT}/api/health ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
