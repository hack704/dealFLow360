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
    const { customerId, title, items, notes, paymentTermsDays } = req.body;

    if (!customerId || !items || items.length === 0) {
      return sendError(res, 'Customer and at least one item are required', 400);
    }

    const calc = await processQuotationCalculation({ customerId, items });

    const quoteNumber = generateQuotationNumber();

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
      createdBy: req.user ? req.user._id : null
    });

    return sendSuccess(res, quotation, 'Quotation created successfully', 201);
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

// @desc    Get single quotation by ID
// @route   GET /api/quotations/:id
const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer')
      .populate('createdBy', 'name email role department');

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    return sendSuccess(res, quotation, 'Quotation details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quotation status (e.g. approve, reject, send, accept)
// @route   PATCH /api/quotations/:id/status
const updateQuotationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    quotation.status = status;
    await quotation.save();

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
  updateQuotationStatus
};
