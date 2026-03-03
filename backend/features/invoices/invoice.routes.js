const express = require('express');
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  deleteInvoice
} = require('./invoice.controller');

const { protect } = require('../../middleware/auth.middleware');

router.post('/', protect, createInvoice);
router.get('/', protect, getInvoices);
router.delete('/:id', protect, deleteInvoice);

module.exports = router;