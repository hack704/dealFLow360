const mongoose = require('mongoose');

const discountRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['All', 'Enterprise', 'Mid-Market', 'SMB'],
      default: 'All'
    },
    minQuantity: {
      type: Number,
      default: 1
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    requiresApprovalAbove: {
      type: Number,
      default: 15
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

module.exports = mongoose.model('DiscountRule', discountRuleSchema);
