const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Product = require("../models/product.model")

// GET all products
const getAllProducts = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sort,
    page,
    limit
  } = req.query

  // build filter object
  const filter = { isActive: true }

  // category filter
  if (category) {
    filter.category = category
  }

  // price range filter
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  // search filter
  if (search) {
    filter.name = { $regex: search, $options: "i" }
  }

  // pagination
  const pageNum = Number(page) || 1
  const limitNum = Number(limit) || 10
  const skip = (pageNum - 1) * limitNum

  // sort options
  let sortOption = { createdAt: -1 }  // default newest first
  if (sort === "price_asc")  sortOption = { price: 1 }
  if (sort === "price_desc") sortOption = { price: -1 }
  if (sort === "name_asc")   sortOption = { name: 1 }
  if (sort === "newest")     sortOption = { createdAt: -1 }

  // execute query
  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)

  // total count for pagination info
  const total = await Product.countDocuments(filter)

  res.status(200).json({
    success: true,
    requestedAt: req.requestTime,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    },
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

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params
  const validCategories = ["electronics", "clothing", "books", "food", "other"]

  if (!validCategories.includes(category)) {
    throw new CustomError("Invalid category", 400)
  }

  const products = await Product.find({ category, isActive: true })

  res.status(200).json({
    success: true,
    category,
    count: products.length,
    products
  })
})

const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query

  if (!q) {
    throw new CustomError("Search query is required", 400)
  }

  const products = await Product.find({
    name: { $regex: q, $options: "i" },
    isActive: true
  })

  res.status(200).json({
    success: true,
    query: q,
    count: products.length,
    products
  })
})

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getProductsByCategory,
  searchProducts  
}