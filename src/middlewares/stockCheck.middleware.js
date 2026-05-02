const stockCheck = (req, res, next) => {
  const { stock } = req.body

  if (stock !== undefined && stock < 0) {
    return next(new Error("Stock cannot be negative"))
  }

  if (stock === undefined) {
    req.body.stock = 0
  }

  next()
}

module.exports = stockCheck