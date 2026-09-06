const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      default: 'WH-01'
    },
    location: {
      type: String,
      default: 'Dallas, TX'
    },
    shippingCostWeight: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 10.0
    },
    replenishmentRules: {
      reorderPoint: { type: Number, default: 15 },
      reorderQuantity: { type: Number, default: 50 },
      leadTimeDays: { type: Number, default: 3 },
      minStockLevel: { type: Number, default: 10 }
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

module.exports = mongoose.model('Warehouse', warehouseSchema);
