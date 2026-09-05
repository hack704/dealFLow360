const express = require('express');
const router = express.Router();
const {
  getDiscountRules,
  updateDiscountCeilings
} = require('../controllers/discountController');
const { protect } = require('../middleware/authMiddleware');

router.get('/rules', getDiscountRules);
router.put('/ceilings', protect, updateDiscountCeilings);

module.exports = router;
