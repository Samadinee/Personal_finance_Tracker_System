const mongoose = require('mongoose');
const { createRecurrenceTransaction, getRecurrenceTransactions, updateRecurrenceTransaction, deleteRecurrenceTransaction } = require('../../controllers/recurrenceTransactionController');
const RecurrenceTransaction = require('../../models/recurrenceTransaction');

// Mock the RecurrenceTransaction model
jest.mock('../../models/recurrenceTransaction');

// Helper functions to mock request and response
const mockRequest = (body, user, params = {}) => ({
  body,
  user,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockImplementation((obj) => obj);
  return res;
};

describe('Recurrence Transaction Controller', () => {
  afterAll(async () => {
    await mongoose.connection.close(); // Cleanup after tests
  });

  it('should create a new recurrence transaction', async () => {
    const req = mockRequest(
      { type: 'Expense', amount: 100, category: 'Rent', tags: ['monthly'], recurrence: 'Monthly', startDate: '2025-03-10', endDate: '2025-12-10' },
      { _id: '67c16081a25f23bdd93d9623' }
    );
    const res = mockResponse();

    const mockRecurrenceTransaction = {
      _id: 'recurrence123',
      user: '67c16081a25f23bdd93d9623',
      type: 'Expense',
      amount: 100,
      category: 'Rent',
      tags: ['monthly'],
      recurrence: 'Monthly',
      startDate: '2025-03-10',
      endDate: '2025-12-10',
      save: jest.fn().mockResolvedValue({
        _id: 'recurrence123',
        user: '67c16081a25f23bdd93d9623',
        type: 'Expense',
        amount: 100,
        category: 'Rent',
        tags: ['monthly'],
        recurrence: 'Monthly',
        startDate: '2025-03-10',
        endDate: '2025-12-10',
      }), // Ensure save resolves to the object itself
    };

    // Mock the constructor of RecurrenceTransaction to return the mock instance
    RecurrenceTransaction.mockImplementation(() => mockRecurrenceTransaction);

    await createRecurrenceTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(201); // Check if status is 201 (created)
    expect(res.json).toHaveBeenCalledWith(mockRecurrenceTransaction); // Check if the response matches the saved transaction
  });

  it('should get all recurrence transactions for the user', async () => {
    const req = mockRequest({}, { _id: '67c16081a25f23bdd93d9623' });
    const res = mockResponse();

    const mockTransactions = [
      { _id: 'recurrence123', user: '67c16081a25f23bdd93d9623', type: 'Expense', amount: 100 },
      { _id: 'recurrence124', user: '67c16081a25f23bdd93d9623', type: 'Income', amount: 200 }
    ];
    
    RecurrenceTransaction.find.mockResolvedValue(mockTransactions);

    await getRecurrenceTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Check if status is 200 (OK)
    expect(res.json).toHaveBeenCalledWith(mockTransactions); // Check if the response matches the mock transactions
  });

  it('should update a recurrence transaction', async () => {
    const req = mockRequest(
      { amount: 150, category: 'Utilities' }, 
      { _id: '67c16081a25f23bdd93d9623' },
      { id: 'recurrence123' }
    );
    const res = mockResponse();

    const mockTransaction = {
      _id: 'recurrence123',
      user: '67c16081a25f23bdd93d9623',
      amount: 100,
      category: 'Rent',
      save: jest.fn().mockResolvedValue(true),
    };

    RecurrenceTransaction.findById.mockResolvedValue(mockTransaction);

    await updateRecurrenceTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Check for successful update
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ amount: 150, category: 'Utilities' })); // Check if updated fields are correct
  });

  it('should return error if transaction not found during update', async () => {
    const req = mockRequest(
      { amount: 150, category: 'Utilities' },
      { _id: '67c16081a25f23bdd93d9623' },
      { id: 'recurrence123' }
    );
    const res = mockResponse();

    RecurrenceTransaction.findById.mockResolvedValue(null); // Simulate not found

    await updateRecurrenceTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(404); // Should return 404 if not found
    expect(res.json).toHaveBeenCalledWith({ error: 'Recurrence transaction not found' });
  });

  it('should delete a recurrence transaction', async () => {
    const req = mockRequest({}, { _id: '67c16081a25f23bdd93d9623' }, { id: 'recurrence123' });
    const res = mockResponse();

    const mockTransaction = {
      _id: 'recurrence123',
      user: '67c16081a25f23bdd93d9623',
      deleteOne: jest.fn().mockResolvedValue(true),
    };

    RecurrenceTransaction.findById.mockResolvedValue(mockTransaction);

    await deleteRecurrenceTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Check if deletion is successful
    expect(res.json).toHaveBeenCalledWith({ message: 'Recurrence transaction deleted' });
  });

  it('should return error if transaction not found during deletion', async () => {
    const req = mockRequest({}, { _id: '67c16081a25f23bdd93d9623' }, { id: 'recurrence123' });
    const res = mockResponse();

    RecurrenceTransaction.findById.mockResolvedValue(null); // Simulate not found

    await deleteRecurrenceTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(404); // Should return 404 if not found
    expect(res.json).toHaveBeenCalledWith({ error: 'Recurrence transaction not found' });
  });
});
