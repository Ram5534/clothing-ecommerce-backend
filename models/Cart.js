const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  guestId: { type: String, default: null },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
