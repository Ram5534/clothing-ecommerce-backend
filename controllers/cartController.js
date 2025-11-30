const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET cart by userId or guestId
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const guestId = req.query.guestId || null;

    const cart = await Cart.findOne({
      $or: [{ userId: userId || null }, { guestId: guestId || null }]
    }).populate("items.productId");

    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1, guestId } = req.body;
    const userId = req.user?.id || null;

    if (!productId) return res.status(400).json({ message: "productId required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ $or: [{ userId }, { guestId }] });

    if (!cart) {
      cart = await Cart.create({ userId: userId || null, guestId: userId ? null : guestId || null, items: [] });
    }

    const existing = cart.items.find(i => i.productId.toString() === productId.toString());
    if (existing) existing.quantity += Number(qty);
    else cart.items.push({ productId: product._id, quantity: Number(qty) });

    await cart.save();
    const populated = await cart.populate("items.productId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /cart/update  (body: itemId, quantity, guestId)
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity, guestId } = req.body;
    const userId = req.user?.id || null;
    const cart = await Cart.findOne({ $or: [{ userId }, { guestId }] });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = Number(quantity);
    await cart.save();
    const populated = await cart.populate("items.productId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /cart/remove  (body: itemId, guestId)
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId, guestId } = req.body;
    const userId = req.user?.id || null;
    const cart = await Cart.findOne({ $or: [{ userId }, { guestId }] });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    cart.items = cart.items.filter(i => i.id !== itemId);
    await cart.save();
    const populated = await cart.populate("items.productId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /cart/merge (requires login)
exports.mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guestId } = req.body;
    const guestCart = await Cart.findOne({ guestId });
    let userCart = await Cart.findOne({ userId });

    if (!guestCart) return res.json(userCart || { items: [] });

    if (!userCart) {
      guestCart.userId = userId;
      guestCart.guestId = null;
      await guestCart.save();
      const populated = await guestCart.populate("items.productId");
      return res.json(populated);
    }

    guestCart.items.forEach(gItem => {
      const match = userCart.items.find(u => u.productId.toString() === gItem.productId.toString());
      if (match) match.quantity += gItem.quantity;
      else userCart.items.push(gItem);
    });

    await userCart.save();
    await Cart.deleteOne({ guestId });
    const populated = await userCart.populate("items.productId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
