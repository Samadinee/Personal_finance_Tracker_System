const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../../controllers/transactionController');
const Transaction = require('../../models/transaction');
const Goal = require('../../models/goal');
const Budget = require('../../models/budget');
const User = require('../../models/user');
const axios = require('axios');

jest.mock('../../models/transaction');
jest.mock('../../models/goal');
jest.mock('../../models/budget');
jest.mock('../../models/user');
jest.mock('axios');

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { _id: 'userId', totalBalance: 10000 }, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      req.body = { type: 'income', amount: 5000, category: 'Salary', tags: ['job'], currency: 'USD' };
      axios.get.mockResolvedValue({ data: { rates: { LKR: 300 } } });
      Transaction.aggregate.mockResolvedValue([{ totalIncome: 10000 }, { totalExpenses: 2000 }]);
      Transaction.prototype.save = jest.fn().mockResolvedValue({ _id: 'transactionId', ...req.body });
      Goal.findOne.mockResolvedValue(null);
      Budget.findOne.mockResolvedValue(null);
      
      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        transaction: expect.any(Object),
        balance: expect.any(Number)
      }));
    });

    it('should return 400 if expense exceeds balance', async () => {
      req.body = { type: 'expense', amount: 15000, category: 'Shopping', tags: ['clothes'], currency: 'LKR' };
      Transaction.aggregate.mockResolvedValue([{ totalIncome: 10000 }, { totalExpenses: 2000 }]);
      
      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: `Your balance is ${req.user.totalBalance} LKR. Your withdrawal exceeds the available balance.` });
    });
  });

  describe('getTransactions', () => {
    it('should fetch all transactions', async () => {
      req.query = {}; // Ensuring req.query is defined

      // Mock a query-like object with .sort()
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([{ _id: 'transactionId', type: 'income', amount: 5000 }])
      };
      Transaction.find.mockReturnValue(mockQuery);

      await getTransactions(req, res);

      expect(Transaction.find).toHaveBeenCalledWith({ userId: req.user._id });
      expect(mockQuery.sort).toHaveBeenCalledWith({ date: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction successfully', async () => {
      req.params = { id: 'transactionId' };
      req.body = { amount: 7000, category: 'Bonus' };
      Transaction.findById.mockResolvedValue({ _id: 'transactionId', userId: 'userId', save: jest.fn() });
      
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      req.params = { id: 'transactionId' };
      Transaction.findById.mockResolvedValue({ _id: 'transactionId', userId: 'userId', deleteOne: jest.fn() });
      
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction deleted' });
    });
  });
});
