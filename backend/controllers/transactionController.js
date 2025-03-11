const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Goal = require('../models/goal');
const Budget = require('../models/budget');

// Replace this with a real exchange rate API
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';

// Convert any type of a currency to LKR
const convertToLKR = async (amount, currency) => {
  try {
    if (currency === 'LKR') return amount; // No conversion needed if currency is sri lankan rupees

    const response = await axios.get(`${EXCHANGE_API_URL}${currency}`);
    const exchangeRate = response.data.rates.LKR;

    if (!exchangeRate) throw new Error('Exchange rate not found');

    return amount * exchangeRate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error('Failed to convert currency');
  }
};

// Check if the budget amount for the category is exceeded
const checkBudgetExceed = async (userId, category, amount) => {
  try {
    const budget = await Budget.findOne({ userId, category });

    if (budget) {
      let totalSpent = 0;

      // check daily budget
      if (budget.type === 'daily') {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

        totalSpent = await Transaction.aggregate([
          { $match: { userId, category, date: { $gte: startOfDay, $lte: endOfDay } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
      }

      // check monthly budget
      if (budget.type === 'monthly') {
        const startOfMonth = new Date(budget.startDate);
        const endOfMonth = new Date(budget.endDate);

        totalSpent = await Transaction.aggregate([
          { $match: { userId, category, date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
      }

      const spentAmount = totalSpent[0]?.total || 0;
      if (spentAmount + amount > budget.limit) {
        console.log(`Budget exceeded for category: ${category}. You have exceeded your limit of ${budget.limit}.`); //display massege in console
        // Trigger notification logic here (e.g., sending an email or push notification)
      }
    }
  } catch (error) {
    console.error('Error checking budget:', error);
  }
};

// Create new transaction With checking Budget and Goal Tracking
exports.createTransaction = async (req, res) => {
  const { type, amount, category, tags, currency } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: 'User not authenticated' });
  }

  try {
    // Convert the entered amount to LKR
    const convertedAmount = await convertToLKR(amount, currency);

    // Calculate the user balance = (Income - Expenses)
    const totalIncome = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'income' } },
      { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense' } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);

    const income = totalIncome[0]?.totalIncome || 0;
    const expenses = totalExpenses[0]?.totalExpenses || 0;

    const balance = income - expenses;  // Balance = Total Income - Total Expenses

    // If the transaction is an expense, check if it exceeds the balance
    if (type === 'expense' && convertedAmount > balance) {
      return res.status(400).json({
        error: `Your balance is ${balance} LKR. Your withdrawal exceeds the available balance.`
      });
    }

    // Create a new transaction object
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount: convertedAmount,  // Save only in LKR
      category,
      tags,
      originalAmount: amount,   // Store the original amount
      originalCurrency: currency,  // Store the original currency
    });

    // Save the transaction
    await transaction.save();

    // Check if the transaction exceeds the budget
    await checkBudgetExceed(req.user._id, category, convertedAmount);

    // If the transaction is income and belongs to a goal category, update savedAmount in relavant goal
    if (type === 'income') {
      const goal = await Goal.findOne({ userId: req.user._id, category });
      if (goal) {
        goal.savedAmount += convertedAmount;
        await goal.save();
      }
    }

    // Check if expense exceeds available funds after goal savings
    if (type === 'expense') {
      const goals = await Goal.find({ userId: req.user._id });
      const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
      
      // Assume user has a totalBalance 
      const remainingAmount = req.user.totalBalance - totalSaved;

      if (convertedAmount > remainingAmount) {
        console.log('Warning: Expense exceeds available funds after goal savings.');
        // Trigger notification logic (e.g., email, push notification)
      }
    }

    // Return the transaction with the balance in the response
    res.status(201).json({
      transaction,
      balance
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction' });
  }
};


// Get all transactions details
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
  const { type, amount, category, tags, currency } = req.body;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const convertedAmount = currency ? await convertToLKR(amount, currency) : transaction.amount;

    transaction.type = type || transaction.type;
    transaction.amount = convertedAmount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.tags = tags || transaction.tags;
    transaction.originalAmount = amount || transaction.originalAmount;
    transaction.originalCurrency = currency || transaction.originalCurrency;

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
