const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const Cart = require("../models/cart.model")
const Product = require("../models/product.model")

// GET my cart
const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product", "name images price stock isActive")

  if (!cart) {
    cart = { items: [], totalPrice: 0 }
  }

  res.status(200).json({ success: true, cart })
})

// ADD to cart
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body

  if (!productId || !quantity) {
    return next(new CustomError("productId and quantity are required", 400))
  }

  const product = await Product.findById(productId)

  if (!product) {
    return next(new CustomError("Product not found", 404))
  }

  if (!product.isActive) {
    return next(new CustomError("Product is not available", 400))
  }

  if (product.stock < quantity) {
    return next(new CustomError(`Only ${product.stock} items in stock`, 400))
  }

  let cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    // create new cart
    cart = new Cart({
      user: req.user.id,
      items: []
    })
  }

  // check if product already in cart
  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  )

  if (existingItem) {
    // update quantity
    existingItem.quantity += Number(quantity)
  } else {
    // add new item
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      price: product.price
    })
  }

  await cart.save()

  res.status(200).json({
    success: true,
    message: "Product added to cart",
    cart
  })
})

// UPDATE cart item quantity
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body

  if (!productId || !quantity) {
    return next(new CustomError("productId and quantity are required", 400))
  }

  const cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    return next(new CustomError("Cart not found", 404))
  }

  const item = cart.items.find(
    item => item.product.toString() === productId
  )

  if (!item) {
    return next(new CustomError("Product not in cart", 404))
  }

  item.quantity = Number(quantity)
  await cart.save()

  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart
  })
})

// REMOVE item from cart
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params

  const cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    return next(new CustomError("Cart not found", 404))
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  )

  await cart.save()

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart
  })
})

// CLEAR cart
const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    return next(new CustomError("Cart not found", 404))
  }

  cart.items = []
  await cart.save()

  res.status(200).json({
    success: true,
    message: "Cart cleared"
  })
})

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}