// models/recurrenceTransaction.js
const mongoose = require('mongoose');

const RecurrenceTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Food, Transportation
  tags: [{ type: String }], // Custom labels for filtering
  recurrence: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    required: true
  },
  startDate: { type: Date, required: true }, // Start date of the recurring transaction
  endDate: { type: Date }, // Optional end date for recurring transactions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecurrenceTransaction', RecurrenceTransactionSchema);
