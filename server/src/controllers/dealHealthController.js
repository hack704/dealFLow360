const DealHealth = require('../models/DealHealth');
const Quotation = require('../models/Quotation');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get deal health alerts and anomalies
// @route   GET /api/deal-health
const getDealHealthList = async (req, res, next) => {
  try {
    const deals = await DealHealth.find().sort({ riskScore: -1 });

    const quotations = await Quotation.find().sort({ updatedAt: -1 }).populate('customer createdBy');
    const dynamicDeals = quotations.map((q) => {
      let issue = 'Active pipeline review';
      let issueType = 'stalled';
      if (q.blendedMarginPercent < 20) {
        issue = `Low blended margin (${q.blendedMarginPercent}%)`;
        issueType = 'discount';
      } else if (q.totalDiscountPercent > 15) {
        issue = `Discount ${q.totalDiscountPercent}% vs max 15%`;
        issueType = 'discount';
      } else if (q.status === 'pending_approval') {
        issue = 'Pending Governance Sign-off';
        issueType = 'stalled';
      }

      return {
        id: q.quotationNumber,
        quotationId: q._id,
        deal: q.customerName || (q.customer && q.customer.name) || 'Enterprise Account',
        issue,
        issueType,
        flagged: 'Today',
        action: q.requiresApproval ? 'Awaiting Approval' : 'Review scheduled',
        actionStatus: 'pending',
        rep: q.createdBy ? q.createdBy.name : 'J. Rao',
        value: `$${(q.grandTotal || 0).toLocaleString()}`,
        riskScore: q.riskScore || 25
      };
    });

    return sendSuccess(res, dynamicDeals, 'Deal health alerts generated from active pipeline');
  } catch (error) {
    next(error);
  }
};

// @desc    Record corrective action on flagged deal (e.g. rep nudge, manager escalation)
// @route   POST /api/deal-health/:id/action
const takeDealHealthAction = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const { actionType, note } = req.body;
    let deal = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deal = await DealHealth.findById(req.params.id);
    }
    if (!deal) {
      deal = await DealHealth.findOne({ quotationNumber: req.params.id });
    }

    if (deal) {
      deal.actionTaken = actionType || 'Nudge sent';
      deal.actionStatus = 'done';
      await deal.save();
    }

    return sendSuccess(
      res,
      { dealId: req.params.id, action: actionType, status: 'completed', note },
      'Corrective deal health action logged'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDealHealthList,
  takeDealHealthAction
};
