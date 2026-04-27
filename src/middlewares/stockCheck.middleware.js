const CustomError = require("./customError")

const stockCheck = (req, res, next) => {
  const { stock } = req.body

  // if stock provided, check it's not negative
  if (stock !== undefined && stock < 0) {
    throw new CustomError("Stock cannot be negative", 400)
  }

  // if stock not provided, set default to 0
  if (stock === undefined) {
    req.body.stock = 0
  }

  next()
}

module.exports = stockCheck