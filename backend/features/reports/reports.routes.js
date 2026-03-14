const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");

const {
  getTotalRevenue,
  getInvoiceCount,
  getStatusBreakdown,
  getMonthlyRevenue,
  getPaymentMethods
} = require("./reports.controller");


router.get("/total-revenue", protect, getTotalRevenue);

router.get("/invoice-count", protect, getInvoiceCount);

router.get("/status-breakdown", protect, getStatusBreakdown);

router.get("/monthly-revenue", protect, getMonthlyRevenue);

router.get("/payment-methods", protect, getPaymentMethods);


module.exports = router;