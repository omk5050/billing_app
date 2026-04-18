const express = require('express');
const router = express.Router();

const { body, param } = require('express-validator');
const { validate } = require('../../middleware/validation.middleware');

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require('./invoice.controller');

const { scanInvoice, upload } = require('./scan.controller');

const { protect } = require('../../middleware/auth.middleware');

/*
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /api/invoices/scan:
 *   post:
 *     summary: Scan invoice image for data extraction
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Data extracted successfully
 */
router.post('/scan', protect, upload.single('image'), scanInvoice);



/*
CREATE INVOICE
POST /api/invoices
*/
/**
/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Invoice created
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
*/
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/', protect, getInvoices);


/*
GET SINGLE INVOICE
GET /api/invoices/:id
*/

router.get(
  '/:id',
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid invoice ID')
  ],
  validate,
  getInvoiceById
);


/*
UPDATE INVOICE
PUT /api/invoices/:id
*/
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
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
      .isIn(['pending', 'paid', 'cancelled', 'overdue'])
      .withMessage('Invalid status value')
  ],
  validate,
  updateInvoice
);


/*
PATCH INVOICE STATUS
PATCH /api/invoices/:id/status
*/
router.patch(
  '/:id/status',
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid invoice ID'),

    body('status')
      .isIn(['pending', 'paid', 'cancelled', 'overdue'])
      .withMessage('Invalid status value')
  ],
  validate,
  updateInvoice
);


/*
DELETE INVOICE
DELETE /api/invoices/:id
*/
/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice deleted
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