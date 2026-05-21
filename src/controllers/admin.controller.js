const asyncHandler = require("../middlewares/async.middleware")
const User = require("../models/user.model")
const Product = require("../models/product.model")
const Order = require("../models/order.model")
const Review = require("../models/review.model")

// GET dashboard stats
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments({ isActive: true })
  const totalProducts = await Product.countDocuments({ isActive: true })
  const totalOrders = await Order.countDocuments()
  const totalReviews = await Review.countDocuments()

  // revenue
  const orders = await Order.find({ status: { $ne: "cancelled" } })
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)

  // orders by status
  const pending = await Order.countDocuments({ status: "pending" })
  const confirmed = await Order.countDocuments({ status: "confirmed" })
  const shipped = await Order.countDocuments({ status: "shipped" })
  const delivered = await Order.countDocuments({ status: "delivered" })
  const cancelled = await Order.countDocuments({ status: "cancelled" })

  // recent orders
  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5)

  // top products by orders
  const topProducts = await Product.find({ isActive: true })
    .sort({ numReviews: -1 })
    .limit(5)
    .select("name price ratings numReviews images")

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalReviews,
      totalRevenue,
      ordersByStatus: {
        pending,
        confirmed,
        shipped,
        delivered,
        cancelled
      }
    },
    recentOrders,
    topProducts
  })
})

// GET all users
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: users.length,
    users
  })
})

// GET all products (including inactive)
const getAllProductsAdmin = asyncHandler(async (req, res, next) => {
  const products = await Product.find()
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: products.length,
    products
  })
})

// GET all orders
const getAllOrdersAdmin = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })

  const totalRevenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0)

  res.status(200).json({
    success: true,
    count: orders.length,
    totalRevenue,
    orders
  })
})

// DEACTIVATE user
const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  res.status(200).json({
    success: true,
    message: "User deactivated"
  })
})

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  deactivateUser
}