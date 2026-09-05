const mongoose = require('mongoose');

const invoiceLineSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation'
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['One-Time Order', 'Recurring Monthly', 'Recurring Annual', 'Enterprise Milestone'],
      default: 'One-Time Order'
    },
    items: [invoiceLineSchema],
    subtotal: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Unpaid'
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date
    },
    paymentDetails: {
      method: String,
      transactionId: String,
      recordedBy: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
