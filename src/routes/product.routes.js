const express = require("express")
const router = express.Router()
const stockCheck = require("../middlewares/stockCheck.middleware")
const priceCheck = require("../middlewares/priceCheck.middleware")
const { protect, authorize } = require("../middlewares/auth.middleware")
const { upload } = require("../middlewares/upload.middleware")

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getProductsByCategory,
  searchProducts,
  uploadProductImages,
  deleteProductImage
} = require("../controllers/product.controller")

// public routes
router.get("/search", searchProducts)
router.get("/stats", getProductStats)
router.get("/category/:category", getProductsByCategory)
router.get("/", priceCheck, getAllProducts)
router.get("/:id", getProduct)

// protected routes — admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  stockCheck,
  createProduct
)
router.put("/:id", protect, authorize("admin"), updateProduct)
router.delete("/:id", protect, authorize("admin"), deleteProduct)

// image routes — admin only
router.post(
  "/:id/images",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  uploadProductImages
)
router.delete(
  "/:id/images",
  protect,
  authorize("admin"),
  deleteProductImage
)

module.exports = router