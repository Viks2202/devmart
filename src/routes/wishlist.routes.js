const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/auth.middleware")
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
} = require("../controllers/wishlist.controller")

router.get("/", protect, getWishlist)
router.post("/add", protect, addToWishlist)
router.get("/check/:productId", protect, checkWishlist)
router.delete("/item/:productId", protect, removeFromWishlist)
router.delete("/clear", protect, clearWishlist)

module.exports = router