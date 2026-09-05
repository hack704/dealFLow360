const Negotiation = require('../models/Negotiation');
const Quotation = require('../models/Quotation');
const { submitCustomerCounterOffer, addNegotiationComment } = require('../services/negotiation/negotiationEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get negotiation record for a quotation
// @route   GET /api/negotiations/:quoteId
const getNegotiationByQuote = async (req, res, next) => {
  try {
    let negotiation = await Negotiation.findOne({ quotation: req.params.quoteId });
    if (!negotiation) {
      negotiation = await Negotiation.findOne({ quotationNumber: req.params.quoteId });
    }

    if (!negotiation) {
      // Fallback: look up quotation to create initial view
      const quote = await Quotation.findOne({
        $or: [{ _id: req.params.quoteId.match(/^[0-9a-fA-F]{24}$/) ? req.params.quoteId : null }, { quotationNumber: req.params.quoteId }]
      });

      if (!quote) return sendError(res, 'Quotation not found for negotiation', 404);

      return sendSuccess(
        res,
        {
          quotationNumber: quote.quotationNumber,
          customerName: quote.customerName,
          originalTotal: quote.grandTotal,
          counterTotal: quote.grandTotal,
          status: 'Under Negotiation',
          lineRedlines: quote.items.map((it, idx) => ({
            id: idx + 1,
            name: it.productName,
            qty: it.quantity,
            price: it.listPrice,
            discount: it.discountPercent,
            comment: ''
          })),
          comments: []
        },
        'Initial negotiation snapshot'
      );
    }

    return sendSuccess(res, negotiation, 'Negotiation details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit counter-offer from customer portal
// @route   POST /api/negotiations/:quoteId/counter
const submitCounterOffer = async (req, res, next) => {
  try {
    const { counterDiscountPercent, requestedDate, lineRedlines, customerComment } = req.body;
    const result = await submitCustomerCounterOffer({
      quotationId: req.params.quoteId,
      counterDiscountPercent,
      requestedDate,
      lineRedlines,
      customerComment
    });

    return sendSuccess(res, result, 'Customer counter-offer submitted and evaluated', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to negotiation thread
// @route   POST /api/negotiations/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { author, role, text } = req.body;
    const updated = await addNegotiationComment(req.params.id, { author, role, text });
    return sendSuccess(res, updated, 'Negotiation comment logged');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNegotiationByQuote,
  submitCounterOffer,
  addComment
};
