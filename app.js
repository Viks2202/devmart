const express = require("express")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const connectDB = require("./src/config/db")
const authRoutes = require("./src/routes/auth.routes")
const productRoutes = require("./src/routes/product.routes")
const userRoutes = require("./src/routes/user.routes")
const cartRoutes = require("./src/routes/cart.routes")
const orderRoutes = require("./src/routes/order.routes")
const reviewRoutes = require("./src/routes/review.routes")
const logger = require("./src/middlewares/logger.middleware")
const errorHandler = require("./src/middlewares/error.middleware")
const requestTime = require("./src/middlewares/requestTime.middleware")

const app = express()

connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(logger)
app.use(requestTime)

app.use("/auth", authRoutes)
app.use("/products", productRoutes)
app.use("/users", userRoutes)
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)
app.use("/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.json({ message: "DevMart API is running!" })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`DevMart server running on port ${PORT}`)
})