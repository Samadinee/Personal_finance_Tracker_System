const Transaction = require('../models/transaction');

exports.getFinancialReport = async (req, res) => {
    try {
        // Ensure authentication middleware is correctly setting userId
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        // Extract filters from query params
        const { startDate, endDate, category, tags } = req.query;

        // 🛠️ Build Query Filters
        const filter = { userId };

        if (startDate && endDate) {
            filter.date = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        }
        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(",") };

        console.log("📌 Applied Filter:", filter); // Debugging

        // 🔍 Fetch Transactions
        const transactions = await Transaction.find(filter);
        console.log("📌 Transactions Found:", transactions.length); // Debugging

        // 📊 Calculate Financial Summary
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryBreakdown = {};

        transactions.forEach((tx) => {
            if (tx.type === "income") {
                totalIncome += tx.amount;
            } else if (tx.type === "expense") {
                totalExpense += tx.amount;
                categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
            }
        });

        // 🏦 Balance Calculation
        const balance = totalIncome - totalExpense;

        // 📡 Send Response
        res.json({
            totalIncome,
            totalExpense,
            balance,
            categoryBreakdown,
            transactions,
        });
    } catch (error) {
        console.error("❌ Error generating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
