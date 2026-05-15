const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Order = require("../models/order.model")
const Cart = require("../models/cart.model")
const Product = require("../models/product.model")

// PLACE order from cart
const placeOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body

  if (!shippingAddress) {
    return next(new CustomError("Shipping address is required", 400))
  }

  if (
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.pincode
  ) {
    return next(
      new CustomError("street, city, state and pincode are required", 400)
    )
  }

  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product")

  if (!cart || cart.items.length === 0) {
    return next(new CustomError("Cart is empty", 400))
  }

  // build order items
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    price: item.price,
    quantity: item.quantity,
    image: item.product.images[0]?.url || ""
  }))

  // create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    totalPrice: cart.totalPrice,
    paymentMethod: paymentMethod || "cod"
  })

  // clear cart after order
  cart.items = []
  await cart.save()

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order
  })
})

// GET my orders
const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  })
})

// GET single order
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  // only owner or admin can see order
  if (
    order.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new CustomError("Not authorized to view this order", 403))
  }

  res.status(200).json({ success: true, order })
})

// UPDATE order status — admin only
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
  if (!validStatuses.includes(status)) {
    return next(new CustomError("Invalid status", 400))
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )

  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order
  })
})

// GET all orders — admin only
const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalPrice, 0
  )

  res.status(200).json({
    success: true,
    count: orders.length,
    totalRevenue,
    orders
  })
})

// CANCEL order
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new CustomError("Order not found", 404))
  }

  if (order.user.toString() !== req.user.id) {
    return next(new CustomError("Not authorized", 403))
  }

  if (order.status === "delivered") {
    return next(new CustomError("Cannot cancel delivered order", 400))
  }

  if (order.status === "cancelled") {
    return next(new CustomError("Order already cancelled", 400))
  }

  order.status = "cancelled"
  await order.save()

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    order
  })
})

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
}