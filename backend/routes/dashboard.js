const express = require('express');
const router = express.Router();
const { getDashboardStats, cloturerCaisse, getClotures } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getDashboardStats);
router.post('/cloture', protect, cloturerCaisse);
router.get('/clotures', protect, getClotures);

module.exports = router;
