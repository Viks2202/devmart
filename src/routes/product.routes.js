const express = require("express")
const router = express.Router()

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller")

router.get("/", getAllProducts)
router.get("/:id", getProduct)
router.post("/", createProduct)
router.put("/:id", updateProduct)
router.delete("/:id", deleteProduct)

module.exports = router