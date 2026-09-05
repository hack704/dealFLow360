const express = require('express');
const router = express.Router();
const {
  getFulfillmentList,
  getFulfillmentDetail,
  confirmSplit
} = require('../controllers/fulfillmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getFulfillmentList);

router.route('/:id')
  .get(getFulfillmentDetail);

router.post('/:id/confirm-split', protect, confirmSplit);

module.exports = router;
