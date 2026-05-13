const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, deleteTransaction, updateTransaction} = require('../controller/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTransactions);
router.post('/', authMiddleware, createTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.put('/:id', authMiddleware, updateTransaction);

module.exports = router;