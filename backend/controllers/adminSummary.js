const User = require('../models/user');
const Transaction = require('../models/transaction');
const Goal = require('../models/goal');

//admin summary (view all users' financial data and goals)
exports.adminSummary = async (req, res) => {
  try {
    // Get all users
    const users = await User.find();
    const summary = [];

    for (const user of users) {
      // GET each user's transactions (income and expenses)
      const transactions = await Transaction.find({ userId: user._id });
      const incomes = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');

      // Calculate total income, expenses, and get balance by substracting total expense from total income 
      const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
      const balance = totalIncome - totalExpense;

      // Fetch user goals
      const goals = await Goal.find({ userId: user._id });
      const goalsInfo = goals.map(goal => ({
        name: goal.name,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
      }));

      // Store each user summary in an array
      summary.push({
        name: user.name,
        totalIncome,
        totalExpense,
        balance,
        goalsInfo,
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admin summary' });
  }
};
