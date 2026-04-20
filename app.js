const express = require("express")
require("dotenv").config()

const productRoutes = require("./src/routes/product.routes")

const app = express()
app.use(express.json())

app.use("/products", productRoutes)

app.get("/", (req, res) => {
  res.json({ message: "DevMart API is running!" })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`DevMart server running on port ${PORT}`)
})