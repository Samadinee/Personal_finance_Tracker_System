const User = require('../models/user');
const Transaction = require('../models/transaction');
const Goal = require('../models/goal');

// Get user summary
exports.userSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user transactions (income and expenses)
    const transactions = await Transaction.find({ userId });
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    // Calculate total income, expenses, and balance
    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Get user budget (if any) to calculate the exceed
    const user = await User.findById(userId);
    const budgetExceed = user.budget ? (totalExpense - user.budget) : 0;

    // Get user goals and calculate the remaining amount to complete the goal
    const goals = await Goal.find({ userId });
    const goalsInfo = goals.map(goal => {
      const remainingAmount = goal.targetAmount - goal.savedAmount;
      return {
        name: goal.name,
        remainingAmount,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
      };
    });

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      budgetExceed,
      goalsInfo,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user summary' });
  }
};
