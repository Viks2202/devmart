const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/auth.middleware")
const {
  addReview,
  getProductReviews,
  deleteReview
} = require("../controllers/review.controller")

router.post("/:id", protect, addReview)
router.get("/:id", getProductReviews)
router.delete("/:reviewId", protect, deleteReview)

module.exports = router