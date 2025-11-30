const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  name: String,
  email: String,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
      title: String
    }
  ],
  total: Number,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
