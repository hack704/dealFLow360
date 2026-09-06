const express = require('express');
const router = express.Router();
const {
  getPriceLists,
  createPriceList
} = require('../controllers/priceListController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPriceLists)
  .post(protect, authorize('admin'), createPriceList);

module.exports = router;
