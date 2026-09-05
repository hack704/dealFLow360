const ApprovalRequest = require('../../models/ApprovalRequest');
const Quotation = require('../../models/Quotation');
const { APPROVAL_THRESHOLDS, QUOTATION_STATUSES } = require('../../config/constants');

/**
 * Creates or updates an approval request for a quotation requiring governance sign-off.
 * @param {Object} quotation - Quotation document
 * @param {Object} user - User initiating submission
 * @returns {Object} Created ApprovalRequest document
 */
const createApprovalRequest = async (quotation, user) => {
  const flaggedLines = (quotation.items || []).map((it) => {
    const isOver = (it.discountPercent || 0) > APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT;
    return {
      productName: it.productName,
      discountGiven: it.discountPercent || 0,
      limitAllowed: APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT,
      isOver
    };
  });

  // Calculate highest discount
  const maxDiscount = Math.max(0, ...(quotation.items || []).map((it) => it.discountPercent || 0));

  // Determine initial approval stage
  let currentStage = 'Sales Manager';
  if (maxDiscount > APPROVAL_THRESHOLDS.MAX_MANAGER_DISCOUNT_PERCENT || quotation.blendedMarginPercent < 15) {
    currentStage = 'Finance';
  }

  const approvalReq = await ApprovalRequest.create({
    quotation: quotation._id,
    quotationNumber: quotation.quotationNumber,
    customerName: quotation.customerName || 'Enterprise Account',
    submittedBy: user._id,
    submitterName: user.name || 'Sales Rep',
    dealValue: quotation.grandTotal,
    blendedMarginPercent: quotation.blendedMarginPercent,
    maxDiscountPercent: maxDiscount,
    riskScore: quotation.riskScore || 15,
    currentStage,
    flaggedLines,
    status: 'pending',
    auditTrail: [
      {
        user: user.name || 'Sales Rep',
        action: 'Submitted',
        note: `Submitted for approval: ${quotation.approvalReason || 'Discount/margin exception'}`
      }
    ]
  });

  // Ensure quotation status is set to PENDING_APPROVAL
  quotation.status = QUOTATION_STATUSES.PENDING_APPROVAL;
  quotation.requiresApproval = true;
  await quotation.save();

  return approvalReq;
};

/**
 * Processes an approval action (approve, reject, return) with full audit logging.
 * @param {String} requestId - ApprovalRequest ID
 * @param {Object} user - Approver user
 * @param {String} action - 'approve' | 'reject' | 'return'
 * @param {String} note - Approver feedback justification
 */
const processApprovalAction = async (requestId, user, action, note = '') => {
  const req = await ApprovalRequest.findById(requestId).populate('quotation');
  if (!req) {
    throw new Error('Approval request not found');
  }

  const quotation = await Quotation.findById(req.quotation._id || req.quotation);

  if (action === 'approve') {
    if (req.currentStage === 'Sales Manager' && req.maxDiscountPercent > APPROVAL_THRESHOLDS.MAX_MANAGER_DISCOUNT_PERCENT) {
      // Escalates to Finance stage
      req.currentStage = 'Finance';
      req.auditTrail.push({
        user: user.name || 'Manager',
        action: 'Approved',
        note: note || 'Manager endorsed deal exception. Forwarded to Finance.'
      });
    } else {
      // Final confirmation
      req.status = 'approved';
      req.currentStage = 'Approved';
      req.auditTrail.push({
        user: user.name || 'Approver',
        action: 'Approved',
        note: note || 'Final approval granted. Quote ready for customer.'
      });
      if (quotation) {
        quotation.status = QUOTATION_STATUSES.APPROVED;
        quotation.requiresApproval = false;
        await quotation.save();
      }
    }
  } else if (action === 'return') {
    req.status = 'returned';
    req.currentStage = 'Returned';
    req.auditTrail.push({
      user: user.name || 'Approver',
      action: 'Returned',
      note: note || 'Returned to sales rep for discount rework.'
    });
    if (quotation) {
      quotation.status = QUOTATION_STATUSES.DRAFT;
      await quotation.save();
    }
  } else if (action === 'reject') {
    req.status = 'rejected';
    req.currentStage = 'Rejected';
    req.auditTrail.push({
      user: user.name || 'Approver',
      action: 'Rejected',
      note: note || 'Deal rejected due to unacceptable risk or margin erosion.'
    });
    if (quotation) {
      quotation.status = QUOTATION_STATUSES.REJECTED;
      await quotation.save();
    }
  } else {
    throw new Error(`Invalid approval action: ${action}`);
  }

  await req.save();
  return req;
};

module.exports = {
  createApprovalRequest,
  processApprovalAction
};
