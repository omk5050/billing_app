const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");
const { getCustomers } = require("./customer.controller");

// Debug logs (optional)
console.log("protect:", protect);
console.log("getCustomers:", getCustomers);

router.get("/customers", protect, getCustomers);

module.exports = router;