const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")

const products = [
  { id: "1", name: "iPhone 15", price: 79999, category: "electronics" },
  { id: "2", name: "Nike Shoes", price: 4999, category: "clothing" },
  { id: "3", name: "Node.js Book", price: 599, category: "books" }
]

// GET all products
const getAllProducts = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    requestedAt: req.requestTime, 
    count: products.length,
    products
  })
})

// GET single product
const getProduct = asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id)

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({ success: true, product })
})

// POST create product
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, category } = req.body

  if (!name || !price || !category) {
    throw new CustomError("name, price and category are required", 400)
  }

  const newProduct = { id: "4", name, price, category }
  res.status(201).json({ success: true, product: newProduct })
})

// PUT update product
const updateProduct = asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id)

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({
    success: true,
    message: "Product updated",
    id: req.params.id,
    updated: req.body
  })
})

// DELETE product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id)

  if (!product) {
    throw new CustomError("Product not found", 404)
  }

  res.status(200).json({
    success: true,
    message: `Product with id ${req.params.id} deleted`
  })
})

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
}