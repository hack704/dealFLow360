const mongoose = require('mongoose');

const dealHealthSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation'
    },
    quotationNumber: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    salesRepName: {
      type: String,
      required: true
    },
    dealValue: {
      type: Number,
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    issueType: {
      type: String,
      enum: ['stalled', 'discount', 'slippage', 'credit'],
      default: 'stalled'
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskFactors: [String],
    flaggedDate: {
      type: Date,
      default: Date.now
    },
    actionTaken: {
      type: String,
      default: 'None'
    },
    actionStatus: {
      type: String,
      enum: ['pending', 'done', 'escalated'],
      default: 'pending'
    },
    actionBy: {
      type: String,
      default: ''
    },
    actionRole: {
      type: String,
      default: ''
    },
    actionTimestamp: {
      type: Date
    },
    actionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DealHealth', dealHealthSchema);
