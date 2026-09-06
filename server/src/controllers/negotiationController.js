const Negotiation = require('../models/Negotiation');
const Quotation = require('../models/Quotation');
const {
  submitCustomerCounterOffer,
  addNegotiationComment,
  processSalesNegotiationResponse
} = require('../services/negotiation/negotiationEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const mongoose = require('mongoose');

// @desc    Get negotiation for a quotation
// @route   GET /api/negotiations/:quoteId
const getNegotiationByQuote = async (req, res, next) => {
  try {
    const quoteId = req.params.quoteId || req.query.quoteId;
    let negotiation = null;
    let quote = null;

    if (quoteId && quoteId !== 'latest') {
      if (mongoose.Types.ObjectId.isValid(quoteId)) {
        negotiation = await Negotiation.findOne({ quotation: quoteId }).populate('customer quotation');
        quote = await Quotation.findById(quoteId).populate('customer items.product');
      }
      if (!negotiation) {
        negotiation = await Negotiation.findOne({ quotationNumber: quoteId }).populate('customer quotation');
      }
      if (!quote) {
        quote = await Quotation.findOne({ quotationNumber: quoteId }).populate('customer items.product');
      }
    } else {
      negotiation = await Negotiation.findOne().populate('customer quotation').sort({ updatedAt: -1 });
      if (!negotiation) {
        quote = await Quotation.findOne().populate('customer items.product').sort({ createdAt: -1 });
      }
    }

    if (!negotiation && quote) {
      negotiation = {
        _id: quote._id,
        quotationId: quote._id,
        quotationNumber: quote.quotationNumber,
        customerName: quote.customerName || quote.customer?.name || 'Valued Customer',
        customer: quote.customer,
        status: quote.status,
        originalTotal: quote.grandTotal,
        counterTotal: quote.grandTotal,
        requestedDiscountPercent: quote.overallDiscountPercent || 10,
        lineRedlines: (quote.items || []).map((item, idx) => ({
          id: idx + 1,
          name: item.productName || item.product?.name || 'Product Item',
          qty: item.quantity || 1,
          price: item.unitPrice || item.basePrice || 0,
          discount: item.discountPercent || 0,
          comment: 'Standard commercial warranty terms agreed'
        })),
        comments: []
      };
    }

    if (!negotiation) {
      return sendSuccess(res, null, 'No quotation found for negotiation');
    }

    // DATA INTEGRITY RULE: Strict customer ownership enforcement on portal negotiation routes
    if (req.user && req.user.role === 'customer') {
      const quoteCustId = (negotiation.customer?._id || negotiation.customer || (quote && (quote.customer?._id || quote.customer)))?.toString();
      const userCustId = (req.user.customerId || req.user._id)?.toString();
      if (quoteCustId && userCustId && quoteCustId !== userCustId) {
        return sendError(res, 'Access denied: Customers are strictly prohibited from viewing quotations belonging to other accounts.', 403);
      }
    }

    return sendSuccess(res, negotiation, 'Negotiation retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit customer counter-offer
// @route   POST /api/negotiations/:quoteId/counter
const submitCounterOffer = async (req, res, next) => {
  try {
    const { counterDiscountPercent, requestedDate, lineRedlines, customerComment } = req.body;

    // DATA INTEGRITY RULE: Customer ownership check before processing counter-offer
    if (req.user && req.user.role === 'customer') {
      let targetQuote = await Quotation.findById(req.params.quoteId);
      if (!targetQuote) {
        targetQuote = await Quotation.findOne({ quotationNumber: req.params.quoteId });
      }
      if (targetQuote) {
        const quoteCustId = (targetQuote.customer?._id || targetQuote.customer)?.toString();
        const userCustId = (req.user.customerId || req.user._id)?.toString();
        if (quoteCustId && userCustId && quoteCustId !== userCustId) {
          return sendError(res, 'Access denied: You cannot submit counter-proposals for another organization quotation.', 403);
        }
      }
    }

    const result = await submitCustomerCounterOffer({
      quotationId: req.params.quoteId,
      counterDiscountPercent,
      requestedDate,
      lineRedlines,
      customerComment
    });
    return sendSuccess(res, result, 'Counter-offer submitted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a negotiation
// @route   POST /api/negotiations/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text, role } = req.body;
    const author = req.user ? req.user.name : 'Sales Rep';
    const updated = await addNegotiationComment(req.params.id, {
      author,
      role: role || (req.user ? req.user.role : 'sales_rep'),
      text
    });
    return sendSuccess(res, updated, 'Comment added to negotiation');
  } catch (error) {
    next(error);
  }
};

// @desc    Sales rep responds to customer negotiation
// @route   POST /api/negotiations/:quoteId/respond
const respondToNegotiation = async (req, res, next) => {
  try {
    const { action, revisedDiscountPercent, requestedDate, responseComment } = req.body;
    const { quoteId } = req.params;

    const result = await processSalesNegotiationResponse({
      quoteId,
      action: action || 'accept',
      revisedDiscountPercent,
      requestedDate,
      responseComment,
      user: req.user
    });

    return sendSuccess(res, result, `Successfully processed negotiation response (${action || 'accept'})`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNegotiationByQuote,
  submitCounterOffer,
  addComment,
  respondToNegotiation
};
