const mongoose = require('mongoose');
const { createGoal, getGoals, updateGoal, deleteGoal } = require('../../controllers/goalController');
const Goal = require('../../models/goal');

jest.mock('../../models/goal'); // Mock the Goal model

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

describe('Goal Controller', () => {
  afterAll(async () => {
    await mongoose.connection.close(); // Cleanup
  });

  it('should create a new goal successfully', async () => {
    const req = mockRequest(
      { name: 'Car Purchase', category: 'Car Savings', targetAmount: 5000 },
      { _id: '67c16081a25f23bdd93d9623' }
    );
    const res = mockResponse();
    
    const mockGoal = {
      _id: '67c891c187f1c3edffcc5534',
      userId: '67c16081a25f23bdd93d9623',
      name: 'Car Purchase',
      category: 'Car Savings',
      targetAmount: 5000,
      savedAmount: 0,
      save: jest.fn().mockResolvedValue(this),
    };

    Goal.mockImplementation(() => mockGoal);
    await createGoal(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining(mockGoal));
  });

  it('should fetch all user goals', async () => {
    const req = mockRequest({}, { _id: '67c16081a25f23bdd93d9623' });
    const res = mockResponse();

    const mockGoals = [{ _id: '1', name: 'Goal 1' }, { _id: '2', name: 'Goal 2' }];
    Goal.find.mockResolvedValue(mockGoals);

    await getGoals(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGoals);
  });

  it('should update a goal', async () => {
    const req = mockRequest(
      { name: 'Updated Goal', targetAmount: 7000 },
      { _id: '67c16081a25f23bdd93d9623' },
      { id: 'goal123' }
    );
    const res = mockResponse();

    const mockGoal = { 
      _id: 'goal123',
      userId: '67c16081a25f23bdd93d9623',
      name: 'Old Goal',
      targetAmount: 5000,
      save: jest.fn().mockResolvedValue(true),
    };
    Goal.findById.mockResolvedValue(mockGoal);

    await updateGoal(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Goal', targetAmount: 7000 }));
  });

  it('should delete a goal', async () => {
    const req = mockRequest({}, { _id: '67c16081a25f23bdd93d9623' }, { id: 'goal123' });
    const res = mockResponse();

    const mockGoal = { _id: 'goal123', userId: '67c16081a25f23bdd93d9623', deleteOne: jest.fn() };
    Goal.findById.mockResolvedValue(mockGoal);

    await deleteGoal(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Goal deleted' });
  });
});
