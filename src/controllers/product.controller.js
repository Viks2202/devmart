const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Product = require("../models/product.model")

// GET all products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()

  res.status(200).json({
    success: true,
    requestedAt: req.requestTime,
    count: products.length,
    products
  })
})

// GET single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({ success: true, product })
})

// POST create product
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)

  res.status(201).json({ success: true, product })
})

// PUT update product
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({ success: true, product })
})

// DELETE product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully"
  })
})
// GET product stats
const getProductStats = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })

  // total products
  const total = products.length

  // total stock
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0)

  // average price
  const avgPrice = products.reduce((acc, p) => acc + p.price, 0) / total

  // most expensive
  const mostExpensive = products.reduce((max, p) => 
    p.price > max.price ? p : max, products[0])

  // cheapest
  const cheapest = products.reduce((min, p) => 
    p.price < min.price ? p : min, products[0])

  res.status(200).json({
    success: true,
    stats: {
      totalProducts: total,
      totalStock,
      averagePrice: Math.round(avgPrice),
      mostExpensive: {
        name: mostExpensive.name,
        price: mostExpensive.price
      },
      cheapest: {
        name: cheapest.name,
        price: cheapest.price
      }
    }
  })
})

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats 
}