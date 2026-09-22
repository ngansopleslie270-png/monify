const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

// Route publique
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Route protégée
router.get('/profile', protect, getProfile);

module.exports = router;
