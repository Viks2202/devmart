const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Wishlist = require("../models/wishlist.model")
const Product = require("../models/product.model")

// GET my wishlist
const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate("products", "name price images ratings category isActive stock")

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      wishlist: { products: [], count: 0 }
    })
  }

  // Filter out inactive products
  const activeProducts = wishlist.products.filter(p => p && p.isActive)

  res.status(200).json({
    success: true,
    wishlist: {
      products: activeProducts,
      count: activeProducts.length
    }
  })
})

// ADD to wishlist
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body

  if (!productId) {
    return next(new CustomError("Product ID is required", 400))
  }

  // Check product exists and is active
  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return next(new CustomError("Product not found", 404))
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id })

  if (!wishlist) {
    // Create new wishlist for this user
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: [productId]
    })
    return res.status(200).json({
      success: true,
      message: "Added to wishlist"
    })
  }

  // Check already in wishlist
  const alreadyExists = wishlist.products
    .map(id => id.toString())
    .includes(productId)

  if (alreadyExists) {
    return next(new CustomError("Product already in wishlist", 409))
  }

  wishlist.products.push(productId)
  await wishlist.save()

  res.status(200).json({
    success: true,
    message: "Added to wishlist"
  })
})

// REMOVE from wishlist
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params

  const wishlist = await Wishlist.findOne({ user: req.user.id })
  if (!wishlist) {
    return next(new CustomError("Wishlist not found", 404))
  }

  wishlist.products = wishlist.products.filter(
    id => id.toString() !== productId
  )
  await wishlist.save()

  res.status(200).json({
    success: true,
    message: "Removed from wishlist"
  })
})

// CLEAR entire wishlist
const clearWishlist = asyncHandler(async (req, res, next) => {
  await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    { products: [] }
  )
  res.status(200).json({
    success: true,
    message: "Wishlist cleared"
  })
})

// CHECK if product is in wishlist
const checkWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  const wishlist = await Wishlist.findOne({ user: req.user.id })

  const isWishlisted = wishlist
    ? wishlist.products.map(id => id.toString()).includes(productId)
    : false

  res.status(200).json({
    success: true,
    isWishlisted
  })
})

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
}