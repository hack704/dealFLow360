const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized, token required', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dealflow360_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return sendError(res, 'User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token verification failed', 401);
  }
};

module.exports = { protect };
