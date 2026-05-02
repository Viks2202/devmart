const express = require("express")
const router = express.Router()
const stockCheck = require("../middlewares/stockCheck.middleware")
const priceCheck = require("../middlewares/priceCheck.middleware")
const { protect, authorize } = require("../middlewares/auth.middleware")

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getProductsByCategory,
  searchProducts
} = require("../controllers/product.controller")

router.get("/search", searchProducts)
router.get("/stats", getProductStats)
router.get("/category/:category", getProductsByCategory)
router.get("/", priceCheck, getAllProducts)
router.get("/:id", getProduct)

router.post("/", protect, authorize("admin"), stockCheck, createProduct)
router.put("/:id", protect, authorize("admin"), updateProduct)
router.delete("/:id", protect, authorize("admin"), deleteProduct)

module.exports = router