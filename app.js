const express = require("express")
require("dotenv").config()

const productRoutes = require("./src/routes/product.routes")
const logger = require("./src/middlewares/logger.middleware")
const errorHandler = require("./src/middlewares/error.middleware")

const app = express()

// built-in middleware
app.use(express.json())

// custom logger — runs on every request
app.use(logger)

// routes
app.use("/products", productRoutes)

// home
app.get("/", (req, res) => {
  res.json({ message: "DevMart API is running!" })
})

// 404 — unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  })
})

// global error handler — MUST be last
app.use(errorHandler)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`DevMart server running on port ${PORT}`)
})