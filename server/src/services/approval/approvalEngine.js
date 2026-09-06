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
  // Category specific discount ceilings (Requirement A3: Hardware 15%, Services 10%, etc.)
  const categoryCeilings = {
    'Hardware': 15,
    'Services': 10,
    'Software': 25,
    'Support': 15,
    'Professional Services': 10
  };

  const flaggedLines = (quotation.items || []).map((it) => {
    const cat = it.category || 'Hardware';
    const limit = categoryCeilings[cat] !== undefined ? categoryCeilings[cat] : APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT;
    const isOver = (it.discountPercent || 0) > limit;
    return {
      productName: it.productName,
      category: cat,
      discountGiven: it.discountPercent || 0,
      limitAllowed: limit,
      isOver
    };
  });

  // Calculate highest discount
  const maxDiscount = Math.max(0, ...(quotation.items || []).map((it) => it.discountPercent || 0));

  // Requirement A3 Approval Chain:
  // Deals requiring approval ALWAYS enter governance at Stage 1: 'Sales Manager'
  // If high risk (>25% discount or <15% margin or riskScore >= 60), Manager approval routes to Stage 2: 'Finance'
  const currentStage = 'Sales Manager';
  const requiresFinanceStage = maxDiscount > APPROVAL_THRESHOLDS.MAX_MANAGER_DISCOUNT_PERCENT || (quotation.blendedMarginPercent || 100) < 20 || (quotation.riskScore || 0) >= 60;

  let submitterId = (user && user._id) || quotation.createdBy;
  if (!submitterId) {
    const User = require('../../models/User');
    const defaultUser = await User.findOne();
    if (defaultUser) submitterId = defaultUser._id;
  }

  const approvalReq = await ApprovalRequest.create({
    quotation: quotation._id,
    quotationNumber: quotation.quotationNumber,
    customerName: quotation.customerName || 'Enterprise Account',
    submittedBy: submitterId,
    submitterName: (user && user.name) || 'Sales Rep',
    dealValue: quotation.grandTotal,
    blendedMarginPercent: quotation.blendedMarginPercent,
    maxDiscountPercent: maxDiscount,
    riskScore: quotation.riskScore || 15,
    currentStage,
    flaggedLines,
    status: 'pending',
    auditTrail: [
      {
        user: (user && user.name) || 'Sales Rep',
        action: 'Submitted',
        note: `Submitted for approval: ${quotation.approvalReason || 'Discount/margin exception'}${requiresFinanceStage ? ' (Requires Sales Manager followed by Finance)' : ' (Sales Manager only)'}`
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

  // DATA INTEGRITY RULE 1: Self-Approval & Role Authorization Guard
  if (user && user.role === 'sales_rep') {
    throw new Error('Data Integrity Violation: Sales reps are not authorized to approve quotations. Self-approval is strictly prohibited.');
  }

  if (quotation && quotation.createdBy && user && user._id && quotation.createdBy.toString() === user._id.toString() && user.role !== 'admin') {
    throw new Error('Data Integrity Violation: The quotation creator cannot approve their own quotation.');
  }

  // DATA INTEGRITY RULE 2: Stage-Awareness & Sequencing Integrity
  if (req.status !== 'pending') {
    throw new Error(`Data Integrity Violation: Approval decision invalid. Request has already been resolved with status '${req.status}'.`);
  }

  if (user && user.role === 'sales_manager') {
    if (req.currentStage !== 'Sales Manager') {
      throw new Error(`Data Integrity Violation: Sales Manager decision invalid because approval stage has already progressed to '${req.currentStage}'.`);
    }
  }

  if (user && user.role === 'finance') {
    if (req.currentStage === 'Sales Manager') {
      throw new Error('Data Integrity Violation: Finance approval is structurally unreachable before Sales Manager approval.');
    }
    if (req.currentStage !== 'Finance') {
      throw new Error(`Data Integrity Violation: Finance decision invalid at stage '${req.currentStage}'.`);
    }
  }

  // Mandatory Reason for Rejection / Return
  if ((action === 'reject' || action === 'return') && (!note || note.trim().length === 0)) {
    throw new Error(`Data Integrity Violation: A descriptive reason is mandatory when executing action '${action}'.`);
  }

  const userRole = (user && user.role) ? user.role : 'approver';
  const userName = (user && user.name) ? user.name : 'Approver';

  if (action === 'approve') {
    if (req.currentStage === 'Sales Manager' && req.maxDiscountPercent > APPROVAL_THRESHOLDS.MAX_MANAGER_DISCOUNT_PERCENT) {
      // Escalates to Finance stage
      req.currentStage = 'Finance';
      req.auditTrail.push({
        user: `${userName} (${userRole})`,
        action: 'Approved Stage 1',
        note: note || 'Sales Manager approved stage 1 exception. Routed to Finance for stage 2 sign-off.',
        date: new Date()
      });
    } else {
      // Final confirmation
      req.status = 'approved';
      req.currentStage = 'Approved';
      req.auditTrail.push({
        user: `${userName} (${userRole})`,
        action: 'Final Approved',
        note: note || 'Final governance approval granted. Quotation released to customer.',
        date: new Date()
      });
      if (quotation) {
        quotation.status = QUOTATION_STATUSES.APPROVED;
        quotation.requiresApproval = false;
        await quotation.save();

        try {
          const { generateBillingFromQuotation } = require('../billing/billingEngine');
          await generateBillingFromQuotation(quotation._id);
        } catch (err) {
          console.warn('[APPROVAL] Billing auto-generation notice:', err.message);
        }
      }
    }
  } else if (action === 'return') {
    req.status = 'returned';
    req.currentStage = 'Returned';
    req.auditTrail.push({
      user: `${userName} (${userRole})`,
      action: 'Returned for Revision',
      note: note || 'Returned to sales rep for commercial rework.',
      date: new Date()
    });
    if (quotation) {
      quotation.status = QUOTATION_STATUSES.DRAFT;
      await quotation.save();
    }
  } else if (action === 'reject') {
    req.status = 'rejected';
    req.currentStage = 'Rejected';
    req.auditTrail.push({
      user: `${userName} (${userRole})`,
      action: 'Rejected',
      note: note || 'Deal rejected due to unacceptable risk or margin erosion.',
      date: new Date()
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
