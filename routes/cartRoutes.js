const express = require("express");
const router = express.Router();
const { optionalAuth, requireAuth } = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeGuestCart
} = require("../controllers/cartController");

router.get("/", optionalAuth, getCart);
router.post("/add", optionalAuth, addToCart);
router.put("/update", optionalAuth, updateCartItem);     // body: { itemId, quantity, guestId }
router.delete("/remove", optionalAuth, removeCartItem);  // body: { itemId, guestId }
router.post("/merge", requireAuth, mergeGuestCart);      // body: { guestId }

module.exports = router;
