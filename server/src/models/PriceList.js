const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Enterprise Partner'],
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    priceRule: {
      type: String,
      default: 'Price, no adjustment'
    },
    discountModifierPercent: {
      type: Number,
      default: 0
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

module.exports = mongoose.model('PriceList', priceListSchema);
