const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categorieController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getCategories);

module.exports = router;
