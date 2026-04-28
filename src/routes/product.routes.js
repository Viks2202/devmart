const express = require("express")
const router = express.Router()
const stockCheck = require("../middlewares/stockCheck.middleware")

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
router.get("/", getAllProducts)
router.get("/:id", getProduct)
router.post("/", stockCheck, createProduct)
router.put("/:id", updateProduct)
router.delete("/:id", deleteProduct)


module.exports = router