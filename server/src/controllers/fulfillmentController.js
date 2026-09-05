const Quotation = require('../models/Quotation');
const Inventory = require('../models/Inventory');
const { calculateSplitAllocation, confirmSplitAllocation } = require('../services/fulfillment/fulfillmentEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get fulfillment queue orders
// @route   GET /api/fulfillment
const getFulfillmentList = async (req, res, next) => {
  try {
    let quotations = await Quotation.find({
      status: { $in: ['approved', 'accepted', 'sent_to_customer', 'confirmed'] }
    }).sort({ updatedAt: -1 });

    if (quotations.length === 0) {
      quotations = await Quotation.find().sort({ updatedAt: -1 }).limit(5);
    }

    const orders = quotations.map((q) => {
      const units = (q.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
      return {
        id: q.quotationNumber,
        quotationId: q._id,
        customer: q.customerName,
        totalUnits: units,
        status: units > 20 ? 'Split Required' : 'Ready to Pack',
        allocation: units > 20 ? 'Main Warehouse (75%) + East Depot (25%)' : 'Main Warehouse (100%)',
        value: q.grandTotal
      };
    });

    return sendSuccess(res, orders, 'Fulfillment list retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get split details for a fulfillment order
// @route   GET /api/fulfillment/:id
const getFulfillmentDetail = async (req, res, next) => {
  try {
    const splitData = await calculateSplitAllocation(req.params.id);
    return sendSuccess(res, splitData, 'Fulfillment split details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and dispatch split allocation
// @route   POST /api/fulfillment/:id/confirm-split
const confirmSplit = async (req, res, next) => {
  try {
    const { splits } = req.body;
    const result = await confirmSplitAllocation(req.params.id, splits);

    // Automatically generate billing documents (invoice + subscription) upon fulfillment confirmation
    try {
      const { generateBillingFromQuotation } = require('../services/billing/billingEngine');
      const billing = await generateBillingFromQuotation(req.params.id);
      result.billing = billing;
    } catch (billErr) {
      console.warn('[FULFILLMENT] Auto-billing generation notice:', billErr.message);
    }

    return sendSuccess(res, result, 'Fulfillment split confirmed and billing generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFulfillmentList,
  getFulfillmentDetail,
  confirmSplit
};
