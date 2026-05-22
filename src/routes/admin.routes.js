const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middlewares/auth.middleware")
const {
  getDashboardStats,
  getAllUsers,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  deactivateUser
} = require("../controllers/admin.controller")

router.get("/stats", protect, authorize("admin"), getDashboardStats)
router.get("/users", protect, authorize("admin"), getAllUsers)
router.get("/products", protect, authorize("admin"), getAllProductsAdmin)
router.get("/orders", protect, authorize("admin"), getAllOrdersAdmin)
router.put("/users/:id/deactivate", protect, authorize("admin"), deactivateUser)

module.exports = router