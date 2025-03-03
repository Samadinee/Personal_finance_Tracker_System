// controllers/recurrenceTransactionController.js
const RecurrenceTransaction = require('../models/recurrenceTransaction');
const moment = require('moment');

// Create a new recurrence transaction
exports.createRecurrenceTransaction = async (req, res) => {
  const { type, amount, category, tags, recurrence, startDate, endDate } = req.body;

  try {
    const recurrenceTransaction = new RecurrenceTransaction({
      user: req.user._id,  // Automatically associates with logged-in user
      type,
      amount,
      category,
      tags,
      recurrence,
      startDate,
      endDate
    });

    await recurrenceTransaction.save();
    res.status(201).json(recurrenceTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error creating recurrence transaction' });
  }
};

// Get all recurrence transactions for the user
exports.getRecurrenceTransactions = async (req, res) => {
  try {
    const recurrenceTransactions = await RecurrenceTransaction.find({ user: req.user._id });
    res.status(200).json(recurrenceTransactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recurrence transactions' });
  }
};

// Update a recurrence transaction
exports.updateRecurrenceTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, tags, recurrence, startDate, endDate } = req.body;

  try {
    const recurrenceTransaction = await RecurrenceTransaction.findById(id);
    if (!recurrenceTransaction) return res.status(404).json({ error: 'Recurrence transaction not found' });

    if (recurrenceTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    recurrenceTransaction.type = type || recurrenceTransaction.type;
    recurrenceTransaction.amount = amount || recurrenceTransaction.amount;
    recurrenceTransaction.category = category || recurrenceTransaction.category;
    recurrenceTransaction.tags = tags || recurrenceTransaction.tags;
    recurrenceTransaction.recurrence = recurrence || recurrenceTransaction.recurrence;
    recurrenceTransaction.startDate = startDate || recurrenceTransaction.startDate;
    recurrenceTransaction.endDate = endDate || recurrenceTransaction.endDate;

    await recurrenceTransaction.save();
    res.status(200).json(recurrenceTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating recurrence transaction' });
  }
};

// Delete a recurrence transaction
exports.deleteRecurrenceTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const recurrenceTransaction = await RecurrenceTransaction.findById(id);
    if (!recurrenceTransaction) return res.status(404).json({ error: 'Recurrence transaction not found' });

    if (recurrenceTransaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await recurrenceTransaction.deleteOne();
    res.status(200).json({ message: 'Recurrence transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting recurrence transaction' });
  }
};

// Check for upcoming recurrence transactions (within 2 days)
exports.checkUpcomingRecurrenceTransactions = async (req, res) => {
  try {
    const upcomingTransactions = await RecurrenceTransaction.find({
      user: req.user._id,
      startDate: { $gte: new Date(), $lte: moment().add(2, 'days').toDate() }
    });
    
    res.status(200).json(upcomingTransactions);
  } catch (error) {
    res.status(500).json({ error: 'Error checking upcoming recurrence transactions' });
  }
};
