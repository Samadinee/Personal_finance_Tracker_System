// models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  tags: [String],  // Optional: Array of tags for additional categorization
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
