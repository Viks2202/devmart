const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const asyncHandler = require("../middlewares/async.middleware")
const CustomError = require("../middlewares/customError")
const User = require("../models/user.model")
const { sendEmail, emailTemplates } = require("../utils/email")

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  })

// REGISTER
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return next(new CustomError("name, email and password are required", 400))
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new CustomError("Email already registered", 409))
  }

  const user = await User.create({ name, email, password })

  const verifyToken = user.generateEmailVerifyToken()
  await user.save({ validateBeforeSave: false })

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`
  const { subject, html } = emailTemplates.verifyEmail(name, verifyUrl)

  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    user.emailVerifyToken = undefined
    user.emailVerifyExpire = undefined
    await user.save({ validateBeforeSave: false })
    console.error("Email failed:", err.message)
  }

  const accessToken = generateAccessToken(user._id)
  const refreshTokenStr = generateRefreshToken(user._id)

  user.refreshToken = refreshTokenStr
  await user.save({ validateBeforeSave: false })

  res.cookie("refreshToken", refreshTokenStr, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.status(201).json({
    success: true,
    message: "Registered. Please verify your email.",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  })
})

// VERIFY EMAIL
const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpire: { $gt: Date.now() }
  }).select("+emailVerifyToken +emailVerifyExpire")

  if (!user) {
    return next(new CustomError("Invalid or expired token", 400))
  }

  user.isVerified = true
  user.emailVerifyToken = undefined
  user.emailVerifyExpire = undefined
  await user.save({ validateBeforeSave: false })

  const { subject, html } = emailTemplates.welcomeEmail(user.name)
  await sendEmail({ to: user.email, subject, html })

  res.status(200).json({
    success: true,
    message: "Email verified successfully"
  })
})

// LOGIN
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new CustomError("Email and password are required", 400))
  }

  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return next(new CustomError("Invalid email or password", 401))
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return next(new CustomError("Invalid email or password", 401))
  }

  const accessToken = generateAccessToken(user._id)
  const refreshTokenStr = generateRefreshToken(user._id)

  user.refreshToken = refreshTokenStr
  await user.save({ validateBeforeSave: false })

  res.cookie("refreshToken", refreshTokenStr, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  })
})

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return next(new CustomError("Email is required", 400))
  }

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent"
    })
  }

  const resetToken = user.generateResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  const { subject, html } = emailTemplates.resetPassword(user.name, resetUrl)

  try {
    await sendEmail({ to: user.email, subject, html })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    return next(new CustomError("Email could not be sent", 500))
  }

  res.status(200).json({
    success: true,
    message: "If this email exists, a reset link has been sent"
  })
})

// RESET PASSWORD
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body

  if (!password) {
    return next(new CustomError("Password is required", 400))
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select("+resetPasswordToken +resetPasswordExpire")

  if (!user) {
    return next(new CustomError("Invalid or expired reset token", 400))
  }

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please login."
  })
})

// GET ME
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({ success: true, user })
})

// UPDATE PROFILE
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body

  if (req.body.password) {
    return next(
      new CustomError("Use /auth/change-password to update password", 400)
    )
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  )

  res.status(200).json({ success: true, user })
})

// CHANGE PASSWORD
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(
      new CustomError("Current and new password are required", 400)
    )
  }

  const user = await User.findById(req.user.id).select("+password")

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return next(new CustomError("Current password is incorrect", 401))
  }

  user.password = newPassword
  await user.save()

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  })
})

// HANDLE REFRESH TOKEN
const handleRefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken

  if (!token) {
    return next(new CustomError("No refresh token", 401))
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

  const user = await User.findOne({
    _id: decoded.id,
    refreshToken: token
  }).select("+refreshToken")

  if (!user) {
    return next(new CustomError("Invalid refresh token", 401))
  }

  const accessToken = generateAccessToken(user._id)
  res.status(200).json({ success: true, accessToken })
})

// LOGOUT
const logout = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null })
  res.clearCookie("refreshToken")
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
})

// RESEND VERIFICATION
const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("+emailVerifyToken +emailVerifyExpire")

  if (user.isVerified) {
    return next(new CustomError("Email already verified", 400))
  }

  const verifyToken = user.generateEmailVerifyToken()
  await user.save({ validateBeforeSave: false })

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`
  const { subject, html } = emailTemplates.verifyEmail(user.name, verifyUrl)
  await sendEmail({ to: user.email, subject, html })

  res.status(200).json({
    success: true,
    message: "Verification email resent"
  })
})

module.exports = {
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
}