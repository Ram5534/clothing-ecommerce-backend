const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { items, total, name, email, guestId } = req.body;

    // basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    // enrich items with price/title (optional)
    const enriched = await Promise.all(items.map(async (it) => {
      const p = await Product.findById(it.productId);
      return {
        productId: it.productId,
        quantity: it.quantity,
        price: p?.price || it.price || 0,
        title: p?.title || it.title || ""
      };
    }));

    const order = await Order.create({
      userId,
      name,
      email,
      items: enriched,
      total: Number(total)
    });

    // clear user's cart or guest cart
    if (userId) await Cart.deleteOne({ userId });
    else if (guestId) await Cart.deleteOne({ guestId });

    // prepare email HTML
    const itemsHtml = enriched.map(i => `<li>${i.title} x ${i.quantity} - ₹${i.price}</li>`).join("");
    const html = `
      <h3>Thank you for your order${name ? `, ${name}` : ""}!</h3>
      <p>Order ID: <strong>${order._id}</strong></p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ₹${order.total}</p>
    `;

    // send order confirmation (async)
    try {
      await sendEmail({ to: email, subject: "Order Confirmation", html });
    } catch (e) {
      console.error("Email send failed:", e.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: "Order not found" });
    res.json(o);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
