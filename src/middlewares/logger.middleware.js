const logger = (req, res, next) => {
  const start = Date.now()
  const url = req.originalUrl

  console.log(`➡️  ${req.method} ${url}`)

  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(`✅ ${req.method} ${url} → ${res.statusCode} (${duration}ms)`)
  })

  next()   // ← make sure this is here and not inside res.on("finish")
}

module.exports = logger