const express = require("express")
const router = express.Router()

const {
  register,
  login,
  getMe,
  handleRefreshToken,
  logout,
  updateProfile,
  changePassword
} = require("../controllers/auth.controller")

const { protect } = require("../middlewares/auth.middleware")

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.post("/refresh", handleRefreshToken)
router.post("/logout", protect, logout)
router.put("/profile", protect, updateProfile)
router.put("/change-password", protect, changePassword)

module.exports = router