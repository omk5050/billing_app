const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");

const {
  getCustomers,
  createCustomer
} = require("./customer.controller");

router.get("/customers", protect, getCustomers);

router.post("/customers", protect, createCustomer);

module.exports = router;