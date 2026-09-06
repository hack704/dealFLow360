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
    unit: {
      type: String,
      default: 'Each'
    },
    taxPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    variants: [
      {
        attribute: { type: String, default: 'Size' },
        values: { type: String, default: 'Standard' },
        extraPrice: { type: String, default: '0' }
      }
    ],
    priceLists: [
      {
        tier: { type: String, default: 'Bronze' },
        currency: { type: String, default: 'USD' },
        priceRule: { type: String, default: 'Price, no adjustment' },
        discountModifierPercent: { type: Number, default: 0 }
      }
    ],
    isPromoted: {
      type: Boolean,
      default: false
    },
    minMarginThreshold: {
      type: Number,
      default: 20
    },
    coPurchasedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
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
    // Recurring plans attached to this specific product or service (Requirement A5)
    attachedRecurringPlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecurringPlan'
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
