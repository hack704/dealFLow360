const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR] Unhandled Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return sendError(res, 'Validation Error', 400, errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `Duplicate entry for ${field}`, 409);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authorization token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authorization token expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
