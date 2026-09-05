const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  recordPayment,
  getSubscriptions,
  getSubscriptionById,
  calculateProrationPreview,
  generateBilling
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate/:id', generateBilling);

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices/:id/pay', recordPayment);

router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.post('/proration-preview', calculateProrationPreview);

module.exports = router;
