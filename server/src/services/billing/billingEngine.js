const Invoice = require('../../models/Invoice');
const Subscription = require('../../models/Subscription');
const Quotation = require('../../models/Quotation');
const { roundTwoDecimals } = require('../../utils/helpers');

/**
 * Automatically bifurcates accepted quotations into one-time hardware/service invoices and recurring subscriptions.
 * @param {String} quotationId
 * @returns {Object} { invoice, subscription }
 */
const generateBillingFromQuotation = async (quotationId) => {
  const mongoose = require('mongoose');
  let quote = null;
  if (mongoose.Types.ObjectId.isValid(quotationId)) {
    quote = await Quotation.findById(quotationId).populate('customer');
  }
  if (!quote) {
    quote = await Quotation.findOne({ quotationNumber: quotationId }).populate('customer');
  }
  if (!quote) throw new Error('Quotation not found');

  // Check if invoice and subscription already exist
  let existingInvoice = await Invoice.findOne({ quotation: quote._id }).populate('customer quotation');
  let existingSubscription = await Subscription.findOne({ quotation: quote._id }).populate('customer');
  if (existingInvoice && existingSubscription) {
    return {
      invoice: existingInvoice,
      subscription: existingSubscription
    };
  }

  const oneTimeItems = [];
  const recurringItems = [];

  for (const it of (quote.items || [])) {
    if (it.category === 'Software' || it.category === 'Support' || (it.productName && it.productName.toLowerCase().includes('plan'))) {
      recurringItems.push(it);
    } else {
      oneTimeItems.push(it);
    }
  }

  // Fallback: if no one-time and no recurring but quote has grandTotal, create an invoice
  if (oneTimeItems.length === 0 && recurringItems.length === 0 && (quote.items || []).length > 0) {
    oneTimeItems.push(...quote.items);
  }

  const customerId = quote.customer ? (quote.customer._id || quote.customer) : null;

  let createdInvoice = existingInvoice;
  if (!createdInvoice && oneTimeItems.length > 0) {
    const subtotal = oneTimeItems.reduce((acc, it) => acc + (it.lineTotal || (it.quantity * it.netUnitPrice) || 0), 0);
    const tax = roundTwoDecimals(subtotal * 0.08); // 8% tax
    const invoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    createdInvoice = await Invoice.create({
      invoiceNumber: invoiceNum,
      quotation: quote._id,
      quotationNumber: quote.quotationNumber || '',
      customer: customerId,
      customerName: quote.customerName || (quote.customer && quote.customer.name) || 'Customer',
      type: 'One-Time Order',
      items: oneTimeItems.map((it) => ({
        item: it.productName || 'Line Item',
        quantity: it.quantity || 1,
        unitPrice: it.listPrice || 0,
        discountPercent: it.discountPercent || 0,
        total: it.lineTotal || 0
      })),
      subtotal,
      taxAmount: tax,
      grandTotal: roundTwoDecimals(subtotal + tax),
      status: 'Unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  let createdSubscription = existingSubscription;
  if (!createdSubscription && recurringItems.length > 0) {
    const recurringAmount = recurringItems.reduce((acc, it) => acc + (it.lineTotal || (it.quantity * it.netUnitPrice) || 0), 0);
    const subNum = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;

    createdSubscription = await Subscription.create({
      subscriptionNumber: subNum,
      quotation: quote._id,
      customer: customerId,
      customerName: quote.customerName || (quote.customer && quote.customer.name) || 'Customer',
      planName: recurringItems[0].productName || 'Subscription Plan',
      billingCycle: 'Monthly',
      amount: recurringAmount,
      status: 'Active',
      startDate: new Date(),
      nextBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      history: [{ action: 'Created from Quote', notes: `Generated from ${quote.quotationNumber}` }]
    });
  }

  // If no one-time invoice was created, generate an initial billing invoice for recurring or all items
  if (!createdInvoice) {
    const itemsToBill = recurringItems.length > 0 ? recurringItems : (quote.items || []);
    if (itemsToBill.length > 0) {
      const subtotal = itemsToBill.reduce((acc, it) => acc + (it.lineTotal || (it.quantity * it.netUnitPrice) || (quote.grandTotal || 0)), 0) || (quote.grandTotal || 0);
      const tax = roundTwoDecimals(subtotal * 0.08);
      const invoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

      createdInvoice = await Invoice.create({
        invoiceNumber: invoiceNum,
        quotation: quote._id,
        quotationNumber: quote.quotationNumber || '',
        customer: customerId,
        customerName: quote.customerName || (quote.customer && quote.customer.name) || 'Customer',
        type: recurringItems.length > 0 ? 'Recurring Monthly' : 'One-Time Order',
        items: itemsToBill.map((it) => ({
          item: it.productName || 'Line Item',
          quantity: it.quantity || 1,
          unitPrice: it.listPrice || 0,
          discountPercent: it.discountPercent || 0,
          total: it.lineTotal || 0
        })),
        subtotal,
        taxAmount: tax,
        grandTotal: roundTwoDecimals(subtotal + tax),
        status: 'Unpaid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  }

  return {
    invoice: createdInvoice,
    subscription: createdSubscription
  };
};

/**
 * Computes mid-cycle plan upgrade/downgrade proration amount.
 * Formula: Proration = (Remaining Days / Total Cycle Days) * Delta Amount
 * @param {Number} currentPlanMonthlyRate
 * @param {Number} newPlanMonthlyRate
 * @param {Number} daysRemaining
 * @param {Number} totalCycleDays
 * @returns {Object} Proration breakdown
 */
const calculateProration = (currentPlanMonthlyRate, newPlanMonthlyRate, daysRemaining = 14, totalCycleDays = 30) => {
  const delta = newPlanMonthlyRate - currentPlanMonthlyRate;
  const prorationRatio = Math.max(0, Math.min(1, daysRemaining / totalCycleDays));
  const proratedCharge = roundTwoDecimals(delta * prorationRatio);

  return {
    currentPlanRate: currentPlanMonthlyRate,
    newPlanRate: newPlanMonthlyRate,
    rateDifference: roundTwoDecimals(delta),
    daysRemainingInCycle: daysRemaining,
    totalCycleDays,
    prorationFraction: roundTwoDecimals(prorationRatio * 100),
    immediateProratedCharge: proratedCharge,
    nextBillingDateCharge: newPlanMonthlyRate
  };
};

/**
 * Requirement A5: Configure proration rules for mid cycle quantity or plan changes.
 * Handles both seat/quantity adjustments and plan tier upgrades/downgrades.
 * @param {Object} params { oldSeats, newSeats, unitPrice, oldPlanPrice, newPlanPrice, daysRemainingInCycle, totalCycleDays, method }
 * @returns {Object} { proratedAmount, actionRequired, description, newMonthlyTotal }
 */
const calculateMidCycleProration = ({
  oldSeats = 1,
  newSeats = 1,
  oldQuantity,
  newQuantity,
  unitPrice = 0,
  currentPrice,
  newPrice,
  oldPlanPrice = 0,
  newPlanPrice = 0,
  daysRemainingInCycle,
  daysRemaining,
  totalCycleDays = 30,
  method = 'daily_exact'
}) => {
  const effectiveOldSeats = oldQuantity !== undefined ? oldQuantity : oldSeats;
  const effectiveNewSeats = newQuantity !== undefined ? newQuantity : newSeats;
  const effectiveOldPrice = currentPrice !== undefined ? currentPrice : (unitPrice || oldPlanPrice || 40);
  const effectiveNewPrice = newPrice !== undefined ? newPrice : (newPlanPrice || unitPrice || effectiveOldPrice);
  const effectiveDaysRemaining = daysRemaining !== undefined ? daysRemaining : (daysRemainingInCycle !== undefined ? daysRemainingInCycle : 15);

  if (method === 'do_not_prorate') {
    return {
      proratedAmount: 0,
      proratedAdjustment: 0,
      actionRequired: 'none',
      actionType: 'none',
      method: 'do_not_prorate',
      description: 'Proration disabled. Adjustment will apply on next recurring invoice.',
      newMonthlyTotal: effectiveNewSeats * effectiveNewPrice
    };
  }

  // 1. Calculate rate difference for seats or plan changes
  const oldPeriodicTotal = effectiveOldSeats * effectiveOldPrice;
  const newPeriodicTotal = effectiveNewSeats * effectiveNewPrice;
  const totalMonthlyDelta = newPeriodicTotal - oldPeriodicTotal;
  const seatDelta = effectiveNewSeats - effectiveOldSeats;
  const planRateDelta = effectiveNewPrice - effectiveOldPrice;

  // 2. Compute proration ratio based on exact day count or calendar days
  const ratio = Math.max(0, Math.min(1, effectiveDaysRemaining / (totalCycleDays || 30)));
  const proratedAmount = roundTwoDecimals(totalMonthlyDelta * ratio);

  let actionRequired = 'none';
  let description = '';

  if (proratedAmount > 0) {
    actionRequired = 'immediate_invoice';
    description = `Added ${Math.abs(seatDelta)} seat(s) with ${effectiveDaysRemaining} days remaining. Prorated invoice of $${proratedAmount} issued immediately.`;
  } else if (proratedAmount < 0) {
    actionRequired = 'credit_note';
    description = `Reduced ${Math.abs(seatDelta)} seat(s) with ${effectiveDaysRemaining} days remaining. Prorated credit note of $${Math.abs(proratedAmount)} issued automatically.`;
  } else {
    description = 'No net change in recurring billing amount.';
  }

  return {
    seatDelta,
    planRateDelta,
    totalMonthlyDelta,
    daysRemainingInCycle: effectiveDaysRemaining,
    totalCycleDays,
    method,
    proratedAmount,
    proratedAdjustment: proratedAmount,
    actionRequired,
    actionType: actionRequired,
    description,
    newMonthlyTotal: newPeriodicTotal
  };
};

/**
 * Evaluates the subscription return and refund policy upon cancellation or return request.
 * Spec A5: Configure cancellation and partial refund rules.
 * @param {Object} subscription
 * @param {Object} options { cancellationDate, reason, forceRefundPercent }
 * @returns {Object} Refund evaluation { refundAmount, refundType, isWithinGracePeriod, daysRemaining, policyApplied }
 */
const evaluateSubscriptionReturnPolicy = (subscription, options = {}) => {
  const cancellationDate = options.cancellationDate ? new Date(options.cancellationDate) : new Date();
  const nextBillDate = subscription.nextBillDate ? new Date(subscription.nextBillDate) : new Date(Date.now() + 30 * 86400000);
  const cycleDays = subscription.billingCycle === 'Annual' ? 365 : (subscription.billingCycle === 'Quarterly' ? 90 : 30);
  
  // Approximate cycle start date = nextBillDate - cycleDays
  const cycleStartDate = new Date(nextBillDate.getTime() - cycleDays * 86400000);
  const daysElapsed = Math.max(0, Math.floor((cancellationDate - cycleStartDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((nextBillDate - cancellationDate) / (1000 * 60 * 60 * 24)));

  const policy = subscription.returnPolicy || {
    gracePeriodDays: 14,
    policyType: 'prorated_credit',
    refundMethod: 'credit_note',
    allowMidCycleCancellation: true,
    adminFeePercent: 0
  };

  const amountPaid = subscription.amount || 0;
  let refundAmount = 0;
  let policyApplied = '';
  const isWithinGracePeriod = daysElapsed <= (policy.gracePeriodDays || 14);

  if (options.forceRefundPercent !== undefined && !isNaN(Number(options.forceRefundPercent))) {
    const pct = Math.max(0, Math.min(100, Number(options.forceRefundPercent)));
    refundAmount = roundTwoDecimals(amountPaid * (pct / 100));
    policyApplied = `Manual Override (${pct}% refund)`;
  } else if (policy.policyType === 'no_refund') {
    refundAmount = 0;
    policyApplied = 'Strict No-Refund Policy';
  } else if (isWithinGracePeriod) {
    // 100% full refund if cancelled within grace period
    refundAmount = amountPaid;
    policyApplied = `Full Grace-Period Refund (Cancelled on Day ${daysElapsed} within ${policy.gracePeriodDays}-day window)`;
  } else if (policy.policyType === 'prorated_credit' || policy.allowMidCycleCancellation) {
    // Exact daily proration refund for unused days
    const prorationRatio = Math.max(0, Math.min(1, daysRemaining / cycleDays));
    const rawRefund = amountPaid * prorationRatio;
    const feeDiscount = 1 - ((policy.adminFeePercent || 0) / 100);
    refundAmount = roundTwoDecimals(rawRefund * feeDiscount);
    policyApplied = `Prorated Return Policy (${daysRemaining} of ${cycleDays} days remaining refunded)`;
  }

  return {
    isWithinGracePeriod,
    daysElapsed,
    daysRemaining,
    cycleDays,
    amountPaid,
    refundAmount,
    refundMethod: policy.refundMethod || 'credit_note',
    policyApplied,
    eligibleForCreditNote: refundAmount > 0
  };
};

/**
 * Executes pause logic on subscription, halting billing and freezing cycle
 */
const pauseSubscriptionLogic = (subscription, reason = 'Customer requested hold') => {
  subscription.status = 'Paused';
  subscription.pausedAt = new Date();
  subscription.pauseReason = reason;

  if (!Array.isArray(subscription.history)) {
    subscription.history = [];
  }

  subscription.history.push({
    action: 'Subscription Paused',
    date: new Date(),
    notes: `Recurring billing halted: ${reason}`
  });

  return subscription;
};

/**
 * Executes resume logic on subscription, shifting the next billing date forward by paused duration
 */
const resumeSubscriptionLogic = (subscription) => {
  const now = new Date();
  let pausedDays = 1;

  if (subscription.pausedAt) {
    const diffMs = Math.max(0, now - new Date(subscription.pausedAt));
    pausedDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Shift next bill date forward by paused days so the customer is not billed for paused downtime
  const oldNextBill = subscription.nextBillDate ? new Date(subscription.nextBillDate) : new Date();
  const newNextBill = new Date(oldNextBill.getTime() + pausedDays * 86400000);

  subscription.status = 'Active';
  subscription.resumedAt = now;
  subscription.nextBillDate = newNextBill;
  subscription.totalPausedDays = (subscription.totalPausedDays || 0) + pausedDays;

  if (!Array.isArray(subscription.history)) {
    subscription.history = [];
  }

  subscription.history.push({
    action: 'Subscription Resumed',
    date: now,
    notes: `Resumed after ${pausedDays} paused day(s). Next billing date extended to ${newNextBill.toISOString().split('T')[0]}`
  });

  return { subscription, pausedDays, newNextBill };
};

module.exports = {
  generateBillingFromQuotation,
  calculateProration,
  calculateMidCycleProration,
  evaluateSubscriptionReturnPolicy,
  pauseSubscriptionLogic,
  resumeSubscriptionLogic
};
