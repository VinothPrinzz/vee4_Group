// server/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'designing',
      'laser_cutting',
      'metal_bending',
      'fabrication_welding',
      'finishing',
      'powder_coating',
      'assembling',
      'quality_check',
      'dispatch',
      'completed'
    ],
    default: 'pending',
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  productType: {
    type: String,
    required: true,
  },
  metalType: {
    type: String,
    required: true,
  },
  thickness: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  designFile: {
    type: String,
    required: true,
  },
  additionalRequirements: {
    type: String,
  },
  testReport: {
    type: String,
  },
  invoice: {
    type: String,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const date = new Date();
      const year = date.getFullYear();
      
      const count = await this.constructor.countDocuments({
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      
      this.orderNumber = `ORD-${year}-${(count + 1).toString().padStart(2, '0')}`;
    }
    
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);