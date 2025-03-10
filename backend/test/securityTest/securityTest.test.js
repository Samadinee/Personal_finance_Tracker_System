const request = require('supertest');
const app = require('../../server'); // Ensure this is the correct path
require('dotenv').config({ path: '.env.test' }); // Load .env.test file

// Debugging: Log environment variables
console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL);
console.log('TEST_USER_PASSWORD:', process.env.TEST_USER_PASSWORD);

let authToken; // Store token globally for tests

// Helper function to get authentication token
async function getAuthToken() {
  try {
    // Ensure environment variables are loaded
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      console.error("TEST_USER_EMAIL or TEST_USER_PASSWORD not found in .env file.");
      throw new Error("Missing test credentials.");
    }

    console.log('Attempting to login with email:', process.env.TEST_USER_EMAIL);

    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD
      });

    console.log('Login response status:', response.status);
    console.log('Login response body:', response.body);

    if (response.status !== 200) {
      console.error("Failed to retrieve token. Status:", response.status);
      console.error("Response body:", response.body);
      throw new Error("Authentication failed. Check test credentials.");
    }

    if (!response.body.token) {
      console.error("No token in response body:", response.body);
      throw new Error("Authentication failed. Token not found.");
    }

    return response.body.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
}

// Fetch token before running tests
beforeAll(async () => {
  try {
    authToken = await getAuthToken();
  } catch (error) {
    console.error("Error during token retrieval. Tests will not proceed.");
    throw error;
  }
});

describe('Security Tests', () => {
  jest.setTimeout(15000); // Set test timeout to 15s

  // Test for SQL Injection
  test('Should prevent SQL Injection in login', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: "' OR '1'='1", password: "' OR '1'='1" });

    console.log('SQL Injection response status:', response.status);
    console.log('SQL Injection response body:', response.body);

    expect(response.status).toBe(400); // Expecting error due to invalid credentials
    expect(response.body.error).toBeDefined();
  });

  // Test for Cross-Site Scripting (XSS)
  test('Should prevent XSS in transaction creation', async () => {
    if (!authToken) throw new Error("No auth token available for testing");

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'income',
        amount: 5000,
        category: '<script>alert("XSS")</script>',
        tags: ['<img src=x onerror=alert("XSS")>'],
        currency: 'USD'
      });

    console.log('XSS test response status:', response.status);
    console.log('XSS test response body:', response.body);

    expect(response.status).toBe(400); // Expecting error due to invalid input
    expect(response.body.error).toBeDefined();
  });

  // Test for Insecure Authentication (Weak Passwords)
  test('Should prevent weak password registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123', // Weak password
        role: 'User'
      });

    console.log('Weak password registration response status:', response.status);
    console.log('Weak password registration response body:', response.body);

    expect(response.status).toBe(400); // Should reject weak passwords
    expect(response.body.error).toBeDefined();
  });

  // Test for Missing Authentication
  test('Should block access to protected routes without authentication', async () => {
    const response = await request(app).get('/api/transactions');
    
    console.log('Missing authentication response status:', response.status);
    console.log('Missing authentication response body:', response.body);

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.error).toBeDefined();
  });
});
