const { adminSummary } = require('../../controllers/adminSummary');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');
const Goal = require('../../models/goal');

// Mock the dependencies (models)
jest.mock('../../models/user');
jest.mock('../../models/transaction');
jest.mock('../../models/goal');

describe('adminSummary', () => {
  it('should return the summary of all users', async () => {
    // Mock user data
    const mockUsers = [
      { _id: 'user1', name: 'John Doe' },
      { _id: 'user2', name: 'Jane Doe' }
    ];
    
    // Mock transactions for the users
    const mockTransactionsUser1 = [
      { type: 'income', amount: 1000 },
      { type: 'expense', amount: 500 },
    ];
    const mockTransactionsUser2 = [
      { type: 'income', amount: 2000 },
      { type: 'expense', amount: 1500 },
    ];
    
    // Mock goals for the users
    const mockGoalsUser1 = [
      { name: 'Buy House', savedAmount: 500, targetAmount: 10000 },
      { name: 'Vacation', savedAmount: 200, targetAmount: 5000 },
    ];
    const mockGoalsUser2 = [
      { name: 'Buy Car', savedAmount: 1000, targetAmount: 20000 },
    ];

    // Mock the find() method of the models
    User.find.mockResolvedValue(mockUsers);
    Transaction.find.mockImplementation(({ userId }) => {
      if (userId === 'user1') {
        return mockTransactionsUser1;
      } else if (userId === 'user2') {
        return mockTransactionsUser2;
      }
    });
    Goal.find.mockImplementation(({ userId }) => {
      if (userId === 'user1') {
        return mockGoalsUser1;
      } else if (userId === 'user2') {
        return mockGoalsUser2;
      }
    });

    // Manually mock req and res
    const req = {}; // No specific properties needed for the test
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the adminSummary function
    await adminSummary(req, res);

    // Check the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        name: 'John Doe',
        totalIncome: 1000,
        totalExpense: 500,
        balance: 500,
        goalsInfo: [
          { name: 'Buy House', savedAmount: 500, targetAmount: 10000 },
          { name: 'Vacation', savedAmount: 200, targetAmount: 5000 },
        ],
      },
      {
        name: 'Jane Doe',
        totalIncome: 2000,
        totalExpense: 1500,
        balance: 500,
        goalsInfo: [
          { name: 'Buy Car', savedAmount: 1000, targetAmount: 20000 },
        ],
      },
    ]);
  });

  it('should return 500 if an error occurs', async () => {
    // Simulate an error in the function
    User.find.mockRejectedValue(new Error('Database error'));

    // Manually mock req and res
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the adminSummary function
    await adminSummary(req, res);

    // Check the response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching admin summary' });
  });
});
