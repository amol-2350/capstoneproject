const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "password",
  database: "ecommerce"
})

const promiseDb = db.promise()

app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch orders" })
    }
    res.json(result)
  })
})

app.post("/orders", async (req, res) => {
  const product_id = Number(req.body.product_id)
  const quantity = Number(req.body.quantity)

  if (
    !Number.isInteger(product_id) ||
    product_id <= 0 ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: "Valid product_id and quantity are required"
    })
  }

  try {
    await promiseDb.beginTransaction()

    const [inventoryRows] = await promiseDb.query(
      "SELECT stock FROM inventory WHERE product_id = ? FOR UPDATE",
      [product_id]
    )

    if (inventoryRows.length === 0) {
      await promiseDb.rollback()
      return res.status(404).json({
        message: "Product inventory not found"
      })
    }

    const availableStock = inventoryRows[0].stock

    if (availableStock < quantity) {
      await promiseDb.rollback()
      return res.status(400).json({
        message: "Insufficient stock",
        availableStock
      })
    }

    // Reduce inventory stock
    await promiseDb.query(
      "UPDATE inventory SET stock = stock - ? WHERE product_id = ?",
      [quantity, product_id]
    )

    // Keep product stock in sync
    await promiseDb.query(
      "UPDATE products SET stock = stock - ? WHERE id = ?",
      [quantity, product_id]
    )

    // Create order
    await promiseDb.query(
      "INSERT INTO orders (product_id, quantity, status) VALUES (?, ?, ?)",
      [product_id, quantity, "CREATED"]
    )

    await promiseDb.commit()

    res.status(201).json({
      message: "Order created successfully",
      product_id,
      quantity,
      remainingStock: availableStock - quantity
    })
  } catch (err) {
    try {
      await promiseDb.rollback()
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message)
    }

    console.error("Order creation failed:", err.message)
    res.status(500).json({ message: "Failed to create order" })
  }
})

app.listen(5002, () => console.log("order service running"))