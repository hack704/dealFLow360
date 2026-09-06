const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    planName: {
      type: String,
      required: true
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual'],
      default: 'Monthly'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Cancelled', 'Pending'],
      default: 'Active'
    },
    pausedAt: {
      type: Date
    },
    pauseReason: {
      type: String,
      default: ''
    },
    resumedAt: {
      type: Date
    },
    totalPausedDays: {
      type: Number,
      default: 0
    },
    returnPolicy: {
      gracePeriodDays: { type: Number, default: 14 },
      policyType: {
        type: String,
        enum: ['prorated_credit', 'full_refund_grace', 'no_refund'],
        default: 'prorated_credit'
      },
      refundMethod: {
        type: String,
        enum: ['credit_note', 'original_payment'],
        default: 'credit_note'
      },
      allowMidCycleCancellation: { type: Boolean, default: true },
      adminFeePercent: { type: Number, default: 0 }
    },
    cancellationDetails: {
      cancelledAt: Date,
      cancelledBy: String,
      reason: String,
      refundAmount: Number,
      refundMethod: String,
      creditNoteNumber: String
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    nextBillDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      brand: { type: String, default: 'Visa' },
      last4: { type: String, default: '4242' },
      expiry: { type: String, default: '12/28' }
    },
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now },
        notes: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
