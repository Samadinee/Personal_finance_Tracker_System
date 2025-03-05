const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');  
const { userSummary } = require('../controllers/userSummary');
const { adminSummary } = require('../controllers/adminSummary');

// User routes
router.get('/user-summary', protect, userSummary);

// Admin routes
router.get('/admin-summary', protect, authorize(['Admin']), adminSummary);

module.exports = router;
