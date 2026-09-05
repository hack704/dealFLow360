const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: {
      type: String,
      required: true,
      uppercase: true
    },
    warehouse: {
      type: String,
      enum: ['Main Warehouse', 'East Depot', 'West Depot', 'Central Logistics'],
      required: true
    },
    quantityOnHand: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    quantityReserved: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderThreshold: {
      type: Number,
      default: 10
    },
    locationAisle: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
