// controllers/budgetController.js
const Budget = require('../models/budget');

// Create a new budget
exports.createBudget = async (req, res) => {
  const { category, limit, type, startDate, endDate } = req.body;

  try {
    const existingBudget = await Budget.findOne({ userId: req.user._id, category });
    if (existingBudget) return res.status(400).json({ error: 'Budget already set for this category' });

    const budget = new Budget({
      userId: req.user._id,
      category,
      limit,
      type,
      startDate,
      endDate
    });

    await budget.save();
    res.status(201).json({ message: 'Budget created successfully', budget });
  } catch (error) {
    res.status(500).json({ error: 'Error creating budget' });
  }
};

// Get all budgets for the user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching budgets' });
  }
};

// Update a budget by ID
exports.updateBudget = async (req, res) => {
  const { id } = req.params;
  const { limit, type, startDate, endDate } = req.body;

  try {
    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    budget.limit = limit || budget.limit;
    budget.type = type || budget.type;
    budget.startDate = startDate || budget.startDate;
    budget.endDate = endDate || budget.endDate;

    await budget.save();
    res.status(200).json({ message: 'Budget updated successfully', budget });
  } catch (error) {
    res.status(500).json({ error: 'Error updating budget' });
  }
};

// Delete a budget by ID
exports.deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await budget.remove();
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting budget' });
  }
};
