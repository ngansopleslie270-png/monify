const express = require('express');
const router = express.Router();
const { getDashboardStats, cloturerCaisse } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getDashboardStats);
router.post('/cloture', protect, cloturerCaisse);

module.exports = router;
