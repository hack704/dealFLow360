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

    return sendSuccess(res, invoices, 'Invoices retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice detail
// @route   GET /api/billing/invoices/:id
const getInvoiceById = async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id).populate('customer quotation');
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
    let invoice = await Invoice.findById(req.params.id);
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
    let sub = await Subscription.findById(req.params.id).populate('customer');
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
  calculateProrationPreview,
  generateBilling
};
