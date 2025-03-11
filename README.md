[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)


# FINANCE TRACKING APPLICATION

## Overview

The Finance Tracking Application is designed to help users manage their finances efficiently. It allows users to track their income, expenses, set budgets, and monitor financial goals. The application is built using Express.js, MongoDB, and JWT for secure user authentication. This README provides an overview of the application and the steps required to run it locally.

## Key Features
- **User Registration & Login**: Secure user authentication with JWT.
- **Budget Management**: Set and update budgets for different categories.
- **Transaction Management**: Track both income and expenses.
- **Recurrance Transaction Management**: Track recurrence transactions.
- **Report genaration**: View reports of the user current financial state.
- **Goal Tracking**: Monitor progress towards financial goals.
- **Admin Functionality**: Admins can view all users and view all users summary.
- **Supports for different currency types**: users can do transactions in different currency types.

## Technologies Used
- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose Object Data Modeling (ODM)
- **Authentication**: JWT (JSON Web Token)
- **Testing Framework**: Jest (for unit, integration, and security testing)
- **API Testing**: Supertest

## Installation

1. Clone the repository from the desired source.
2. Install the necessary dependencies by running `npm install`.
3. Set up the environment variables by creating a `.env` file with the following variables:
    - `MONGODB_URL`: MongoDB connection string.
    - `JWT_SECRET`: secret key for JWT.

4. Start the server with `npm start`.

## Running Tests

- **Unit Tests**: The application uses Jest for unit tests. To run the unit tests, use the command:
  - `npm test`
  - `npm test -- --detectOpenHandles`
  
- **Integration Tests**: For API testing, **Supertest** and **Mongoose** are used. Integration tests can run using the following command:
  - `npm test`
  - `npm test -- --detectOpenHandles`


- **Security Tests**: Security tests are performed using **Supertest**, **dotenv**, and **Jest**. Use the same command `npm test` to run security tests. Following command also can use
  - `npm test test/securityTest/securityTest.test.js`


## Postman API Tests
The following tests can be run using **Postman** to verify the various endpoints of the application:

### Register User
- **Method**: POST
- **URL**: `http://localhost:5000/api/users/register`
- **Body**: 
  - `name`: Name of the user
  - `email`: User’s email address
  - `password`: User’s password
  - `role`: Role of the user (e.g., User or Admin)
- **Response**:
  - Message: "User registered successfully"
  - A token that can be used for authentication in subsequent requests.

### User Login
- **Method**: POST
- **URL**: `http://localhost:5000/api/users/login`
- **Headers**:
  - `Authorization`: Bearer token from login or registration
- **Body**:
  - `email`: User’s email address
  - `password`: User’s password
- **Response**:
  - Message: "Login successful"
  - A token that can be used for authentication in subsequent requests.

### View All Users (Admin Only)
- **Method**: GET
- **URL**: `http://localhost:5000/api/users/`
- **Headers**:
  - `Authorization`: Bearer Admin token
- **Response**:
  - A list of all users with details like name, email, and role.

### User Summary
- **Method**: GET
- **URL**: `http://localhost:5000/api/summary/user-summary`
- **Response**:
  - Displays total income, total expenses, balance, and budget exceed status.
  - Information about financial goals, including the remaining amount to be saved.

### Create Budget
- **Method**: POST
- **URL**: `http://localhost:5000/api/budgets/`
- **Body**:
  - `category`: Category for the budget (e.g., Food, Rent, etc.)
  - `limit`: Budget limit amount
  - `type`: The type of budget (monthly, yearly, etc.)
  - `startDate`: Start date of the budget period
  - `endDate`: End date of the budget period
- **Response**:
  - Confirmation message: "Budget created successfully"
  - Details of the created budget including category, limit, start and end dates.

### View Budget
- **Method**: GET
- **URL**: `http://localhost:5000/api/budgets/`
- **Response**:
  - Details of the created budget including category, limit, and type.

### Update Budget
- **Method**: PUT
- **URL**: `http://localhost:5000/api/budgets/{budgetId}`
- **Body**:
  - `category`: Category for the budget (e.g., Food, Rent, etc.)
  - `limit`: Updated budget limit amount
  - `type`: The type of budget (monthly, yearly, etc.)
  - `startDate`: Start date of the budget period
  - `endDate`: End date of the budget period
- **Response**:
  - Confirmation message indicating successful update of the budget.

### Delete Budget
- **Method**: DELETE
- **URL**: `http://localhost:5000/api/budgets/{budgetId}`
- **Headers**:
  - `Authorization`: Bearer JWT_TOKEN
- **Response**:
  - Message: "Budget deleted successfully"

### Create Transaction
- **Method**: POST
- **URL**: `http://localhost:5000/api/transactions`
- **Body**:
  - `type`: Type of transaction (income or expense)
  - `amount`: Amount of the transaction
  - `category`: Category (e.g., Food, Salary)
  - `tags`: Tags related to the transaction (e.g., breakfast, restaurant)
  - `currency`: Currency used for the transaction
- **Response**:
  - Details of the created transaction.
  - Updated balance after the transaction is processed.

### Get Transaction
- **Method**: GET
- **URL**: `http://localhost:5000/api/transactions?type=income&category=Food`
- **Response**:
  - List of transactions filtered by type (income) and category (Food).
  - Each transaction contains details like amount, tags, and date.

### Update Transaction
- **Method**: PUT
- **URL**: `http://localhost:5000/api/transactions/{transactionId}`
- **Headers**:
  - `Authorization`: Bearer JWT_TOKEN
- **Body**:
  - `amount`: New transaction amount
  - `category`: Updated category
- **Response**:
  - Message: "Transaction updated successfully"

### Delete Transaction
- **Method**: DELETE
- **URL**: `http://localhost:5000/api/transactions/{transactionId}`
- **Headers**:
  - `Authorization`: Bearer JWT_TOKEN
- **Response**:
  - Message: "Transaction deleted successfully"

### Generate Financial Report
- **Method**: GET
- **URL**: `http://localhost:5000/api/reports`
- **Headers**:
  - `Authorization`: Bearer JWT_TOKEN
- **Response**:
  - Summary of income, expenses, and balance.

### Get User Summary
- **Method**: GET
- **URL**: `http://localhost:5000/api/summary/user-summary`
- **Headers**:
- `Authorization`: Bearer JWT_TOKEN
- **Response**:
  - User’s financial summary including balance and goals.

### Get Admin Summary
- **Method**: GET
- **URL**: `http://localhost:5000/api/summary/admin-summary`
- **Headers**:
  - `Authorization`: Bearer JWT_TOKEN
- **Response**:
  - Financial summary of all users (Admins only).


## Conclusion
This application provides a simple and secure way to manage personal finances. The integration of features like user authentication, transaction management, budgeting, and goal tracking makes it a comprehensive tool for financial management.

