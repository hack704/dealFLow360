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

  // DATA INTEGRITY RULE: Counter-discount re-runs the exact same pricing & risk engine used everywhere
  const { processQuotationCalculation } = require('../quotation/quotationEngine');
  const counterItems = (quote.items || []).map((it) => ({
    productId: it.product,
    quantity: it.quantity || 1,
    discountPercent: discountVal > 0 ? discountVal : (it.discountPercent || 0)
  }));

  const calc = await processQuotationCalculation({
    customerId: quote.customer,
    items: counterItems
  });

  const counterTotal = calc.grandTotal || roundTwoDecimals(quote.subtotal * (1 - discountVal / 100));
  const requiresEscalation = calc.requiresApproval || discountVal > APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT;

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
    quote.riskScore = calc.dealHealth.riskScore;
    quote.riskLevel = calc.dealHealth.riskLevel;
    quote.blendedMarginPercent = calc.blendedMarginPercent;
    quote.approvalReason = calc.approvalReason || `Customer counter-offer of ${discountVal}% exceeds standard rep threshold`;
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
        appReq.riskScore = calc.dealHealth.riskScore;
        appReq.auditTrail.push({
          user: quote.customerName || 'Customer',
          action: 'Counter-Offer Submitted',
          note: `Customer requested ${discountVal}% discount (Deal risk score: ${calc.dealHealth.riskScore}/100). Deal re-entered approval queue.`
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

/**
 * Handles a Sales Rep's response to a customer counter-offer or negotiation request.
 * - 'accept': Applies customer counter discount to quotation, re-runs pricing/risk calculations,
 *             and auto-routes to approval if discount > 15%. Marks negotiation 'Accepted by Sales'.
 * - 'counter': Sets a compromise discount/date and updates quotation lines & negotiation.
 * - 'reject': Declines counter terms with a note.
 */
const processSalesNegotiationResponse = async ({
  quoteId,
  action = 'accept',
  revisedDiscountPercent,
  requestedDate,
  responseComment = '',
  user
}) => {
  const mongoose = require('mongoose');
  let quote = null;
  if (mongoose.Types.ObjectId.isValid(quoteId)) {
    quote = await Quotation.findById(quoteId);
  }
  if (!quote) {
    quote = await Quotation.findOne({ quotationNumber: quoteId });
  }
  if (!quote) throw new Error('Quotation not found');

  let negotiation = await Negotiation.findOne({ quotation: quote._id });
  if (!negotiation) {
    negotiation = await Negotiation.findOne({ quotationNumber: quote.quotationNumber });
  }

  const author = (user && user.name) || 'Sales Rep';
  const role = (user && user.role) || 'sales_rep';

  if (!negotiation) {
    negotiation = await Negotiation.create({
      quotation: quote._id,
      quotationNumber: quote.quotationNumber,
      customer: quote.customer,
      customerName: quote.customerName || 'Customer',
      originalTotal: quote.grandTotal,
      counterTotal: quote.grandTotal,
      requestedDiscountPercent: quote.totalDiscountPercent || 0,
      status: 'Under Negotiation',
      comments: []
    });
  }

  const { processQuotationCalculation } = require('../quotation/quotationEngine');

  if (action === 'accept') {
    const targetDiscount = negotiation.requestedDiscountPercent || 0;

    // Apply customer requested discount to quotation line items
    const updatedItems = (quote.items || []).map((it) => ({
      productId: it.product,
      quantity: it.quantity || 1,
      discountPercent: targetDiscount
    }));

    const calc = await processQuotationCalculation({
      customerId: quote.customer,
      items: updatedItems
    });

    quote.items = calc.items;
    quote.subtotal = calc.subtotal;
    quote.totalCost = calc.totalCost;
    quote.totalDiscountAmount = calc.totalDiscountAmount;
    quote.totalDiscountPercent = calc.totalDiscountPercent;
    quote.grandTotal = calc.grandTotal;
    quote.blendedMarginPercent = calc.blendedMarginPercent;
    quote.riskScore = calc.dealHealth.riskScore;
    quote.riskLevel = calc.dealHealth.riskLevel;

    const requiresEscalation = calc.requiresApproval || targetDiscount > APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT;

    if (requiresEscalation) {
      quote.status = QUOTATION_STATUSES.PENDING_APPROVAL;
      quote.requiresApproval = true;
      quote.approvalReason = `Sales rep accepted customer counter-offer of ${targetDiscount}% (exceeds 15% rep threshold). Re-routed to manager approval.`;

      const ApprovalRequest = require('../../models/ApprovalRequest');
      const { createApprovalRequest } = require('../approval/approvalEngine');
      let appReq = await ApprovalRequest.findOne({ quotation: quote._id });
      if (appReq) {
        appReq.status = 'pending';
        appReq.currentStage = 'Sales Manager';
        appReq.maxDiscountPercent = targetDiscount;
        appReq.dealValue = calc.grandTotal;
        appReq.riskScore = calc.dealHealth.riskScore;
        appReq.auditTrail.push({
          user: author,
          action: 'Counter Accepted by Rep',
          note: `Rep accepted customer counter-terms (${targetDiscount}% discount). Re-entered manager approval queue.`
        });
        await appReq.save();
      } else {
        await createApprovalRequest(quote, user || { _id: quote.createdBy, name: author });
      }
    } else {
      quote.status = QUOTATION_STATUSES.APPROVED;
      quote.requiresApproval = false;
    }

    await quote.save();

    negotiation.status = 'Accepted by Sales';
    negotiation.counterTotal = calc.grandTotal;
    negotiation.comments.push({
      author,
      role: 'sales_rep',
      text: responseComment || `Sales rep accepted customer counter-proposal (${targetDiscount}% discount). Terms confirmed.`
    });
    await negotiation.save();

  } else if (action === 'counter') {
    const targetDiscount = Number(revisedDiscountPercent) || 0;

    const updatedItems = (quote.items || []).map((it) => ({
      productId: it.product,
      quantity: it.quantity || 1,
      discountPercent: targetDiscount
    }));

    const calc = await processQuotationCalculation({
      customerId: quote.customer,
      items: updatedItems
    });

    quote.items = calc.items;
    quote.subtotal = calc.subtotal;
    quote.totalCost = calc.totalCost;
    quote.totalDiscountAmount = calc.totalDiscountAmount;
    quote.totalDiscountPercent = calc.totalDiscountPercent;
    quote.grandTotal = calc.grandTotal;
    quote.blendedMarginPercent = calc.blendedMarginPercent;
    quote.status = QUOTATION_STATUSES.NEGOTIATION;
    await quote.save();

    negotiation.counterTotal = calc.grandTotal;
    negotiation.requestedDiscountPercent = targetDiscount;
    if (requestedDate) negotiation.requestedDeliveryDate = new Date(requestedDate);
    negotiation.status = 'Counter-Offered';
    negotiation.comments.push({
      author,
      role: 'sales_rep',
      text: responseComment || `Sales rep submitted revised offer with ${targetDiscount}% compromise discount.`
    });
    await negotiation.save();

  } else if (action === 'reject') {
    negotiation.status = 'Rejected';
    negotiation.comments.push({
      author,
      role: 'sales_rep',
      text: responseComment || 'Sales rep declined customer counter-terms.'
    });
    await negotiation.save();
  }

  return {
    quotation: quote,
    negotiation
  };
};

module.exports = {
  submitCustomerCounterOffer,
  addNegotiationComment,
  processSalesNegotiationResponse
};

