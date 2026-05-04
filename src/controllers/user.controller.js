const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const User = require("../models/user.model")

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isActive: true })
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: users.length,
    users
  })
})

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new CustomError("User not found", 404))
  }

  res.status(200).json({ success: true, user })
})

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!user) {
    return next(new CustomError("User not found", 404))
  }

  res.status(200).json({
    success: true,
    message: "User deactivated successfully"
  })
})

module.exports = { getAllUsers, getUser, deleteUser }