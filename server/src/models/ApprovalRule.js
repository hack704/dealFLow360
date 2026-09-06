const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'All'],
      default: 'All'
    },
    category: {
      type: String,
      enum: ['Hardware', 'Services', 'Software', 'Maintenance', 'All'],
      default: 'All'
    },
    maxDiscountCeiling: {
      type: Number,
      required: true
    },
    minMarginFloor: {
      type: Number,
      default: 20
    },
    requiredApproverRole: {
      type: String,
      enum: ['sales_manager', 'finance', 'admin'],
      default: 'sales_manager'
    },
    escalateAboveDiscount: {
      type: Number,
      default: 25
    },
    isActive: {
      type: Boolean,
      default: true
    },
    version: {
      type: Number,
      default: 1
    },
    lastUpdatedBy: {
      type: String,
      default: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
