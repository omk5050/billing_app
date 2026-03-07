const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");

const {
  getTotalRevenue,
  getInvoiceCount,
  getStatusBreakdown,
  getMonthlyRevenue
} = require("./reports.controller");


router.get("/total-revenue", protect, getTotalRevenue);

router.get("/invoice-count", protect, getInvoiceCount);

router.get("/status-breakdown", protect, getStatusBreakdown);

router.get("/monthly-revenue", protect, getMonthlyRevenue);


module.exports = router;