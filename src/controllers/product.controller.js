const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Product = require("../models/product.model")
const Cart = require("../models/cart.model")
const Order = require("../models/order.model")
const {
  uploadToCloudinary,
  deleteFromCloudinary
} = require("../middlewares/upload.middleware")

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

  const filter = { isActive: true }

  if (category) filter.category = category

  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" }
  }

  const pageNum = Number(page) || 1
  const limitNum = Number(limit) || 10
  const skip = (pageNum - 1) * limitNum

  let sortOption = { createdAt: -1 }
  if (sort === "price_asc")  sortOption = { price: 1 }
  if (sort === "price_desc") sortOption = { price: -1 }
  if (sort === "name_asc")   sortOption = { name: 1 }
  if (sort === "newest")     sortOption = { createdAt: -1 }

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)

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
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  res.status(200).json({ success: true, product })
})

// POST create product
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, stock, brand } = req.body

  if (!name || !description || !price || !category) {
    return next(
      new CustomError("name, description, price and category are required", 400)
    )
  }

  let images = []

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "devmart/products")
      images.push({
        url: result.secure_url,
        publicId: result.public_id
      })
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock: stock || 0,
    brand,
    images
  })

  res.status(201).json({ success: true, product })
})

// PUT update product
const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  res.status(200).json({ success: true, product })
})

// DELETE product
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId)
      }
    }
  }

  await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  res.status(200).json({
    success: true,
    message: "Product deleted successfully"
  })
})

// GET product stats
const getProductStats = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isActive: true })
  const total = products.length

  if (total === 0) {
    return res.status(200).json({
      success: true,
      stats: { totalProducts: 0 }
    })
  }

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0)
  const avgPrice = products.reduce((acc, p) => acc + p.price, 0) / total
  const mostExpensive = products.reduce((max, p) =>
    p.price > max.price ? p : max, products[0])
  const cheapest = products.reduce((min, p) =>
    p.price < min.price ? p : min, products[0])

  res.status(200).json({
    success: true,
    stats: {
      totalProducts: total,
      totalStock,
      averagePrice: Math.round(avgPrice),
      mostExpensive: { name: mostExpensive.name, price: mostExpensive.price },
      cheapest: { name: cheapest.name, price: cheapest.price }
    }
  })
})

// GET products by category
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params
  const validCategories = ["electronics", "clothing", "books", "food", "other"]

  if (!validCategories.includes(category)) {
    return next(new CustomError("Invalid category", 400))
  }

  const products = await Product.find({ category, isActive: true })

  res.status(200).json({
    success: true,
    category,
    count: products.length,
    products
  })
})

// GET search products
const searchProducts = asyncHandler(async (req, res, next) => {
  const { q } = req.query

  if (!q) {
    return next(new CustomError("Search query is required", 400))
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

// upload images to existing product
const uploadProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  if (!req.files || req.files.length === 0) {
    return next(new CustomError("Please upload at least one image", 400))
  }

  const newImages = []

  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, "devmart/products")
    newImages.push({
      url: result.secure_url,
      publicId: result.public_id
    })
  }

  product.images = [...product.images, ...newImages]
  await product.save()

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
    images: product.images
  })
})

// delete specific image from product
const deleteProductImage = asyncHandler(async (req, res, next) => {
  const { publicId } = req.body

  if (!publicId) {
    return next(new CustomError("publicId is required", 400))
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  await deleteFromCloudinary(publicId)

  product.images = product.images.filter(
    img => img.publicId !== publicId
  )
  await product.save()

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    images: product.images
  })
})

// AI-powered product recommendations based on cart + purchase history
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id

  // Step 1: Get user's cart items
  const cart = await Cart.findOne({ user: userId }).populate("items.product", "category")

  // Step 2: Get user's order history
  const orders = await Order.find({ user: userId, status: { $ne: "cancelled" } })
    .select("items")
    .lean()

  // Step 3: Build category preference map
  const categoryCount = {}

  // Add cart categories
  cart?.items?.forEach(item => {
    if (item.product?.category) {
      categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + 2
    }
  })

  // Add order history categories
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      }
    })
  })

  // Step 4: Get products the user already has in cart (to exclude)
  const cartProductIds = cart?.items?.map(i => i.product?._id?.toString()) || []

  // Step 5: Sort categories by preference
  const sortedCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat)

  let recommendations = []

  if (sortedCategories.length > 0) {
    // Find products in preferred categories, excluding cart items
    recommendations = await Product.find({
      isActive: true,
      category: { $in: sortedCategories },
      _id: { $nin: cartProductIds }
    })
    .sort({ ratings: -1, numReviews: -1 })
    .limit(8)

    // Sort by how preferred the category is
    recommendations = recommendations.sort((a, b) => {
      const aScore = sortedCategories.indexOf(a.category)
      const bScore = sortedCategories.indexOf(b.category)
      return aScore - bScore
    })
  }

  // If not enough recommendations, fill with popular products
  if (recommendations.length < 4) {
    const existingIds = recommendations.map(p => p._id.toString())
    const popular = await Product.find({
      isActive: true,
      _id: { $nin: [...cartProductIds, ...existingIds] }
    })
    .sort({ ratings: -1, numReviews: -1 })
    .limit(8 - recommendations.length)

    recommendations = [...recommendations, ...popular]
  }

  res.status(200).json({
    success: true,
    basedOn: sortedCategories.length > 0
      ? `Your interest in ${sortedCategories.slice(0, 2).join(" and ")}`
      : "Popular products",
    count: recommendations.length,
    recommendations
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
  searchProducts,
  uploadProductImages,
  deleteProductImage,
  getRecommendations
}