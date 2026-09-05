const express = require('express');
const router = express.Router();
const {
  getNegotiationByQuote,
  submitCounterOffer,
  addComment
} = require('../controllers/negotiationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:quoteId', getNegotiationByQuote);
router.post('/:quoteId/counter', submitCounterOffer);
router.post('/:id/comments', protect, addComment);

module.exports = router;
