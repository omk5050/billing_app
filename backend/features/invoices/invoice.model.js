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

    customerPhone: {
      type: String,
      required: true
    },

    dueDate: {
      type: Date,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'overdue'],
      default: 'pending'
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // SOFT DELETE FIELD
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