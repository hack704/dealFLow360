const express = require('express');
const router = express.Router();
const {
  getNegotiationByQuote,
  submitCounterOffer,
  addComment,
  respondToNegotiation
} = require('../controllers/negotiationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getNegotiationByQuote);
router.get('/:quoteId', getNegotiationByQuote);
router.post('/:quoteId/counter', submitCounterOffer);
router.post('/:quoteId/respond', protect, respondToNegotiation);
router.post('/:id/comments', protect, addComment);

module.exports = router;
