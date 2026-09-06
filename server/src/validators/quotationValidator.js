const { body, validationResult } = require('express-validator');

const validateQuotation = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.discountPercent')
    .optional()
    .isFloat({ min: 0, max: 70 })
    .withMessage('Discount must be between 0 and 70%')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

module.exports = {
  validateQuotation,
  handleValidationErrors
};
