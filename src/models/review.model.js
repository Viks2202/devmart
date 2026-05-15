const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true
    }
  },
  { timestamps: true }
)

// one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

const Review = mongoose.model("Review", reviewSchema)
module.exports = Review