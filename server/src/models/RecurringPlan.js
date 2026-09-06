const mongoose = require('mongoose');

const recurringPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Yearly', 'Annual'],
      required: [true, 'Billing cycle is required'],
      default: 'Monthly'
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    // Specific products or services attached to this recurring plan (Requirement A5)
    attachedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    // Proration rules for mid-cycle quantity or plan changes (Requirement A5)
    prorationRule: {
      method: {
        type: String,
        enum: ['daily_exact', 'calendar_days', 'do_not_prorate'],
        default: 'daily_exact'
      },
      autoIssueCreditNote: {
        type: Boolean,
        default: true
      },
      invoiceSeatIncreasesImmediately: {
        type: Boolean,
        default: true
      },
      planChangeProration: {
        type: String,
        enum: ['net_difference', 'full_cycle', 'immediate'],
        default: 'net_difference'
      }
    },
    // Cancellation and partial refund rules (Requirement A5)
    cancellationPolicy: {
      gracePeriodDays: {
        type: Number,
        default: 14,
        min: 0
      },
      noticePeriodDays: {
        type: Number,
        default: 30,
        min: 0
      },
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
      allowMidCycleCancellation: {
        type: Boolean,
        default: true
      },
      adminFeePercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RecurringPlan', recurringPlanSchema);
