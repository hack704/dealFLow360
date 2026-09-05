const { sendError } = require('../utils/apiResponse');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Access denied: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { restrictTo };
