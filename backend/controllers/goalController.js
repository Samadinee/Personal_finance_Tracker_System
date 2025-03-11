const Goal = require('../models/goal');

// Create a new goal
exports.createGoal = async (req, res) => {
    const { name, category, targetAmount } = req.body; // Ensure extract `name`
    
    if (!name || !category || !targetAmount) {
      return res.status(400).json({ error: "Please provide all required fields: name, category, targetAmount" });
    }
  
    try {
      const goal = new Goal({
        userId: req.user._id,
        name,
        category,
        targetAmount,
        savedAmount: 0, 
      });
  
      await goal.save();
      res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ error: "Error creating goal" });
    }
  };
  

// Get all goals for the user
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Error fetching goals' });
  }
};

// Update existing goal by goal id
exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, category } = req.body;

  try {
    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    goal.name = name || goal.name;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.category = category || goal.category;
    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Error updating goal' });
  }
};

// Delete goal by goal id
exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await goal.deleteOne();
    res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Error deleting goal' });
  }
};
