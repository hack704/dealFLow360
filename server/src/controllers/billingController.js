const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const { generateBillingFromQuotation, calculateProration } = require('../services/billing/billingEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all invoices
// @route   GET /api/billing/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }
    if (customerId) filter.customer = customerId;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name industry tier')
      .sort({ createdAt: -1 });

    return sendSuccess(res, invoices, 'Invoices list retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice detail
// @route   GET /api/billing/invoices/:id
const getInvoiceById = async (req, res, next) => {
  try {
    let invoice = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      invoice = await Invoice.findById(req.params.id).populate('customer quotation');
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id }).populate('customer quotation');
    }
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }
    return sendSuccess(res, invoice, 'Invoice detail retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment against an invoice
// @route   POST /api/billing/invoices/:id/pay
const recordPayment = async (req, res, next) => {
  try {
    const { method = 'Credit Card', transactionId = 'TXN-98421' } = req.body;
    let invoice = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      invoice = await Invoice.findById(req.params.id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    }
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    invoice.status = 'Paid';
    invoice.paidAt = new Date();
    invoice.paymentDetails = {
      method,
      transactionId,
      recordedBy: req.user ? req.user.name : 'Billing Admin'
    };
    await invoice.save();

    return sendSuccess(res, invoice, 'Payment recorded successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscriptions list
// @route   GET /api/billing/subscriptions
const getSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter)
      .populate('customer', 'name tier')
      .sort({ createdAt: -1 });

    return sendSuccess(res, subscriptions, 'Subscriptions list retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subscription
// @route   GET /api/billing/subscriptions/:id
const getSubscriptionById = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id).populate('customer');
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id }).populate('customer');
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }
    return sendSuccess(res, sub, 'Subscription retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate proration preview for mid-cycle plan changes
// @route   POST /api/billing/proration-preview
const calculateProrationPreview = (req, res, next) => {
  try {
    const { currentRate = 46, newRate = 75, daysRemaining = 14 } = req.body;
    const proration = calculateProration(Number(currentRate), Number(newRate), Number(daysRemaining));
    return sendSuccess(res, proration, 'Proration preview calculated');
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Modify subscription (plan change, cycle, amount, or pause/resume)
// @route   PUT /api/billing/subscriptions/:id
const updateSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { planName, billingCycle, amount, status, notes } = req.body;
    const oldPlan = sub.planName;
    const oldAmount = sub.amount;

    if (planName) sub.planName = planName;
    if (billingCycle) sub.billingCycle = billingCycle;
    if (amount !== undefined && !isNaN(Number(amount))) sub.amount = Number(amount);
    if (status) sub.status = status;

    let actionNote = notes || 'Subscription modified';
    if (planName && planName !== oldPlan) {
      actionNote = `Plan changed from ${oldPlan} to ${planName}`;
    }
    if (amount !== undefined && Number(amount) !== oldAmount) {
      actionNote += ` (Rate updated from $${oldAmount} to $${amount})`;
    }

    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }

    sub.history.push({
      action: status === 'Paused' ? 'Plan Paused' : (status === 'Cancelled' ? 'Plan Cancelled' : 'Plan Modified'),
      date: new Date(),
      notes: actionNote
    });

    await sub.save();
    return sendSuccess(res, sub, 'Subscription updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription
// @route   POST /api/billing/subscriptions/:id/cancel
const cancelSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { reason = 'Cancelled by customer / admin' } = req.body;
    sub.status = 'Cancelled';
    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }

    sub.history.push({
      action: 'Subscription Cancelled',
      date: new Date(),
      notes: reason
    });

    await sub.save();
    return sendSuccess(res, sub, 'Subscription cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Remove subscription
// @route   DELETE /api/billing/subscriptions/:id
const deleteSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const subNum = sub.subscriptionNumber;
    await Subscription.deleteOne({ _id: sub._id });
    return sendSuccess(res, { subscriptionNumber: subNum }, 'Subscription removed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate billing (invoice and subscription) from quotation
// @route   POST /api/billing/generate/:id
const generateBilling = async (req, res, next) => {
  try {
    const result = await generateBillingFromQuotation(req.params.id);
    return sendSuccess(res, result, 'Billing documents generated from quotation', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  recordPayment,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  calculateProrationPreview,
  generateBilling
};
