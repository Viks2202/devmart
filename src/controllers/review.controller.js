const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Review = require("../models/review.model")
const Product = require("../models/product.model")

// ADD review
const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body
  const productId = req.params.id

  if (!rating || !comment) {
    return next(new CustomError("rating and comment are required", 400))
  }

  const product = await Product.findById(productId)
  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  // check if already reviewed
  const existing = await Review.findOne({
    user: req.user.id,
    product: productId
  })

  if (existing) {
    return next(new CustomError("You already reviewed this product", 409))
  }

  const review = await Review.create({
    user: req.user.id,
    product: productId,
    rating: Number(rating),
    comment
  })

  // update product ratings
  const reviews = await Review.find({ product: productId })
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await Product.findByIdAndUpdate(productId, {
    ratings: Math.round(avgRating * 10) / 10,
    numReviews: reviews.length
  })

  res.status(201).json({ success: true, review })
})

// GET reviews for product
const getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name")
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  })
})

// DELETE review
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(new CustomError("Review not found", 404))
  }

  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new CustomError("Not authorized", 403))
  }

  await Review.findByIdAndDelete(req.params.id)

  // update product ratings
  const reviews = await Review.find({ product: review.product })
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  await Product.findByIdAndUpdate(review.product, {
    ratings: Math.round(avgRating * 10) / 10,
    numReviews: reviews.length
  })

  res.status(200).json({
    success: true,
    message: "Review deleted"
  })
})

module.exports = { addReview, getProductReviews, deleteReview }