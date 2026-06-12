const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/auth.middleware")
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus
} = require("../controllers/payment.controller")

// Create Razorpay order (before showing payment UI)
router.post("/create", protect, createPaymentOrder)

// Verify payment (after user pays)
router.post("/verify", protect, verifyPayment)

// Get payment status
router.get("/status/:orderId", protect, getPaymentStatus)

module.exports = router