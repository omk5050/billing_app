const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");

const {
  getTotalRevenue,
  getInvoiceCount,
  getStatusBreakdown,
  getMonthlyRevenue
} = require("./reports.controller");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics endpoints
 */


/**
 * @swagger
 * /api/reports/total-revenue:
 *   get:
 *     summary: Get total revenue
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Total revenue
 */
router.get("/total-revenue", protect, getTotalRevenue);

/**
 * @swagger
 * /api/reports/invoice-count:
 *   get:
 *     summary: Get invoice count
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Total invoice count
 */
router.get("/invoice-count", protect, getInvoiceCount);

/**
 * @swagger
 * /api/reports/invoice-count:
 *   get:
 *     summary: Get invoice count
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Total invoice count
 */
router.get("/status-breakdown", protect, getStatusBreakdown);

/**
 * @swagger
 * /api/reports/monthly-revenue:
 *   get:
 *     summary: Monthly revenue report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Monthly revenue data
 */
router.get("/monthly-revenue", protect, getMonthlyRevenue);


module.exports = router;