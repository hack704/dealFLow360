const DealHealth = require('../models/DealHealth');
const Quotation = require('../models/Quotation');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get deal health alerts and anomalies
// @route   GET /api/deal-health
const getDealHealthList = async (req, res, next) => {
  try {
    const deals = await DealHealth.find().sort({ riskScore: -1 });

    // If database has no alerts yet, generate dynamic alerts from active quotations
    if (deals.length === 0) {
      const quotations = await Quotation.find().populate('customer createdBy');
      const dynamicDeals = quotations.map((q) => {
        let issue = 'Active pipeline review';
        let issueType = 'stalled';
        if (q.blendedMarginPercent < 20) {
          issue = `Low blended margin (${q.blendedMarginPercent}%)`;
          issueType = 'discount';
        } else if (q.totalDiscountPercent > 15) {
          issue = `Discount ${q.totalDiscountPercent}% vs avg 8%`;
          issueType = 'discount';
        }

        return {
          id: q.quotationNumber,
          deal: q.customerName,
          issue,
          issueType,
          flagged: 'Today',
          action: q.requiresApproval ? 'Awaiting Approval' : 'Review scheduled',
          actionStatus: 'pending',
          rep: q.createdBy ? q.createdBy.name : 'J. Rao',
          value: `$${q.grandTotal.toLocaleString()}`,
          riskScore: q.riskScore || 25
        };
      });

      return sendSuccess(res, dynamicDeals, 'Deal health alerts generated from active pipeline');
    }

    return sendSuccess(res, deals, 'Deal health alerts retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Record corrective action on flagged deal (e.g. rep nudge, manager escalation)
// @route   POST /api/deal-health/:id/action
const takeDealHealthAction = async (req, res, next) => {
  try {
    const { actionType, note } = req.body;
    let deal = await DealHealth.findById(req.params.id);
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
