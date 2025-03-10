// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recurrenceTransactionRoutes = require('./routes/recurrenceTransactionRoutes');
const reportRoutes = require("./routes/reportRoutes");
const goalRoutes = require('./routes/goalRoutes');
const summaryRoutes = require('./routes/summaryRoutes'); 


dotenv.config();

const app = express();
app.use(express.json());

/*
//comment the following until stop comment when running
// **Change**: Added check to ensure MongoDB connection is only made in non-test environments
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('DB Connection Error:', err));
}
//end
*/


mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Connection Error:', err));






app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurrenceTransactions', recurrenceTransactionRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/summary', summaryRoutes);   

const PORT = process.env.PORT || 5000;





app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




/*

if (process.env.NODE_ENV !== 'test') { //To ensure this doesn't start the server during testing
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
*/
