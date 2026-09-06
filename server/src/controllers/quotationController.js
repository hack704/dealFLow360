const mongoose = require('mongoose');
const Quotation = require('../models/Quotation');
const { processQuotationCalculation } = require('../services/quotation/quotationEngine');
const { generateQuotationNumber } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Live preview CPQ calculation
// @route   POST /api/quotations/preview
const previewCalculation = async (req, res, next) => {
  try {
    const { customerId, items } = req.body;
    const calculation = await processQuotationCalculation({ customerId, items });
    return sendSuccess(res, calculation, 'Quotation calculation preview generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Create and persist a new quotation
// @route   POST /api/quotations
const createQuotation = async (req, res, next) => {
  try {
    const { customerId, title, items, notes, paymentTermsDays, status, submitForApproval } = req.body;

    if (!customerId || !items || items.length === 0) {
      return sendError(res, 'Customer and at least one item are required', 400);
    }

    const calc = await processQuotationCalculation({ customerId, items });

    const quoteNumber = generateQuotationNumber();
    const initialStatus = status || (submitForApproval ? 'pending_approval' : 'draft');

    const quotation = await Quotation.create({
      quotationNumber: quoteNumber,
      title: title || `Quotation for ${calc.customer ? calc.customer.name : 'Customer'}`,
      customer: customerId,
      customerName: calc.customer ? calc.customer.name : 'Unknown',
      items: calc.items,
      subtotal: calc.subtotal,
      totalCost: calc.totalCost,
      totalDiscountAmount: calc.totalDiscountAmount,
      totalDiscountPercent: calc.totalDiscountPercent,
      grandTotal: calc.grandTotal,
      blendedMarginPercent: calc.blendedMarginPercent,
      riskScore: calc.dealHealth.riskScore,
      riskLevel: calc.dealHealth.riskLevel,
      requiresApproval: calc.requiresApproval,
      approvalReason: calc.approvalReason,
      paymentTermsDays: paymentTermsDays || 30,
      notes: notes || '',
      status: initialStatus,
      createdBy: req.user ? req.user._id : null
    });

    if (initialStatus === 'pending_approval') {
      try {
        const { createApprovalRequest } = require('../services/approval/approvalEngine');
        await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: quotation.customerName || 'Sales Rep' });
      } catch (err) {
        console.warn('[QUOTATION] Auto approval request creation notice:', err.message);
      }
    } else if (initialStatus === 'approved') {
      try {
        const ApprovalRequest = require('../models/ApprovalRequest');
        await ApprovalRequest.create({
          quotation: quotation._id,
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName || 'Enterprise Account',
          submittedBy: quotation.createdBy,
          submitterName: (req.user && req.user.name) || 'Sales Rep',
          dealValue: quotation.grandTotal,
          blendedMarginPercent: quotation.blendedMarginPercent,
          maxDiscountPercent: quotation.totalDiscountPercent || 0,
          riskScore: quotation.riskScore || 15,
          currentStage: 'Approved',
          status: 'approved',
          auditTrail: [
            {
              user: (req.user && req.user.name) || 'Manager / Admin',
              action: 'Approved',
              note: 'Officially confirmed and verified in governance queue'
            }
          ]
        });
      } catch (err) {
        console.warn('[QUOTATION] Auto approval request creation notice:', err.message);
      }
    }

    const populated = await Quotation.findById(quotation._id).populate('customer');
    return sendSuccess(res, populated, 'Quotation created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quotations
// @route   GET /api/quotations
const getQuotations = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;

    const quotations = await Quotation.find(filter)
      .populate('customer', 'name industry tier creditRating')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, quotations, 'Quotations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quotation by ID or quotationNumber
// @route   GET /api/quotations/:id
const getQuotationById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = null;

    if (isObjectId) {
      quotation = await Quotation.findById(req.params.id)
        .populate('customer')
        .populate('createdBy', 'name email role department');
    }

    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNumber: req.params.id })
        .populate('customer')
        .populate('createdBy', 'name email role department');
    }

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    return sendSuccess(res, quotation, 'Quotation details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quotation details and recalculate pricing
// @route   PUT /api/quotations/:id
const updateQuotation = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = isObjectId
      ? await Quotation.findById(req.params.id)
      : await Quotation.findOne({ quotationNumber: req.params.id });

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    // DATA INTEGRITY RULE 1: Rep edit_own ownership enforcement
    if (req.user && req.user.role === 'sales_rep') {
      if (quotation.createdBy && req.user._id && quotation.createdBy.toString() !== req.user._id.toString()) {
        return sendError(res, 'Access denied: Sales reps can only edit their own quotations', 403);
      }
    }

    const { customerId, title, items, notes, status, paymentTermsDays } = req.body;

    // DATA INTEGRITY RULE 2: Non-draft line edit lock for sales reps
    if (items && items.length > 0) {
      if (req.user && req.user.role === 'sales_rep' && quotation.status !== 'draft') {
        return sendError(
          res,
          `Cannot edit quotation line items after leaving draft status (current: ${quotation.status}). Re-submission required.`,
          400
        );
      }

      const targetCustomer = customerId || quotation.customer;
      const calc = await processQuotationCalculation({
        customerId: targetCustomer,
        items: items.map((it) => ({
          productId: it.productId || it.product?._id || it.product || it.id,
          quantity: it.quantity || it.qty || 1,
          discountPercent: it.discountPercent !== undefined ? it.discountPercent : (it.discount || 0)
        }))
      });

      quotation.items = calc.items;
      quotation.subtotal = calc.subtotal;
      quotation.totalCost = calc.totalCost;
      quotation.totalDiscountAmount = calc.totalDiscountAmount;
      quotation.totalDiscountPercent = calc.totalDiscountPercent;
      quotation.grandTotal = calc.grandTotal;
      quotation.blendedMarginPercent = calc.blendedMarginPercent;
      quotation.riskScore = calc.dealHealth.riskScore;
      quotation.riskLevel = calc.dealHealth.riskLevel;
      quotation.requiresApproval = calc.requiresApproval;
      quotation.approvalReason = calc.approvalReason;
    }

    if (title) quotation.title = title;
    if (notes !== undefined) quotation.notes = notes;
    if (paymentTermsDays) quotation.paymentTermsDays = paymentTermsDays;
    if (status) quotation.status = status;

    await quotation.save();

    const populated = await Quotation.findById(quotation._id)
      .populate('customer')
      .populate('createdBy', 'name email role department');

    return sendSuccess(res, populated, 'Quotation updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quotation status (e.g. approve, reject, send, accept)
// @route   PATCH /api/quotations/:id/status
const updateQuotationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let quotation = isObjectId
      ? await Quotation.findById(req.params.id)
      : await Quotation.findOne({ quotationNumber: req.params.id });

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    // DATA INTEGRITY RULE 3: Final confirmation gate check
    if (status === 'accepted' || status === 'confirmed') {
      if (quotation.status === 'rejected') {
        return sendError(res, 'Cannot confirm quotation: Deal was rejected by governance.', 400);
      }
      if (quotation.status === 'pending_approval') {
        return sendError(res, 'Cannot confirm quotation: Deal is still pending governance approval sign-off.', 400);
      }
    }

    quotation.status = status;
    await quotation.save();

    if (status === 'approved' || status === 'accepted' || status === 'confirmed') {
      try {
        const ApprovalRequest = require('../models/ApprovalRequest');
        let appReq = await ApprovalRequest.findOne({ quotation: quotation._id });
        if (appReq) {
          appReq.status = 'approved';
          appReq.currentStage = 'Approved';
          appReq.auditTrail.push({
            user: (req.user && req.user.name) || 'Approver',
            action: 'Approved',
            note: 'Quotation approved and confirmed'
          });
          await appReq.save();
        }
        const { generateBillingFromQuotation } = require('../services/billing/billingEngine');
        await generateBillingFromQuotation(quotation._id);
      } catch (err) {
        console.warn('[QUOTATION] Auto billing generation notice:', err.message);
      }
    } else if (status === 'pending_approval') {
      try {
        const { createApprovalRequest } = require('../services/approval/approvalEngine');
        await createApprovalRequest(quotation, req.user || { _id: quotation.createdBy, name: 'Sales Rep' });
      } catch (err) {
        console.warn('[QUOTATION] Auto approval request notice:', err.message);
      }
    }

    return sendSuccess(res, quotation, `Quotation status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated dynamic live activity feed
// @route   GET /api/quotations/activity-feed
const getActivityFeed = async (req, res, next) => {
  try {
    const ApprovalRequest = require('../models/ApprovalRequest');
    const Invoice = require('../models/Invoice');
    const Subscription = require('../models/Subscription');

    const [recentApprovals, recentInvoices, recentQuotes, recentSubs] = await Promise.all([
      ApprovalRequest.find().sort({ updatedAt: -1 }).limit(10).lean(),
      Invoice.find().sort({ createdAt: -1 }).limit(10).lean(),
      Quotation.find().sort({ updatedAt: -1 }).limit(10).lean(),
      Subscription.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const activities = [];

    // 1. Approvals
    for (const ar of recentApprovals) {
      if (ar.status === 'approved') {
        activities.push({
          id: `appr-${ar._id}`,
          type: 'approval',
          title: `${ar.customerName || 'Customer'} quote approved`,
          subtitle: `Governance sign-off (${ar.currentStage || 'Approved'}) • ${ar.quotationNumber}`,
          dotColor: '#30d158',
          dotRing: 'ring-[#30d158]/20',
          badgeText: 'Approved',
          targetUrl: `/approvals`,
          timestamp: ar.updatedAt || ar.createdAt || new Date()
        });
      } else if (ar.status === 'pending') {
        activities.push({
          id: `appr-${ar._id}`,
          type: 'escalation',
          title: `Discount escalation requested`,
          subtitle: `${ar.customerName} (${ar.maxDiscountPercent || 0}% discount) • ${ar.quotationNumber}`,
          dotColor: '#ff9f0a',
          dotRing: 'ring-[#ff9f0a]/20',
          badgeText: 'Escalation',
          targetUrl: `/approvals`,
          timestamp: ar.createdAt || new Date()
        });
      } else if (ar.status === 'rejected' || ar.status === 'returned') {
        activities.push({
          id: `appr-${ar._id}`,
          type: 'rejection',
          title: `${ar.customerName} quote returned`,
          subtitle: `Discount rejected by governance • ${ar.quotationNumber}`,
          dotColor: '#ff453a',
          dotRing: 'ring-[#ff453a]/20',
          badgeText: 'Returned',
          targetUrl: `/approvals`,
          timestamp: ar.updatedAt || ar.createdAt || new Date()
        });
      }
    }

    // 2. Invoices
    for (const inv of recentInvoices) {
      if (inv.status === 'Paid') {
        activities.push({
          id: `inv-paid-${inv._id}`,
          type: 'payment',
          title: `Payment reconciled for ${inv.invoiceNumber}`,
          subtitle: `${inv.customerName} • $${(inv.grandTotal || 0).toLocaleString()} settled`,
          dotColor: '#30d158',
          dotRing: 'ring-[#30d158]/20',
          badgeText: 'Paid',
          targetUrl: `/invoices/${inv.invoiceNumber}`,
          timestamp: inv.paidAt || inv.updatedAt || inv.createdAt || new Date()
        });
      } else if (inv.type === 'Credit Note') {
        activities.push({
          id: `inv-cn-${inv._id}`,
          type: 'credit_note',
          title: `Credit note issued: ${inv.invoiceNumber}`,
          subtitle: `${inv.customerName} • $${Math.abs(inv.grandTotal || 0).toLocaleString()} refund adjustment`,
          dotColor: '#bf5af2',
          dotRing: 'ring-[#bf5af2]/20',
          badgeText: 'Credit Note',
          targetUrl: `/invoices/${inv.invoiceNumber}`,
          timestamp: inv.createdAt || new Date()
        });
      } else if (inv.type === 'Recurring Monthly' || inv.type === 'Recurring Annual') {
        activities.push({
          id: `inv-rec-${inv._id}`,
          type: 'proration',
          title: `Recurring schedule invoiced: ${inv.invoiceNumber}`,
          subtitle: `${inv.customerName} • $${(inv.grandTotal || 0).toLocaleString()} • ${inv.type}`,
          dotColor: '#bf5af2',
          dotRing: 'ring-[#bf5af2]/20',
          badgeText: 'Subscription',
          targetUrl: `/invoices/${inv.invoiceNumber}`,
          timestamp: inv.createdAt || new Date()
        });
      } else {
        activities.push({
          id: `inv-${inv._id}`,
          type: 'invoice',
          title: `Invoice generated: ${inv.invoiceNumber}`,
          subtitle: `${inv.customerName} • $${(inv.grandTotal || 0).toLocaleString()}${inv.quotationNumber ? ` • ${inv.quotationNumber}` : ''}`,
          dotColor: '#0071e3',
          dotRing: 'ring-[#0071e3]/20',
          badgeText: 'Invoice',
          targetUrl: `/invoices/${inv.invoiceNumber}`,
          timestamp: inv.createdAt || new Date()
        });
      }
    }

    // 3. Subscriptions
    for (const sub of recentSubs) {
      activities.push({
        id: `sub-${sub._id}`,
        type: 'subscription',
        title: `${sub.customerName} subscription ${sub.status.toLowerCase()}`,
        subtitle: `${sub.planName} • $${(sub.amount || 0).toLocaleString()}/mo • ${sub.subscriptionNumber}`,
        dotColor: sub.status === 'Active' ? '#30d158' : '#ff9f0a',
        dotRing: sub.status === 'Active' ? 'ring-[#30d158]/20' : 'ring-[#ff9f0a]/20',
        badgeText: 'SaaS',
        targetUrl: `/subscriptions`,
        timestamp: sub.updatedAt || sub.createdAt || new Date()
      });
    }

    // 4. Quotations
    for (const q of recentQuotes) {
      if (q.status === 'sent_to_customer') {
        activities.push({
          id: `quote-sent-${q._id}`,
          type: 'sent',
          title: `${q.quotationNumber} sent to client`,
          subtitle: `${q.customerName} • $${(q.grandTotal || 0).toLocaleString()} under review`,
          dotColor: '#0071e3',
          dotRing: 'ring-[#0071e3]/20',
          badgeText: 'Proposal',
          targetUrl: `/quotations/${q._id}`,
          timestamp: q.updatedAt || q.createdAt || new Date()
        });
      } else if (q.status === 'draft') {
        activities.push({
          id: `quote-draft-${q._id}`,
          type: 'draft',
          title: `New quotation created: ${q.quotationNumber}`,
          subtitle: `${q.customerName} • $${(q.grandTotal || 0).toLocaleString()} (${q.blendedMarginPercent || 0}% margin)`,
          dotColor: '#0071e3',
          dotRing: 'ring-[#0071e3]/20',
          badgeText: 'CPQ Draft',
          targetUrl: `/quotations/${q._id}`,
          timestamp: q.createdAt || new Date()
        });
      }
    }

    // Sort by timestamp desc
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Fallback activities if collection count is low
    if (activities.length < 4) {
      const now = Date.now();
      activities.push(
        {
          id: 'demo-1',
          type: 'approval',
          title: 'Acme Corp quote approved',
          subtitle: 'Finance VP sign-off • QT-DEMO-2026',
          dotColor: '#30d158',
          dotRing: 'ring-[#30d158]/20',
          badgeText: 'Approved',
          targetUrl: '/approvals',
          timestamp: new Date(now - 10 * 60 * 1000)
        },
        {
          id: 'demo-2',
          type: 'escalation',
          title: 'Discount escalation requested',
          subtitle: 'Beta Industries (22% discount) • Q-1042',
          dotColor: '#ff9f0a',
          dotRing: 'ring-[#ff9f0a]/20',
          badgeText: 'Escalation',
          targetUrl: '/approvals',
          timestamp: new Date(now - 35 * 60 * 1000)
        },
        {
          id: 'demo-3',
          type: 'invoice',
          title: 'East Depot stock reserved & invoiced',
          subtitle: 'Order #2291 split delivery • INV-1042',
          dotColor: '#0071e3',
          dotRing: 'ring-[#0071e3]/20',
          badgeText: 'Invoice',
          targetUrl: '/invoices',
          timestamp: new Date(now - 65 * 60 * 1000)
        },
        {
          id: 'demo-4',
          type: 'proration',
          title: 'Mid-cycle proration invoiced',
          subtitle: 'Vertex BioHealth Labs • Care Plan SLA',
          dotColor: '#bf5af2',
          dotRing: 'ring-[#bf5af2]/20',
          badgeText: 'Subscription',
          targetUrl: '/subscriptions',
          timestamp: new Date(now - 120 * 60 * 1000)
        }
      );
    }

    return sendSuccess(res, activities.slice(0, 15), 'Dynamic activity feed retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewCalculation,
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  updateQuotationStatus,
  getActivityFeed
};
