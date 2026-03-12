const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
{
  customerName: {
    type: String,
    required: true
  },

  customerEmail: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  invoiceDate: {
    type: Date,
    default: Date.now
  },

  dueDate: {
    type: Date,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ['cash','upi','card']
  },

  notes: {
    type: String
  },

  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      total: Number
    }
  ],

  amount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending','paid','cancelled','overdue'],
    default: 'pending'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);