const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const RecurringPlan = require('../models/RecurringPlan');
const {
  generateBillingFromQuotation,
  calculateProration,
  calculateMidCycleProration,
  evaluateSubscriptionReturnPolicy,
  pauseSubscriptionLogic,
  resumeSubscriptionLogic
} = require('../services/billing/billingEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all invoices
// @route   GET /api/billing/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }
    if (customerId) filter.customer = customerId;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name industry tier')
      .populate('quotation', 'quotationNumber title grandTotal status')
      .sort({ createdAt: -1 });

    return sendSuccess(res, invoices, 'Invoices list retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice detail
// @route   GET /api/billing/invoices/:id
const getInvoiceById = async (req, res, next) => {
  try {
    let invoice = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      invoice = await Invoice.findById(req.params.id).populate('customer quotation');
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id }).populate('customer quotation');
    }
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }
    return sendSuccess(res, invoice, 'Invoice detail retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment against an invoice
// @route   POST /api/billing/invoices/:id/pay
const recordPayment = async (req, res, next) => {
  try {
    const { method = 'Credit Card', transactionId = 'TXN-98421' } = req.body;
    let invoice = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      invoice = await Invoice.findById(req.params.id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    }
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    // DATA INTEGRITY RULE: Payment recording must be strictly idempotent
    if (invoice.status === 'Paid') {
      return sendSuccess(res, invoice, 'Payment already recorded (idempotent no-op - no duplicate balance alteration)');
    }

    invoice.status = 'Paid';
    invoice.paidAt = new Date();
    invoice.paymentDetails = {
      method,
      transactionId,
      recordedBy: req.user ? req.user.name : 'Billing Admin'
    };
    await invoice.save();

    return sendSuccess(res, invoice, 'Payment recorded successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscriptions list
// @route   GET /api/billing/subscriptions
const getSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter)
      .populate('customer', 'name tier')
      .sort({ createdAt: -1 });

    return sendSuccess(res, subscriptions, 'Subscriptions list retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subscription
// @route   GET /api/billing/subscriptions/:id
const getSubscriptionById = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id).populate('customer');
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id }).populate('customer');
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }
    return sendSuccess(res, sub, 'Subscription retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate proration preview for mid-cycle quantity or plan changes (Requirement A5)
// @route   POST /api/billing/proration-preview
const calculateProrationPreview = (req, res, next) => {
  try {
    const {
      currentRate = 46,
      newRate = 75,
      oldSeats = 1,
      newSeats = 1,
      unitPrice,
      daysRemaining = 14,
      totalCycleDays = 30,
      method = 'daily_exact'
    } = req.body;

    const result = calculateMidCycleProration({
      oldSeats: Number(oldSeats) || 1,
      newSeats: Number(newSeats) || 1,
      unitPrice: unitPrice !== undefined ? Number(unitPrice) : Number(currentRate),
      oldPlanPrice: Number(currentRate),
      newPlanPrice: Number(newRate),
      daysRemainingInCycle: Number(daysRemaining) || 14,
      totalCycleDays: Number(totalCycleDays) || 30,
      method
    });

    return sendSuccess(res, result, 'Proration preview calculated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Modify subscription (plan change, cycle, amount, or pause/resume)
// @route   PUT /api/billing/subscriptions/:id
const updateSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { planName, billingCycle, amount, status, notes } = req.body;
    const oldPlan = sub.planName;
    const oldAmount = sub.amount;

    if (planName) sub.planName = planName;
    if (billingCycle) sub.billingCycle = billingCycle;
    if (amount !== undefined && !isNaN(Number(amount))) sub.amount = Number(amount);
    if (status) sub.status = status;

    let actionNote = notes || 'Subscription modified';
    if (planName && planName !== oldPlan) {
      actionNote = `Plan changed from ${oldPlan} to ${planName}`;
    }
    if (amount !== undefined && Number(amount) !== oldAmount) {
      actionNote += ` (Rate updated from $${oldAmount} to $${amount})`;
    }

    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }

    sub.history.push({
      action: status === 'Paused' ? 'Plan Paused' : (status === 'Cancelled' ? 'Plan Cancelled' : 'Plan Modified'),
      date: new Date(),
      notes: actionNote
    });

    await sub.save();
    return sendSuccess(res, sub, 'Subscription updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Pause subscription
// @route   POST /api/billing/subscriptions/:id/pause
const pauseSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { reason = 'Temporary seasonal suspension / hold' } = req.body;
    pauseSubscriptionLogic(sub, reason);
    await sub.save();

    return sendSuccess(res, sub, 'Subscription paused successfully. Automated invoicing halted.');
  } catch (error) {
    next(error);
  }
};

// @desc    Resume subscription
// @route   POST /api/billing/subscriptions/:id/resume
const resumeSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { pausedDays, newNextBill } = resumeSubscriptionLogic(sub);
    await sub.save();

    return sendSuccess(
      res,
      { subscription: sub, pausedDays, newNextBill },
      `Subscription resumed successfully. Next billing date extended by ${pausedDays} paused day(s) to ${newNextBill.toISOString().split('T')[0]}.`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get return and cancellation policy rules
// @route   GET /api/billing/subscriptions/return-policy
const getReturnPolicyRules = (req, res, next) => {
  try {
    const policyRules = {
      defaultGracePeriodDays: 14,
      gracePeriodRefund: '100% Full Refund',
      postGracePeriodRefund: 'Daily Exact Proration Credit Note',
      formula: 'Refund = Amount Paid × (Days Remaining ÷ Total Cycle Days)',
      cancellationNoticeDays: 30,
      supportedRefundMethods: ['credit_note', 'original_payment'],
      activePolicySummary: 'Full refund within 14 days of cycle start. Daily proration credit note issued for mid-cycle returns.'
    };
    return sendSuccess(res, policyRules, 'Subscription return policy rules retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription applying return policy
// @route   POST /api/billing/subscriptions/:id/cancel
const cancelSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const { reason = 'Cancelled by customer / admin', refundPercent } = req.body;

    // Evaluate return and refund policy dynamically
    const policyResult = evaluateSubscriptionReturnPolicy(sub, {
      cancellationDate: new Date(),
      reason,
      forceRefundPercent: refundPercent
    });

    sub.status = 'Cancelled';
    sub.cancellationDetails = {
      cancelledAt: new Date(),
      cancelledBy: req.user ? req.user.name : 'System Admin',
      reason,
      refundAmount: policyResult.refundAmount,
      refundMethod: policyResult.refundMethod,
      policyApplied: policyResult.policyApplied
    };

    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }

    sub.history.push({
      action: 'Subscription Cancelled',
      date: new Date(),
      notes: `${reason} — Policy: ${policyResult.policyApplied} (Refund: $${policyResult.refundAmount})`
    });

    await sub.save();

    // DATA INTEGRITY RULE: Return policy refunds must be recorded as explicit Credit Note ledger entries
    let creditNote = null;
    if (policyResult.refundAmount > 0) {
      try {
        creditNote = await Invoice.create({
          invoiceNumber: `CN-${Date.now().toString().slice(-6)}`,
          customer: sub.customer,
          customerName: sub.customerName || 'Valued Customer',
          subscription: sub._id,
          type: 'Credit Note',
          items: [
            {
              item: `Return Policy Refund: ${sub.planName} (${policyResult.policyApplied})`,
              quantity: 1,
              unitPrice: -policyResult.refundAmount,
              discountPercent: 0,
              total: -policyResult.refundAmount
            }
          ],
          subtotal: -policyResult.refundAmount,
          taxAmount: 0,
          grandTotal: -policyResult.refundAmount,
          status: 'Paid',
          dueDate: new Date(),
          paidAt: new Date(),
          creditReason: `${reason} [${policyResult.policyApplied}]`,
          paymentDetails: {
            method: policyResult.refundMethod === 'original_payment' ? 'Original Payment Method' : 'Account Credit Balance',
            transactionId: `CR-${Date.now().toString().slice(-6)}`,
            recordedBy: req.user ? req.user.name : 'Finance / Ops'
          }
        });

        sub.cancellationDetails.creditNoteNumber = creditNote.invoiceNumber;
        await sub.save();
      } catch (creditErr) {
        console.warn('[BILLING] Credit note ledger creation notice:', creditErr.message);
      }
    }

    return sendSuccess(
      res,
      { subscription: sub, policyResult, creditNote },
      `Subscription cancelled under ${policyResult.policyApplied}. ${creditNote ? `Credit note ${creditNote.invoiceNumber} created for $${policyResult.refundAmount}.` : 'No refund due.'}`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Remove subscription
// @route   DELETE /api/billing/subscriptions/:id
const deleteSubscription = async (req, res, next) => {
  try {
    let sub = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sub = await Subscription.findById(req.params.id);
    }
    if (!sub) {
      sub = await Subscription.findOne({ subscriptionNumber: req.params.id });
    }
    if (!sub) {
      return sendError(res, 'Subscription not found', 404);
    }

    const subNum = sub.subscriptionNumber;
    await Subscription.deleteOne({ _id: sub._id });
    return sendSuccess(res, { subscriptionNumber: subNum }, 'Subscription removed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get recurring plans (monthly, quarterly, yearly) with attached products (Requirement A5)
// @route   GET /api/billing/plans
const getRecurringPlans = async (req, res, next) => {
  try {
    let plans = await RecurringPlan.find({ isActive: true }).populate('attachedProducts', 'name sku category basePrice pricingType');
    if (!plans || plans.length === 0) {
      // Seed default initial plans matching requirement A5
      const products = await Product.find({ isActive: true });
      const hardwareProd = products.find(p => p.category === 'Hardware');
      const supportProd = products.find(p => p.category === 'Support' || p.category === 'Professional Services');
      const cloudProd = products.find(p => p.category === 'Cloud Service' || p.category === 'Software');

      plans = await RecurringPlan.create([
        {
          name: 'Care Plan Standard',
          billingCycle: 'Monthly',
          basePrice: 40,
          description: 'Essential hardware & software maintenance plan with 24/7 incident response.',
          attachedProducts: hardwareProd ? [hardwareProd._id] : [],
          prorationRule: { method: 'daily_exact', autoIssueCreditNote: true, invoiceSeatIncreasesImmediately: true },
          cancellationPolicy: { gracePeriodDays: 14, policyType: 'prorated_credit', refundMethod: 'credit_note' }
        },
        {
          name: 'Support SLA Tier 1',
          billingCycle: 'Quarterly',
          basePrice: 120,
          description: 'Quarterly support SLA guaranteeing sub-4h resolution times.',
          attachedProducts: supportProd ? [supportProd._id] : [],
          prorationRule: { method: 'daily_exact', autoIssueCreditNote: true, invoiceSeatIncreasesImmediately: true },
          cancellationPolicy: { gracePeriodDays: 14, policyType: 'full_refund_grace', refundMethod: 'credit_note' }
        },
        {
          name: 'Enterprise Cloud Hub',
          billingCycle: 'Yearly',
          basePrice: 3600,
          description: 'Annual enterprise multi-tenant cloud subscription with dedicated VPC.',
          attachedProducts: cloudProd ? [cloudProd._id] : [],
          prorationRule: { method: 'calendar_days', autoIssueCreditNote: true, invoiceSeatIncreasesImmediately: true },
          cancellationPolicy: { gracePeriodDays: 30, policyType: 'prorated_credit', refundMethod: 'credit_note' }
        }
      ]);
      plans = await RecurringPlan.find({ isActive: true }).populate('attachedProducts', 'name sku category basePrice pricingType');
    }

    return sendSuccess(res, plans, 'Recurring plans list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring plan (Requirement A5: monthly, quarterly, yearly attached to specific products/services)
// @route   POST /api/billing/plans
const createRecurringPlan = async (req, res, next) => {
  try {
    const { name, billingCycle, basePrice, description, attachedProducts, prorationRule, cancellationPolicy } = req.body;
    if (!name || basePrice === undefined) {
      return sendError(res, 'Plan name and base price are required', 400);
    }

    const plan = await RecurringPlan.create({
      name,
      billingCycle: billingCycle || 'Monthly',
      basePrice: Number(basePrice),
      description: description || '',
      attachedProducts: Array.isArray(attachedProducts) ? attachedProducts : [],
      prorationRule: prorationRule || { method: 'daily_exact', autoIssueCreditNote: true, invoiceSeatIncreasesImmediately: true },
      cancellationPolicy: cancellationPolicy || { gracePeriodDays: 14, policyType: 'prorated_credit', refundMethod: 'credit_note' }
    });

    // Update attached products references
    if (Array.isArray(attachedProducts) && attachedProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: attachedProducts } },
        { $addToSet: { attachedRecurringPlans: plan._id } }
      );
    }

    const populated = await RecurringPlan.findById(plan._id).populate('attachedProducts', 'name sku category basePrice pricingType');
    return sendSuccess(res, populated, 'Recurring plan created and attached to products successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update recurring plan (including attached products, proration & cancellation rules)
// @route   PUT /api/billing/plans/:id
const updateRecurringPlan = async (req, res, next) => {
  try {
    const plan = await RecurringPlan.findById(req.params.id);
    if (!plan) {
      return sendError(res, 'Recurring plan not found', 404);
    }

    const { name, billingCycle, basePrice, description, attachedProducts, prorationRule, cancellationPolicy, isActive } = req.body;

    if (name) plan.name = name;
    if (billingCycle) plan.billingCycle = billingCycle;
    if (basePrice !== undefined) plan.basePrice = Number(basePrice);
    if (description !== undefined) plan.description = description;
    if (isActive !== undefined) plan.isActive = isActive;
    if (prorationRule) plan.prorationRule = { ...plan.prorationRule, ...prorationRule };
    if (cancellationPolicy) plan.cancellationPolicy = { ...plan.cancellationPolicy, ...cancellationPolicy };

    if (Array.isArray(attachedProducts)) {
      // Clean up old products not in new list
      await Product.updateMany(
        { attachedRecurringPlans: plan._id, _id: { $nin: attachedProducts } },
        { $pull: { attachedRecurringPlans: plan._id } }
      );
      // Attach to new products
      await Product.updateMany(
        { _id: { $in: attachedProducts } },
        { $addToSet: { attachedRecurringPlans: plan._id } }
      );
      plan.attachedProducts = attachedProducts;
    }

    await plan.save();
    const updated = await RecurringPlan.findById(plan._id).populate('attachedProducts', 'name sku category basePrice pricingType');
    return sendSuccess(res, updated, 'Recurring plan updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Deactivate recurring plan
// @route   DELETE /api/billing/plans/:id
const deleteRecurringPlan = async (req, res, next) => {
  try {
    const plan = await RecurringPlan.findById(req.params.id);
    if (!plan) {
      return sendError(res, 'Recurring plan not found', 404);
    }
    plan.isActive = false;
    await plan.save();
    await Product.updateMany(
      { attachedRecurringPlans: plan._id },
      { $pull: { attachedRecurringPlans: plan._id } }
    );
    return sendSuccess(res, { id: plan._id }, 'Recurring plan deactivated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Attach plan to products/services
// @route   POST /api/billing/plans/:id/attach
const attachPlanToProducts = async (req, res, next) => {
  try {
    const { productIds = [] } = req.body;
    const plan = await RecurringPlan.findById(req.params.id);
    if (!plan) {
      return sendError(res, 'Recurring plan not found', 404);
    }

    plan.attachedProducts = productIds;
    await plan.save();

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { attachedRecurringPlans: plan._id } }
    );

    const updated = await RecurringPlan.findById(plan._id).populate('attachedProducts', 'name sku category basePrice pricingType');
    return sendSuccess(res, updated, 'Plan attached to products successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Configure and update global proration and cancellation rules
// @route   PUT /api/billing/rules
const updateProrationAndCancellationRules = async (req, res, next) => {
  try {
    const { prorationConfig, cancellationConfig } = req.body;
    if (prorationConfig || cancellationConfig) {
      const updateObj = {};
      if (prorationConfig) {
        if (prorationConfig.method) updateObj['prorationRule.method'] = prorationConfig.method;
        if (prorationConfig.autoIssueCreditNote !== undefined) updateObj['prorationRule.autoIssueCreditNote'] = prorationConfig.autoIssueCreditNote;
      }
      if (cancellationConfig) {
        if (cancellationConfig.gracePeriodDays !== undefined) updateObj['cancellationPolicy.gracePeriodDays'] = cancellationConfig.gracePeriodDays;
        if (cancellationConfig.noticePeriodDays !== undefined) updateObj['cancellationPolicy.noticePeriodDays'] = cancellationConfig.noticePeriodDays;
        if (cancellationConfig.policyType) updateObj['cancellationPolicy.policyType'] = cancellationConfig.policyType;
        if (cancellationConfig.refundMethod) updateObj['cancellationPolicy.refundMethod'] = cancellationConfig.refundMethod;
      }
      if (Object.keys(updateObj).length > 0) {
        await RecurringPlan.updateMany({ isActive: true }, { $set: updateObj });
      }
    }
    return sendSuccess(res, { prorationConfig, cancellationConfig }, 'Proration and cancellation rules saved and applied to active plans');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate billing (invoices / subscriptions) from quotation
// @route   POST /api/billing/generate/:id
const generateBilling = async (req, res, next) => {
  try {
    const result = await generateBillingFromQuotation(req.params.id);
    return sendSuccess(res, result, 'Billing generated successfully from quotation', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  recordPayment,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  getReturnPolicyRules,
  cancelSubscription,
  deleteSubscription,
  calculateProrationPreview,
  generateBilling,
  getRecurringPlans,
  createRecurringPlan,
  updateRecurringPlan,
  deleteRecurringPlan,
  attachPlanToProducts,
  updateProrationAndCancellationRules
};
