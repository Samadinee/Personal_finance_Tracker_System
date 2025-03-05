const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../../controllers/budgetController');
const Budget = require('../../models/budget');

// Mock request and response objects manually
const mockRequest = (body, user) => ({
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Budget Controller', () => {

  it('should create a new budget successfully', async () => {
    const req = mockRequest({
      category: 'Food',
      limit: 500,
      type: 'expense',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
    }, { _id: 'user123' });

    const res = mockResponse();

    // Mock the findOne method to return null (no existing budget)
    Budget.findOne = jest.fn().mockResolvedValue(null);

    // Mock the save method to return the mockBudget
    const mockBudget = {
      _id: '67c88542e63e6ac2f49807ea', // This will be ignored in the assertion
      userId: 'user123',
      category: 'Food',
      limit: 500,
      type: 'expense',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-31'),
      save: jest.fn().mockResolvedValue({
        _id: '67c88542e63e6ac2f49807ea', // This will be ignored in the assertion
        userId: 'user123',
        category: 'Food',
        limit: 500,
        type: 'expense',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-31'),
      }),
    };

    // Mock Budget.prototype.save to resolve with mockBudget
    Budget.prototype.save = jest.fn().mockResolvedValue(mockBudget);

    await createBudget(req, res);

    // Check the response status and message, but ignore the _id
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Budget created successfully',
      budget: expect.objectContaining({
        category: 'Food',
        limit: 500,
        type: 'expense',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
    }));
  });

  it('should get all budgets for the user', async () => {
    const req = mockRequest({}, { _id: 'user123' });
    const res = mockResponse();

    const mockBudgets = [
      { _id: '1', userId: 'user123', category: 'Food', limit: 500, type: 'expense', startDate: new Date(), endDate: new Date() },
      { _id: '2', userId: 'user123', category: 'Entertainment', limit: 200, type: 'expense', startDate: new Date(), endDate: new Date() },
    ];

    Budget.find = jest.fn().mockResolvedValue(mockBudgets);

    await getBudgets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBudgets);
  });

  it('should update a budget successfully', async () => {
    const req = mockRequest({ limit: 600 }, { _id: 'user123' });
    req.params = { id: '67c88542e63e6ac2f49807ea' };
    const res = mockResponse();

    const mockBudget = {
      _id: '67c88542e63e6ac2f49807ea',
      userId: 'user123',
      category: 'Food',
      limit: 500,
      type: 'expense',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-31'),
      save: jest.fn().mockResolvedValue({
        _id: '67c88542e63e6ac2f49807ea',
        userId: 'user123',
        category: 'Food',
        limit: 600,
        type: 'expense',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-31'),
      }),
    };

    Budget.findById = jest.fn().mockResolvedValue(mockBudget);
    Budget.prototype.save = jest.fn().mockResolvedValue(mockBudget);

    await updateBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Budget updated successfully',
      budget: expect.objectContaining({
        limit: 600,
      }),
    }));
  });

  it('should return error if budget to update not found', async () => {
    const req = mockRequest({ limit: 600 }, { _id: 'user123' });
    req.params = { id: 'invalid_id' };
    const res = mockResponse();

    Budget.findById = jest.fn().mockResolvedValue(null);  // No budget found

    await updateBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Budget not found' });
  });

  it('should delete a budget successfully', async () => {
    const req = mockRequest({}, { _id: 'user123' });
    req.params = { id: '67c88542e63e6ac2f49807ea' };
    const res = mockResponse();

    const mockBudget = {
      _id: '67c88542e63e6ac2f49807ea',
      userId: 'user123',
      category: 'Food',
      limit: 500,
      type: 'expense',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-31'),
      deleteOne: jest.fn().mockResolvedValue(true),
    };

    Budget.findById = jest.fn().mockResolvedValue(mockBudget);

    await deleteBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Budget deleted' });
  });

  it('should return error if budget to delete not found', async () => {
    const req = mockRequest({}, { _id: 'user123' });
    req.params = { id: 'invalid_id' };
    const res = mockResponse();

    Budget.findById = jest.fn().mockResolvedValue(null);  // No budget found

    await deleteBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Budget not found' });
  });

  it('should return error if unauthorized delete attempt', async () => {
    const req = mockRequest({}, { _id: 'user456' });  // Different user
    req.params = { id: '67c88542e63e6ac2f49807ea' };
    const res = mockResponse();

    const mockBudget = {
      _id: '67c88542e63e6ac2f49807ea',
      userId: 'user123',  // Different userId
      category: 'Food',
      limit: 500,
      type: 'expense',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-31'),
    };

    Budget.findById = jest.fn().mockResolvedValue(mockBudget);

    await deleteBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });
});
