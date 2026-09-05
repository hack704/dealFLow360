const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  recordPayment,
  getSubscriptions,
  getSubscriptionById,
  calculateProrationPreview
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices/:id/pay', protect, recordPayment);

router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.post('/proration-preview', calculateProrationPreview);

module.exports = router;
