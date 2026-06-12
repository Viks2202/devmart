const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Coupon = require("../models/coupon.model")

// VALIDATE COUPON — user checks if coupon is valid
const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body

  if (!code) {
    return next(new CustomError("Coupon code is required", 400))
  }
  if (!cartTotal || cartTotal <= 0) {
    return next(new CustomError("Cart total is required", 400))
  }

  // Find active coupon (convert to uppercase for comparison)
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  })

  if (!coupon) {
    return next(new CustomError("Invalid coupon code", 404))
  }

  // Check not expired
  if (new Date() > new Date(coupon.expiresAt)) {
    return next(new CustomError("This coupon has expired", 400))
  }

  // Check usage limit not reached
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return next(new CustomError("This coupon has reached its usage limit", 400))
  }

  // Check minimum order amount
  if (Number(cartTotal) < coupon.minOrderAmount) {
    return next(new CustomError(
      `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`,
      400
    ))
  }

  // Check user hasn't already used this coupon
  const alreadyUsed = coupon.usedBy.map(id => id.toString()).includes(req.user.id)
  if (alreadyUsed) {
    return next(new CustomError("You have already used this coupon", 400))
  }

  // Calculate discount amount
  let discountAmount = 0
  const total = Number(cartTotal)

  if (coupon.discountType === "percentage") {
    discountAmount = (total * coupon.discountValue) / 100
    // Apply max discount cap if set
    if (coupon.maxDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
    }
  } else {
    // Fixed discount
    discountAmount = coupon.discountValue
  }

  // Discount cannot exceed cart total
  discountAmount = Math.min(discountAmount, total)
  const finalAmount = total - discountAmount

  res.status(200).json({
    success: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    },
    cartTotal: total,
    discountAmount: Math.round(discountAmount),
    finalAmount: Math.round(finalAmount),
    savings: `You save ₹${Math.round(discountAmount)}`
  })
})

// CREATE coupon — admin only
const createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.create(req.body)
  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon
  })
})

// GET all coupons — admin only
const getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons
  })
})

// GET single coupon — admin only
const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) {
    return next(new CustomError("Coupon not found", 404))
  }
  res.status(200).json({ success: true, coupon })
})

// UPDATE coupon — admin only
const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
  if (!coupon) {
    return next(new CustomError("Coupon not found", 404))
  }
  res.status(200).json({ success: true, coupon })
})

// DELETE coupon — admin only
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) {
    return next(new CustomError("Coupon not found", 404))
  }
  res.status(200).json({ success: true, message: "Coupon deleted" })
})

module.exports = {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon
}