const Razorpay = require("razorpay")
const crypto = require("crypto")
const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Order = require("../models/order.model")

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// STEP 1 — Create Razorpay order
// Called before showing payment form to user
const createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body

  if (!orderId) {
    return next(new CustomError("Order ID is required", 400))
  }

  // Find order in DB
  const order = await Order.findById(orderId)
  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  // Only the order owner can pay
  if (order.user.toString() !== req.user.id) {
    return next(new CustomError("Not authorized to pay for this order", 403))
  }

  // Cannot pay for already paid order
  if (order.paymentStatus === "paid") {
    return next(new CustomError("This order is already paid", 400))
  }

  // Cannot pay for cancelled order
  if (order.status === "cancelled") {
    return next(new CustomError("Cannot pay for cancelled order", 400))
  }

  // Create Razorpay payment order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round((order.finalAmount || order.totalPrice) * 100),
    // Amount in paise: ₹500 = 50000 paise
    currency: "INR",
    receipt: `receipt_${orderId}`,
    notes: {
      orderId: orderId.toString(),
      userId: req.user.id.toString()
    }
  })

  res.status(200).json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID
    // Frontend needs this key to initialize Razorpay checkout UI
  })
})

// STEP 2 — Verify payment
// Called after user completes payment in Razorpay UI
const verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body

  // All 4 fields required
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return next(new CustomError("All payment verification fields required", 400))
  }

  // Verify signature
  // Razorpay creates: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
  // We recreate same and compare — if match = payment is genuine
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    return next(new CustomError("Payment signature verification failed", 400))
  }

  // Update order in DB
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: "paid",
      paymentMethod: "online",
      status: "confirmed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    },
    { new: true }
  )

  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  res.status(200).json({
    success: true,
    message: "Payment verified and order confirmed",
    order
  })
})

// GET payment status of an order
const getPaymentStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
    .select("paymentStatus paymentMethod totalPrice finalAmount razorpayOrderId razorpayPaymentId")

  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  if (order.user && order.user.toString() !== req.user.id &&
      req.user.role !== "admin") {
    return next(new CustomError("Not authorized", 403))
  }

  res.status(200).json({ success: true, payment: order })
})

module.exports = { createPaymentOrder, verifyPayment, getPaymentStatus }