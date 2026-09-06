const express = require('express');
const router = express.Router();
const {
  getDiscountRules,
  updateDiscountCeilings
} = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/rules', getDiscountRules);
router.put('/ceilings', protect, authorize('admin', 'sales_manager'), updateDiscountCeilings);

module.exports = router;
