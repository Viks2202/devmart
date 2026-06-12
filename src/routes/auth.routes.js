/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vikas Sharma
 *               email:
 *                 type: string
 *                 example: vikas@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: vikas@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful with accessToken
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 */
const express = require("express")
const router = express.Router()

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  handleRefreshToken,
  logout,
  resendVerification
} = require("../controllers/auth.controller")

const { protect } = require("../middlewares/auth.middleware")

router.post("/register", register)
router.get("/verify-email/:token", verifyEmail)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.get("/me", protect, getMe)
router.put("/profile", protect, updateProfile)
router.put("/change-password", protect, changePassword)
router.post("/refresh", handleRefreshToken)
router.post("/logout", protect, logout)
router.post("/resend-verification", protect, resendVerification)

module.exports = router