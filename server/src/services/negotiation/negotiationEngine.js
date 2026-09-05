const Negotiation = require('../../models/Negotiation');
const Quotation = require('../../models/Quotation');
const { APPROVAL_THRESHOLDS, QUOTATION_STATUSES } = require('../../config/constants');
const { roundTwoDecimals } = require('../../utils/helpers');

/**
 * Submits a customer counter-offer or proposal adjustment from the Customer Portal.
 * @param {Object} param0 - { quotationId, counterDiscountPercent, requestedDate, lineRedlines, customerComment }
 * @returns {Object} Updated or created Negotiation document
 */
const submitCustomerCounterOffer = async ({
  quotationId,
  counterDiscountPercent,
  requestedDate,
  lineRedlines = [],
  customerComment = ''
}) => {
  const mongoose = require('mongoose');
  let quote = null;
  if (mongoose.Types.ObjectId.isValid(quotationId)) {
    quote = await Quotation.findById(quotationId);
  }
  if (!quote) {
    quote = await Quotation.findOne({ quotationNumber: quotationId });
  }
  if (!quote) throw new Error('Quotation not found');

  const discountVal = Number(counterDiscountPercent) || 0;
  const originalTotal = quote.grandTotal;
  const counterTotal = roundTwoDecimals(quote.subtotal * (1 - discountVal / 100));

  const requiresEscalation =
    discountVal > APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT ||
    quote.blendedMarginPercent < APPROVAL_THRESHOLDS.MIN_ACCEPTABLE_MARGIN_PERCENT;

  let negotiation = await Negotiation.findOne({ quotation: quote._id });

  const initialComments = customerComment
    ? [
        {
          author: quote.customerName || 'Customer',
          role: 'customer',
          text: customerComment
        }
      ]
    : [];

  if (!negotiation) {
    negotiation = await Negotiation.create({
      quotation: quote._id,
      quotationNumber: quote.quotationNumber,
      customer: quote.customer,
      customerName: quote.customerName,
      originalTotal,
      counterTotal,
      requestedDiscountPercent: discountVal,
      requestedDeliveryDate: requestedDate ? new Date(requestedDate) : null,
      status: 'Counter-Offered',
      lineRedlines,
      comments: initialComments
    });
  } else {
    negotiation.counterTotal = counterTotal;
    negotiation.requestedDiscountPercent = discountVal;
    if (requestedDate) negotiation.requestedDeliveryDate = new Date(requestedDate);
    negotiation.status = 'Counter-Offered';
    negotiation.lineRedlines = lineRedlines;
    if (customerComment) {
      negotiation.comments.push({
        author: quote.customerName || 'Customer',
        role: 'customer',
        text: customerComment
      });
    }
    await negotiation.save();
  }

  // If counter discount triggers escalation, update quotation status and re-enter approval flow
  if (requiresEscalation) {
    quote.status = QUOTATION_STATUSES.PENDING_APPROVAL;
    quote.requiresApproval = true;
    quote.approvalReason = `Customer counter-offer of ${discountVal}% exceeds standard rep threshold`;
    await quote.save();

    try {
      const ApprovalRequest = require('../../models/ApprovalRequest');
      const { createApprovalRequest } = require('../approval/approvalEngine');
      let appReq = await ApprovalRequest.findOne({ quotation: quote._id });
      if (appReq) {
        appReq.status = 'pending';
        appReq.currentStage = 'Sales Manager';
        appReq.maxDiscountPercent = discountVal;
        appReq.dealValue = counterTotal;
        appReq.auditTrail.push({
          user: quote.customerName || 'Customer',
          action: 'Counter-Offer Submitted',
          note: `Customer requested ${discountVal}% discount. Deal re-entered approval queue.`
        });
        await appReq.save();
      } else {
        await createApprovalRequest(quote, { name: quote.customerName || 'Customer Portal' });
      }
    } catch (appErr) {
      console.warn('[NEGOTIATION] Approval escalation sync note:', appErr.message);
    }
  }

  return {
    negotiation,
    requiresEscalation,
    counterTotal
  };
};

/**
 * Adds an interactive comment to a deal negotiation.
 */
const addNegotiationComment = async (negotiationId, { author, role, text }) => {
  const negotiation = await Negotiation.findById(negotiationId);
  if (!negotiation) throw new Error('Negotiation record not found');

  negotiation.comments.push({
    author,
    role: role || 'sales_rep',
    text
  });

  await negotiation.save();
  return negotiation;
};

module.exports = {
  submitCustomerCounterOffer,
  addNegotiationComment
};
