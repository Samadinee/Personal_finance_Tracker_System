const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    console.log('Token:', token);  // Log the token for debugging
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');  // Attach user data to request
    console.log('Decoded User:', req.user);  // Log the user data for debugging
    next();
  } catch (error) {
    console.error('Error verifying token:', error);  // Log the error for debugging
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Role-based authorization
exports.authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }
  next();
};