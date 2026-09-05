const mongoose = require('mongoose');
const { QUOTATION_STATUSES } = require('../config/constants');

const quotationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: String,
  category: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  listPrice: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  netUnitPrice: {
    type: Number,
    required: true
  },
  lineTotal: {
    type: Number,
    required: true
  },
  marginAmount: {
    type: Number,
    default: 0
  },
  marginPercent: {
    type: Number,
    default: 0
  }
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      default: 'New Enterprise Deal'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: String,
    items: [quotationItemSchema],
    subtotal: {
      type: Number,
      default: 0
    },
    totalDiscountAmount: {
      type: Number,
      default: 0
    },
    totalDiscountPercent: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    blendedMarginPercent: {
      type: Number,
      default: 0
    },
    riskScore: {
      type: Number,
      default: 15
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low'
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvalReason: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUSES),
      default: QUOTATION_STATUSES.DRAFT
    },
    paymentTermsDays: {
      type: Number,
      default: 30
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quotation', quotationSchema);
