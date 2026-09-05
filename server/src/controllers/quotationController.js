const mongoose = require('mongoose');
const Quotation = require('../models/Quotation');
const { processQuotationCalculation } = require('../services/quotation/quotationEngine');
const { generateQuotationNumber } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Live preview CPQ calculation
// @route   POST /api/quotations/preview
const previewCalculation = async (req, res, next) => {
  try {
    const { customerId, items } = req.body;
    const calculation = await processQuotationCalculation({ customerId, items });
    return sendSuccess(res, calculation, 'Quotation calculation preview generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Create and persist a new quotation
// @route   POST /api/quotations
const createQuotation = async (req, res, next) => {
  try {
    const { customerId, title, items, notes, paymentTermsDays, status, submitForApproval } = req.body;

    if (!customerId || !items || items.length === 0) {
      return sendError(res, 'Customer and at least one item are required', 400);
    }

    const calc = await processQuotationCalculation({ customerId, items });

    const quoteNumber = generateQuotationNumber();
    const initialStatus = status || (submitForApproval ? 'pending_approval' : 'draft');

    const quotation = await Quotation.create({
      quotationNumber: quoteNumber,
      title: title || `Quotation for ${calc.customer ? calc.customer.name : 'Customer'}`,
      customer: customerId,
      customerName: calc.customer ? calc.customer.name : 'Unknown',
      items: calc.items,
      subtotal: calc.subtotal,
      totalCost: calc.totalCost,
      totalDiscountAmount: calc.totalDiscountAmount,
      totalDiscountPercent: calc.totalDiscountPercent,
      grandTotal: calc.grandTotal,
      blendedMarginPercent: calc.blendedMarginPercent,
      riskScore: calc.dealHealth.riskScore,
      riskLevel: calc.dealHealth.riskLevel,
      requiresApproval: calc.requiresApproval,
      approvalReason: calc.approvalReason,
      paymentTermsDays: paymentTermsDays || 30,
      notes: notes || '',
      status: initialStatus,
      createdBy: req.user ? req.user._id : null
    });

    if (initialStatus === 'pending_approval') {
      try {
        const { createApprovalRequest } = require('../services/approval/approvalEngine');
        await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: quotation.customerName || 'Sales Rep' });
      } catch (err) {
        console.warn('[QUOTATION] Auto approval request creation notice:', err.message);
      }
    }

    const populated = await Quotation.findById(quotation._id).populate('customer');
    return sendSuccess(res, populated, 'Quotation created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quotations
// @route   GET /api/quotations
const getQuotations = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;

    const quotations = await Quotation.find(filter)
      .populate('customer', 'name industry tier creditRating')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, quotations, 'Quotations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quotation by ID or quotationNumber
// @route   GET /api/quotations/:id
const getQuotationById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = null;

    if (isObjectId) {
      quotation = await Quotation.findById(req.params.id)
        .populate('customer')
        .populate('createdBy', 'name email role department');
    }

    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNumber: req.params.id })
        .populate('customer')
        .populate('createdBy', 'name email role department');
    }

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    return sendSuccess(res, quotation, 'Quotation details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quotation details and recalculate pricing
// @route   PUT /api/quotations/:id
const updateQuotation = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = isObjectId
      ? await Quotation.findById(req.params.id)
      : await Quotation.findOne({ quotationNumber: req.params.id });

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    const { customerId, title, items, notes, status, paymentTermsDays } = req.body;

    if (items && items.length > 0) {
      const targetCustomer = customerId || quotation.customer;
      const calc = await processQuotationCalculation({
        customerId: targetCustomer,
        items: items.map((it) => ({
          productId: it.productId || it.product?._id || it.product || it.id,
          quantity: it.quantity || it.qty || 1,
          discountPercent: it.discountPercent !== undefined ? it.discountPercent : (it.discount || 0)
        }))
      });

      quotation.items = calc.items;
      quotation.subtotal = calc.subtotal;
      quotation.totalCost = calc.totalCost;
      quotation.totalDiscountAmount = calc.totalDiscountAmount;
      quotation.totalDiscountPercent = calc.totalDiscountPercent;
      quotation.grandTotal = calc.grandTotal;
      quotation.blendedMarginPercent = calc.blendedMarginPercent;
      quotation.riskScore = calc.dealHealth.riskScore;
      quotation.riskLevel = calc.dealHealth.riskLevel;
      quotation.requiresApproval = calc.requiresApproval;
      quotation.approvalReason = calc.approvalReason;
    }

    if (title) quotation.title = title;
    if (notes !== undefined) quotation.notes = notes;
    if (paymentTermsDays) quotation.paymentTermsDays = paymentTermsDays;
    if (status) quotation.status = status;

    await quotation.save();

    const populated = await Quotation.findById(quotation._id)
      .populate('customer')
      .populate('createdBy', 'name email role department');

    return sendSuccess(res, populated, 'Quotation updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quotation status (e.g. approve, reject, send, accept)
// @route   PATCH /api/quotations/:id/status
const updateQuotationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = isObjectId
      ? await Quotation.findById(req.params.id)
      : await Quotation.findOne({ quotationNumber: req.params.id });

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    quotation.status = status;
    await quotation.save();

    if (status === 'approved' || status === 'accepted' || status === 'confirmed') {
      try {
        const { generateBillingFromQuotation } = require('../services/billing/billingEngine');
        await generateBillingFromQuotation(quotation._id);
      } catch (err) {
        console.warn('[QUOTATION] Auto billing generation notice:', err.message);
      }
    }

    return sendSuccess(res, quotation, `Quotation status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewCalculation,
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  updateQuotationStatus
};
