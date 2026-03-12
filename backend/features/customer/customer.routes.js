const express = require("express");
const router = express.Router();

console.log("protect:", protect);
console.log("getCustomers:", getCustomers);

const { getCustomers } = require("./customer.controller");
const protect = require("../../middleware/auth.middleware");

router.get("/customers", protect, getCustomers);

module.exports = router;