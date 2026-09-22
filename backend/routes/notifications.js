const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Protéger toutes les routes de notifications avec le middleware d'authentification
router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/read/:id', notificationController.markAsRead);

module.exports = router;
