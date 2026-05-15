const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middlewares/auth.middleware")
const {
  placeOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} = require("../controllers/order.controller")

router.post("/", protect, placeOrder)
router.get("/my", protect, getMyOrders)
router.get("/all", protect, authorize("admin"), getAllOrders)
router.get("/:id", protect, getOrder)
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus)
router.put("/:id/cancel", protect, cancelOrder)

module.exports = router