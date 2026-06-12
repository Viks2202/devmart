const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")
const swaggerUi = require("swagger-ui-express")
require("dotenv").config()

const connectDB = require("./src/config/db")
const swaggerSpec = require("./src/config/swagger")
const logger = require("./src/utils/logger")

// Import all routes
const authRoutes = require("./src/routes/auth.routes")
const productRoutes = require("./src/routes/product.routes")
const userRoutes = require("./src/routes/user.routes")
const cartRoutes = require("./src/routes/cart.routes")
const orderRoutes = require("./src/routes/order.routes")
const reviewRoutes = require("./src/routes/review.routes")
const adminRoutes = require("./src/routes/admin.routes")
const paymentRoutes = require("./src/routes/payment.routes")
const wishlistRoutes = require("./src/routes/wishlist.routes")
const couponRoutes = require("./src/routes/coupon.routes")

const errorHandler = require("./src/middlewares/error.middleware")
const requestTime = require("./src/middlewares/requestTime.middleware")

const app = express()

// Connect to MongoDB
connectDB()

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers (prevents XSS, clickjacking etc)
app.use(helmet())

// Enable CORS (allow frontend to call this API)
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// Rate limiting — prevent abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 200,                  // max 200 requests per 15 min
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Stricter limit for auth endpoints (prevent brute force login)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30,                   // max 30 auth requests per hour
  message: {
    success: false,
    message: "Too many auth attempts, please try again after 1 hour"
  }
})

app.use("/api/", globalLimiter)

// HTTP request logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

// ============================================
// REQUEST PARSING
// ============================================

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Prevent NoSQL injection (cleans req.body, params, query)
//app.use(mongoSanitize())

// Prevent XSS attacks (cleans HTML in request)
//app.use(xss())

// Prevent HTTP parameter pollution
app.use(hpp({
  whitelist: ["sort", "fields", "page", "limit", "category", "status"]
}))

app.use(requestTime)

// ============================================
// SWAGGER API DOCUMENTATION
// ============================================

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "DevMart API Documentation"
}))

// ============================================
// API ROUTES — all under /api/v1
// ============================================

const API_V1 = "/api/v1"

app.use(`${API_V1}/auth`, authLimiter, authRoutes)
app.use(`${API_V1}/products`, productRoutes)
app.use(`${API_V1}/users`, userRoutes)
app.use(`${API_V1}/cart`, cartRoutes)
app.use(`${API_V1}/orders`, orderRoutes)
app.use(`${API_V1}/reviews`, reviewRoutes)
app.use(`${API_V1}/admin`, adminRoutes)
app.use(`${API_V1}/payment`, paymentRoutes)
app.use(`${API_V1}/wishlist`, wishlistRoutes)
app.use(`${API_V1}/coupons`, couponRoutes)

// ============================================
// UTILITY ROUTES
// ============================================

// Health check — used by monitoring tools
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  })
})

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DevMart API is running!",
    version: "1.0.0",
    docs: `${req.protocol}://${req.get("host")}/api-docs`,
    health: `${req.protocol}://${req.get("host")}/health`,
    api: `${req.protocol}://${req.get("host")}/api/v1`
  })
})

// 404 — catch unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// Global error handler — must be last
app.use(errorHandler)

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  logger.info(`DevMart server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})