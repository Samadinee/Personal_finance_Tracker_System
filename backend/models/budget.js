// models/budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },  // Budget limit for the category
  type: { type: String, enum: ['daily', 'monthly'], required: true },  // Budget type: daily or monthly
  startDate: { type: Date, default: Date.now },  // Used for monthly budgets: start date of the budget
  endDate: { type: Date, default: Date.now },  // Used for monthly budgets: end date of the budget
});

module.exports = mongoose.model('Budget', budgetSchema);
