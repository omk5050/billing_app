const express = require("express")
const router = express.Router()

const { getCustomers } = require("../controllers/customer.controller")
const protect = require("../middleware/auth.middleware")

router.get("/customers", protect, getCustomers)

module.exports = router