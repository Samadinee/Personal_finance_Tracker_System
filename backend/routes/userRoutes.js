const express = require('express');
const { register, login, getUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, authorize(['Admin']), getUsers); // Only Admin can see all the users

module.exports = router;
