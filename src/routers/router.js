const express = require("express")
const invoice = require("../controllers/invoce.controller.js")
const app = express()
app.use(express.json())
// routers
app.use("/invoice/api",invoice)
module.exports = app