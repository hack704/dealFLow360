const express = require('express');
const router = express.Router();
const {
  getPriceLists,
  createPriceList
} = require('../controllers/priceListController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPriceLists)
  .post(protect, createPriceList);

module.exports = router;
