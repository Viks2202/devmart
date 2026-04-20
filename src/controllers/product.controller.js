const getAllProducts = (req, res) => {
  const products = [
    { id: "1", name: "iPhone 15", price: 79999, category: "electronics" },
    { id: "2", name: "Nike Shoes", price: 4999, category: "clothing" },
    { id: "3", name: "Node.js Book", price: 599, category: "books" }
  ]
  res.status(200).json({ success: true, products })
}

const getProduct = (req, res) => {
  const id = req.params.id

  const products = [
    { id: "1", name: "iPhone 15", price: 79999 },
    { id: "2", name: "Nike Shoes", price: 4999 },
    { id: "3", name: "Node.js Book", price: 599 }
  ]

  const product = products.find(p => p.id === id)

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" })
  }

  res.status(200).json({ success: true, product })
}

const createProduct = (req, res) => {
  const { name, price, category } = req.body

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "name, price and category are required"
    })
  }

  const newProduct = { id: "4", name, price, category }
  res.status(201).json({ success: true, product: newProduct })
}

const updateProduct = (req, res) => {
  const id = req.params.id
  const data = req.body

  res.status(200).json({
    success: true,
    message: "Product updated",
    id: id,
    updated: data
  })
}

const deleteProduct = (req, res) => {
  const id = req.params.id

  res.status(200).json({
    success: true,
    message: `Product with id ${id} deleted`
  })
}

module.exports = { getAllProducts, getProduct, createProduct,updateProduct,deleteProduct }