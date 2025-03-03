const Transaction = require('../models/transaction');
const Budget = require('../models/budget');

// Check if the budget for the category is exceeded
const checkBudgetExceed = async (userId, category, amount) => {
  try {
    const budget = await Budget.findOne({ userId, category });

    if (budget) {
      let totalSpent = 0;

      // Daily budget check
      if (budget.type === 'daily') {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));  // Start of the day
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)); // End of the day

        totalSpent = await Transaction.aggregate([
          { $match: { userId, category, date: { $gte: startOfDay, $lte: endOfDay } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
      }

      // Monthly budget check
      if (budget.type === 'monthly') {
        const startOfMonth = new Date(budget.startDate);
        const endOfMonth = new Date(budget.endDate);

        totalSpent = await Transaction.aggregate([
          { $match: { userId, category, date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
      }

      // If the total spent exceeds the limit
      const spentAmount = totalSpent[0]?.total || 0;
      if (spentAmount + amount > budget.limit) {
        console.log(`Budget exceeded for category: ${category}. You have exceeded your limit of ${budget.limit}.`);
        // Trigger notification logic here (e.g., sending an email or push notification)
      }
    }
  } catch (error) {
    console.error('Error checking budget:', error);
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { type, amount, category, tags } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: 'User not authenticated' });
  }

  try {
    // Create the new transaction
    const transaction = new Transaction({
      userId: req.user._id,  // Automatically associates with logged-in user
      type,
      amount,
      category,
      tags,
    });

    await transaction.save();

    // Check if the transaction exceeds the budget
    await checkBudgetExceed(req.user._id, category, amount);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);  // Log the error for debugging
    res.status(500).json({ error: 'Error creating transaction' });
  }
};

// Get all transactions (with optional filters)
exports.getTransactions = async (req, res) => {
  const { type, category, tags } = req.query;

  const filter = { userId: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (tags) filter.tags = { $in: tags.split(',') };

  try {
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

// Update a transaction by ID
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, tags } = req.body;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.tags = tags || transaction.tags;
    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Error updating transaction' });
  }
};

// Delete a transaction by ID
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  console.log("Attempting to delete transaction with ID:", id);  // Log the ID being passed
  
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      console.log("Transaction not found");
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Ensure the user can only delete their own transaction
    if (transaction.userId.toString() !== req.user._id.toString()) {
      console.log("Unauthorized delete attempt by user:", req.user._id);
      return res.status(403).json({ error: 'Forbidden: You cannot delete someone else\'s transaction' });
    }

    await transaction.deleteOne();
    console.log("Transaction deleted successfully");
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    console.log("Error occurred while deleting transaction:", error);
    res.status(500).json({ error: 'Error deleting transaction' });
  }
};
