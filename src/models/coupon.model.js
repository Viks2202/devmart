const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true
      // Stored as uppercase: "SAVE10", "FLAT100"
    },
    description: {
      type: String,
      required: [true, "Description is required"]
      // Example: "Get 10% off on orders above ₹500"
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
      // percentage = 10% off total
      // fixed = ₹100 off total
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, "Discount must be at least 1"]
      // For percentage: 10 means 10%
      // For fixed: 100 means ₹100
    },
    minOrderAmount: {
      type: Number,
      default: 0
      // Minimum cart value required to use coupon
    },
    maxDiscountAmount: {
      type: Number,
      default: null
      // For percentage type: cap max discount
      // Example: 20% off but max ₹500 off
    },
    usageLimit: {
      type: Number,
      default: null
      // null = unlimited
      // 100 = only 100 people can use this coupon
    },
    usedCount: {
      type: Number,
      default: 0
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"]
    }
  },
  { timestamps: true }
)

const Coupon = mongoose.model("Coupon", couponSchema)
module.exports = Coupon