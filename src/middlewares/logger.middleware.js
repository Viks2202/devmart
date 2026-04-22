const logger = (req, res, next) => {
  const start = Date.now()
  const url = req.originalUrl   // ← change req.url to req.originalUrl

  console.log(`➡️  ${req.method} ${url}`)

  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(`✅ ${req.method} ${url} → ${res.statusCode} (${duration}ms)`)
  })

  next()
}

module.exports = logger