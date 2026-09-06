const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  recordPayment,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  getReturnPolicyRules,
  cancelSubscription,
  deleteSubscription,
  calculateProrationPreview,
  generateBilling,
  getRecurringPlans,
  createRecurringPlan,
  updateRecurringPlan,
  deleteRecurringPlan,
  attachPlanToProducts,
  updateProrationAndCancellationRules
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate/:id', protect, authorize('admin', 'finance'), generateBilling);

// Recurring Plans & Attachments (Requirement A5)
router.get('/plans', getRecurringPlans);
router.post('/plans', protect, authorize('admin', 'finance', 'sales_manager'), createRecurringPlan);
router.put('/plans/:id', protect, authorize('admin', 'finance', 'sales_manager'), updateRecurringPlan);
router.delete('/plans/:id', protect, authorize('admin', 'finance', 'sales_manager'), deleteRecurringPlan);
router.post('/plans/:id/attach', protect, authorize('admin', 'finance', 'sales_manager'), attachPlanToProducts);
router.put('/rules', protect, authorize('admin', 'finance', 'sales_manager'), updateProrationAndCancellationRules);

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices/:id/pay', protect, recordPayment);

router.get('/subscriptions/return-policy', getReturnPolicyRules);
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.put('/subscriptions/:id', protect, authorize('admin', 'finance'), updateSubscription);
router.patch('/subscriptions/:id', protect, authorize('admin', 'finance'), updateSubscription);
router.post('/subscriptions/:id/pause', protect, authorize('admin', 'finance'), pauseSubscription);
router.post('/subscriptions/:id/resume', protect, authorize('admin', 'finance'), resumeSubscription);
router.post('/subscriptions/:id/cancel', protect, authorize('admin', 'finance'), cancelSubscription);
router.delete('/subscriptions/:id', protect, authorize('admin', 'finance'), deleteSubscription);
router.post('/proration-preview', calculateProrationPreview);

module.exports = router;
