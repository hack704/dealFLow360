const mongoose = require('mongoose');
const { PRICING_TYPES } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Software', 'Hardware', 'Cloud Service', 'Professional Services', 'Support'],
      default: 'Software'
    },
    pricingType: {
      type: String,
      enum: Object.values(PRICING_TYPES),
      default: PRICING_TYPES.RECURRING_ANNUAL
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    isAddon: {
      type: Boolean,
      default: false
    },
    suggestedAddons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
