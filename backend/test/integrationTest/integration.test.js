const request = require('supertest');  //use supertest
const mongoose = require('mongoose'); //Import mongoose
const app = require('../../server'); // Import server.js
const User = require('../../models/user');
const Transaction = require('../../models/transaction');
const Budget = require('../../models/budget');
const Goal = require('../../models/goal');
const RecurrenceTransaction = require('../../models/recurrenceTransaction');
const jwt = require('jsonwebtoken');

let authToken;
let testUserId;
let testTransactionId;
let testBudgetId;
let testGoalId;
let testRecurrenceTransactionId;

// before run all the test setup user
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  const testUser = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'User',
  });
  await testUser.save();
  testUserId = testUser._id;

  authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

// Cleanup mongodb database after all tests run
afterAll(async () => {
  await User.deleteMany();
  await Transaction.deleteMany();
  await Budget.deleteMany();
  await Goal.deleteMany();
  await RecurrenceTransaction.deleteMany();
  await mongoose.connection.close();
});

describe('Integration Tests', () => {
  // Test user login function
  test('User login', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Test create a transaction
  test('Create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'income', amount: 1000, category: 'Salary', tags: ['monthly'], currency: 'USD' });
    expect(res.status).toBe(201);
    testTransactionId = res.body.transaction._id;
  });

  // Test create a budget
  test('Create a budget', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ category: 'Food', limit: 500, type: 'monthly' });
    expect(res.status).toBe(201);
    testBudgetId = res.body.budget._id;
  });

  // Test create a financial goal
  test('Create a goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Save for Car', category: 'Savings', targetAmount: 5000 });
    expect(res.status).toBe(201);
    testGoalId = res.body._id;
  });

  // Test create a recurring transaction
  test('Create a recurring transaction', async () => {
    const requestData = {
      type: 'Income', 
      amount: 200,
      category: 'Salary',
      recurrence: 'Monthly',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
      tags: [],
    };
  
    console.log("Sending Request Data:", requestData);
    
    const res = await request(app)
      .post('/api/recurrenceTransactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(requestData);
    
    console.log("Response Body:", res.body);
  
    expect(res.status).toBe(201);
    testRecurrenceTransactionId = res.body._id;
  });
  

  // Test fetching user summary
  test('Get user summary', async () => {
    const res = await request(app)
      .get('/api/summary/user-summary')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });
});
