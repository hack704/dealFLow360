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

module.exports = {
  generateBillingFromQuotation,
  calculateProration
};
