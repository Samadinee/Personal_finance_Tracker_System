// routes/recurrenceTransactionRoutes.js
const express = require('express');
const router = express.Router();
const { createRecurrenceTransaction, getRecurrenceTransactions, updateRecurrenceTransaction, deleteRecurrenceTransaction, checkUpcomingRecurrenceTransactions } = require('../controllers/recurrenceTransactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRecurrenceTransaction);
router.get('/', protect, getRecurrenceTransactions);
router.put('/:id', protect, updateRecurrenceTransaction);
router.delete('/:id', protect, deleteRecurrenceTransaction);
router.get('/upcoming', protect, checkUpcomingRecurrenceTransactions);

module.exports = router;
