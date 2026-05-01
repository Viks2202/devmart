const CustomError = require("./customError")

const priceCheck = (req, res, next) => {
  const { minPrice, maxPrice } = req.query

  if (minPrice && maxPrice) {
    if (Number(minPrice) > Number(maxPrice)) {
      throw new CustomError(
        "Minimum price cannot be greater than maximum price",
        400
      )
    }
  }

  if (minPrice && Number(minPrice) < 0) {
    throw new CustomError("Minimum price cannot be negative", 400)
  }

  next()
}

module.exports = priceCheck