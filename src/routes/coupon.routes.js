const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middlewares/auth.middleware")
const {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/coupon.controller")

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Validate and apply a coupon
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, cartTotal]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE10
 *               cartTotal:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       404:
 *         description: Invalid coupon
 */
router.post("/apply", protect, applyCoupon)

// Admin routes
router.get("/", protect, authorize("admin"), getAllCoupons)
router.get("/:id", protect, authorize("admin"), getCoupon)
router.post("/", protect, authorize("admin"), createCoupon)
router.put("/:id", protect, authorize("admin"), updateCoupon)
router.delete("/:id", protect, authorize("admin"), deleteCoupon)

module.exports = router