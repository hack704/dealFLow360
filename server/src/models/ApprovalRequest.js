const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['Submitted', 'Approved', 'Returned', 'Rejected', 'Resubmitted', 'Counter-Offer Submitted'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const approvalRequestSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationNumber: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submitterName: {
      type: String,
      required: true
    },
    dealValue: {
      type: Number,
      required: true
    },
    blendedMarginPercent: {
      type: Number,
      required: true
    },
    maxDiscountPercent: {
      type: Number,
      required: true
    },
    riskScore: {
      type: Number,
      default: 15
    },
    currentStage: {
      type: String,
      enum: ['Sales Manager', 'Finance', 'Executive VP', 'Approved', 'Rejected', 'Returned'],
      default: 'Sales Manager'
    },
    flaggedLines: [
      {
        productName: String,
        discountGiven: Number,
        limitAllowed: Number,
        isOver: Boolean
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned'],
      default: 'pending'
    },
    auditTrail: [auditLogSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
