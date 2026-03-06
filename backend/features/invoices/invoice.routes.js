const express = require('express');
const router = express.Router();

const { body, param } = require('express-validator');
const { validate } = require('../../middleware/validation.middleware');

const {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice
} = require('./invoice.controller');

const { protect } = require('../../middleware/auth.middleware');


/*
CREATE INVOICE
POST /api/invoices
*/
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


/*
GET ALL INVOICES
GET /api/invoices
Supports:
?page=
?limit=
?status=
?customerName=
*/
router.get('/', protect, getInvoices);


/*
UPDATE INVOICE
PUT /api/invoices/:id
*/
router.put(
  '/:id',
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid invoice ID'),

    body('customerName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Customer name cannot be empty'),

    body('amount')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0'),

    body('status')
      .optional()
      .isIn(['pending', 'paid', 'cancelled'])
      .withMessage('Invalid status value')
  ],
  validate,
  updateInvoice
);


/*
DELETE INVOICE
DELETE /api/invoices/:id
*/
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