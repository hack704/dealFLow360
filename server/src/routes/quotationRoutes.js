const express = require('express');
const router = express.Router();
const {
  previewCalculation,
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  updateQuotationStatus
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/preview', previewCalculation);

router.route('/')
  .get(getQuotations)
  .post(protect, createQuotation);

router.route('/:id')
  .get(getQuotationById)
  .put(protect, updateQuotation);

router.patch('/:id/status', protect, updateQuotationStatus);

module.exports = router;
