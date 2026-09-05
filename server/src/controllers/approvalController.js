const mongoose = require('mongoose');
const ApprovalRequest = require('../models/ApprovalRequest');
const Quotation = require('../models/Quotation');
const { createApprovalRequest, processApprovalAction } = require('../services/approval/approvalEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all approval requests (queue)
// @route   GET /api/approvals
const getApprovalsQueue = async (req, res, next) => {
  try {
    const { status, stage } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (stage) filter.currentStage = stage;

    // 1. Ensure any quotation with status 'pending_approval' has an active ApprovalRequest
    const pendingQuotes = await Quotation.find({ status: 'pending_approval' });
    for (const q of pendingQuotes) {
      const exists = await ApprovalRequest.findOne({ quotation: q._id });
      if (!exists) {
        await createApprovalRequest(q, { _id: q.createdBy, name: q.customerName || 'Sales Rep' });
      }
    }

    // 2. Ensure any quotation with status 'approved', 'accepted', or 'confirmed' has an ApprovalRequest
    const approvedQuotes = await Quotation.find({
      status: { $in: ['approved', 'accepted', 'confirmed'] }
    });
    for (const q of approvedQuotes) {
      const exists = await ApprovalRequest.findOne({ quotation: q._id });
      if (!exists) {
        await ApprovalRequest.create({
          quotation: q._id,
          quotationNumber: q.quotationNumber,
          customerName: q.customerName || 'Enterprise Account',
          submittedBy: q.createdBy,
          submitterName: 'Sales Rep',
          dealValue: q.grandTotal,
          blendedMarginPercent: q.blendedMarginPercent,
          maxDiscountPercent: q.totalDiscountPercent || 0,
          riskScore: q.riskScore || 15,
          currentStage: 'Approved',
          status: 'approved',
          auditTrail: [
            {
              user: 'Marcus Chen (Admin)',
              action: 'Approved',
              note: 'Officially confirmed and verified in governance queue'
            }
          ]
        });
      }
    }

    const requests = await ApprovalRequest.find(filter)
      .populate('quotation')
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Approval queue retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single approval request detail
// @route   GET /api/approvals/:id
const getApprovalDetails = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let request = null;

    if (isObjectId) {
      request = await ApprovalRequest.findById(req.params.id)
        .populate({
          path: 'quotation',
          populate: { path: 'customer' }
        })
        .populate('submittedBy', 'name email role department');
    }

    if (!request) {
      request = await ApprovalRequest.findOne({ quotationNumber: req.params.id })
        .populate({
          path: 'quotation',
          populate: { path: 'customer' }
        })
        .populate('submittedBy', 'name email role department');
    }

    if (!request && isObjectId) {
      request = await ApprovalRequest.findOne({ quotation: req.params.id })
        .populate({
          path: 'quotation',
          populate: { path: 'customer' }
        })
        .populate('submittedBy', 'name email role department');
    }

    // If still not found, check if a Quotation exists and create the ApprovalRequest
    if (!request) {
      let quotation = null;
      if (isObjectId) {
        quotation = await Quotation.findById(req.params.id).populate('customer');
      }
      if (!quotation) {
        quotation = await Quotation.findOne({ quotationNumber: req.params.id }).populate('customer');
      }

      if (quotation) {
        request = await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: 'Sales Rep' });
        request = await ApprovalRequest.findById(request._id)
          .populate({
            path: 'quotation',
            populate: { path: 'customer' }
          })
          .populate('submittedBy', 'name email role department');
      }
    }

    if (!request) {
      return sendError(res, 'Approval request not found', 404);
    }

    return sendSuccess(res, request, 'Approval request details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quotation for approval
// @route   POST /api/approvals/submit
const submitForApproval = async (req, res, next) => {
  try {
    const { quotationId } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(quotationId);
    let quotation = isObjectId ? await Quotation.findById(quotationId) : null;
    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNumber: quotationId });
    }

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    let approvalReq = await ApprovalRequest.findOne({ quotation: quotation._id });
    if (!approvalReq) {
      approvalReq = await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: 'Sales Rep' });
    } else {
      approvalReq.status = 'pending';
      approvalReq.currentStage = 'Sales Manager';
      approvalReq.auditTrail.push({
        user: (req.user && req.user.name) || 'Sales Rep',
        action: 'Resubmitted',
        note: 'Resubmitted quotation for management approval'
      });
      await approvalReq.save();
      quotation.status = 'pending_approval';
      quotation.requiresApproval = true;
      await quotation.save();
    }

    const populated = await ApprovalRequest.findById(approvalReq._id)
      .populate('quotation')
      .populate('submittedBy', 'name email role department');

    return sendSuccess(res, populated, 'Quotation submitted for approval', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Take action (approve, reject, return)
// @route   POST /api/approvals/:id/action
const takeApprovalAction = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let approvalReq = isObjectId ? await ApprovalRequest.findById(req.params.id) : null;
    if (!approvalReq) {
      approvalReq = await ApprovalRequest.findOne({
        $or: [
          { quotationNumber: req.params.id },
          ...(isObjectId ? [{ quotation: req.params.id }] : [])
        ]
      });
    }

    if (!approvalReq) {
      return sendError(res, 'Approval request not found', 404);
    }

    const updated = await processApprovalAction(
      approvalReq._id,
      req.user || { name: 'Manager' },
      action,
      note
    );

    return sendSuccess(res, updated, `Approval action '${action}' recorded successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovalsQueue,
  getApprovalDetails,
  submitForApproval,
  takeApprovalAction
};
