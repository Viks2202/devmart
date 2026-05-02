const priceCheck = (req, res, next) => {
  const { minPrice, maxPrice } = req.query

  if (minPrice && maxPrice) {
    if (Number(minPrice) > Number(maxPrice)) {
      return next(new Error("Minimum price cannot be greater than maximum price"))
    }
  }

  if (minPrice && Number(minPrice) < 0) {
    return next(new Error("Minimum price cannot be negative"))
  }

  next()
}

module.exports = priceCheck