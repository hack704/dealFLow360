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
  const quote = await Quotation.findById(quotationId).populate('customer');
  if (!quote) throw new Error('Quotation not found');

  const oneTimeItems = [];
  const recurringItems = [];

  for (const it of quote.items) {
    if (it.category === 'Software' || it.category === 'Support') {
      recurringItems.push(it);
    } else {
      oneTimeItems.push(it);
    }
  }

  let createdInvoice = null;
  if (oneTimeItems.length > 0) {
    const subtotal = oneTimeItems.reduce((acc, it) => acc + it.lineTotal, 0);
    const tax = roundTwoDecimals(subtotal * 0.08); // 8% tax
    const invoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    createdInvoice = await Invoice.create({
      invoiceNumber: invoiceNum,
      quotation: quote._id,
      customer: quote.customer._id || quote.customer,
      customerName: quote.customerName,
      type: 'One-Time Order',
      items: oneTimeItems.map((it) => ({
        item: it.productName,
        quantity: it.quantity,
        unitPrice: it.listPrice,
        discountPercent: it.discountPercent,
        total: it.lineTotal
      })),
      subtotal,
      taxAmount: tax,
      grandTotal: roundTwoDecimals(subtotal + tax),
      status: 'Unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  let createdSubscription = null;
  if (recurringItems.length > 0) {
    const recurringAmount = recurringItems.reduce((acc, it) => acc + it.lineTotal, 0);
    const subNum = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;

    createdSubscription = await Subscription.create({
      subscriptionNumber: subNum,
      quotation: quote._id,
      customer: quote.customer._id || quote.customer,
      customerName: quote.customerName,
      planName: recurringItems[0].productName,
      billingCycle: 'Monthly',
      amount: recurringAmount,
      status: 'Active',
      startDate: new Date(),
      nextBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      history: [{ action: 'Created from Quote', notes: `Generated from ${quote.quotationNumber}` }]
    });
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

module.exports = {
  generateBillingFromQuotation,
  calculateProration
};
