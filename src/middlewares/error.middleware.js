const logger = require("../utils/logger")

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"

  // Log all errors
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`)

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors).map(e => e.message).join(", ")
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message = `${field} already exists`
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired, please login again"
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid ID format`
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  })
}

module.exports = errorHandler