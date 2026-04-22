const express = require("express")
require("dotenv").config()

const productRoutes = require("./src/routes/product.routes")
const logger = require("./src/middlewares/logger.middleware")
const errorHandler = require("./src/middlewares/error.middleware")
const requestTime = require("./src/middlewares/requestTime.middleware")

const app = express()

app.use(express.json())
app.use(logger)
app.use(requestTime)        // ← add this line

app.use("/products", productRoutes)

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