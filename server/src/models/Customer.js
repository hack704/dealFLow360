const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    industry: {
      type: String,
      default: 'Technology'
    },
    tier: {
      type: String,
      enum: ['Enterprise', 'Mid-Market', 'SMB'],
      default: 'Mid-Market'
    },
    creditRating: {
      type: String,
      enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B'],
      default: 'A'
    },
    paymentTermsDays: {
      type: Number,
      default: 30
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      default: ''
    },
    annualRevenue: {
      type: Number,
      default: 0
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'US' },
      zip: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', customerSchema);
