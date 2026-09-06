const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 1. If token is provided, attempt to verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dealflow360_secret');
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    } catch (error) {
      console.warn('[AUTH] Token verification failed:', error.message);
    }
  }

  return sendError(res, 'Not authorized, valid token required', 401);
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authorized, please log in', 401);
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return sendError(
        res,
        `Access denied: Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
