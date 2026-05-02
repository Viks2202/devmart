const jwt = require("jsonwebtoken")
const asyncHandler = require("./async.middleware")
const CustomError = require("./customError")
const User = require("../models/user.model")

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new CustomError("Please login to access this route", 401))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)

  if (!req.user) {
    return next(new CustomError("User not found", 401))
  }

  next()
})

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `Role '${req.user.role}' is not allowed to access this route`,
          403
        )
      )
    }
    next()
  }
}

module.exports = { protect, authorize }