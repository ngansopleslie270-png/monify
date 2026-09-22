const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const { validateTransaction } = require('../middlewares/validationMiddleware');

// Toutes les routes transactions sont protégées
router.use(protect);

router.post('/', validateTransaction, createTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

module.exports = router;
