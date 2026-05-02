const errorHandler = (err, req, res, next) => {
  console.error(`❌ ERROR: ${err.message}`)

  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"

  // mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors).map(e => e.message).join(", ")
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    message = "Email already registered"
  }

  // jwt errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  }

  res.status(statusCode).json({
    success: false,
    message
  })
}

module.exports = errorHandler