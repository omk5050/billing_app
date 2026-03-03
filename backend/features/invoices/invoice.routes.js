const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../../middleware/validation.middleware');

const {
  createInvoice,
  getInvoices,
  deleteInvoice
} = require('./invoice.controller');

const { protect } = require('../../middleware/auth.middleware');

router.post(
  '/',
  protect,
  [
    body('customerName')
      .trim()
      .notEmpty()
      .withMessage('Customer name is required'),

    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0')
  ],
  validate,
  createInvoice
);

router.get('/', protect, getInvoices);

router.delete(
  '/:id',
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid invoice ID')
  ],
  validate,
  deleteInvoice
);

module.exports = router;