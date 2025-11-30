const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  brand: String,
  category: String,
  price: Number,
  image: String, // path like uploads/...
  description: String,
  stock: Number
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
