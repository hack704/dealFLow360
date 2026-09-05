const mongoose = require('mongoose');

const negotiationCommentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'sales_rep', 'sales_manager', 'system'],
    default: 'customer'
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const negotiationSchema = new mongoose.Schema(
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
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    originalTotal: {
      type: Number,
      required: true
    },
    counterTotal: {
      type: Number,
      required: true
    },
    requestedDiscountPercent: {
      type: Number,
      default: 0
    },
    requestedDeliveryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Under Negotiation', 'Accepted by Customer', 'Accepted by Sales', 'Rejected', 'Counter-Offered'],
      default: 'Under Negotiation'
    },
    lineRedlines: [
      {
        lineId: String,
        productName: String,
        originalDiscount: Number,
        requestedDiscount: Number,
        comment: String
      }
    ],
    comments: [negotiationCommentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Negotiation', negotiationSchema);
