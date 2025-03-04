const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 }, // Initially set to zero
  category: { type: String, required: true } // Associate goal with a category
});

module.exports = mongoose.model('Goal', goalSchema);
