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
    if (status) filter.status = status;
    if (stage) filter.currentStage = stage;

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
    let request = await ApprovalRequest.findById(req.params.id)
      .populate('quotation')
      .populate('submittedBy', 'name email role department');

    if (!request) {
      // Allow searching by quotation ID or number as fallback
      request = await ApprovalRequest.findOne({ quotationNumber: req.params.id })
        .populate('quotation')
        .populate('submittedBy', 'name email role department');
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
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    const approvalReq = await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: 'Sales Rep' });
    return sendSuccess(res, approvalReq, 'Quotation submitted for approval', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Take action (approve, reject, return)
// @route   POST /api/approvals/:id/action
const takeApprovalAction = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const updated = await processApprovalAction(
      req.params.id,
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
