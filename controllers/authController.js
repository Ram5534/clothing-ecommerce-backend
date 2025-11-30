const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");

const createTokenAndSetCookie = (user, res) => {
  const payload = { id: user._id, name: user.name, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_DAYS || 7}d`
  });
  // secure flag true only in production with https
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_EXPIRES_DAYS || 7)
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, guestId } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // merge guest cart if provided
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart) {
        guestCart.userId = user._id;
        guestCart.guestId = null;
        await guestCart.save();
      }
    }

    createTokenAndSetCookie(user, res);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, guestId } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // merge guest cart into user's cart
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      let userCart = await Cart.findOne({ userId: user._id });

      if (guestCart) {
        if (!userCart) {
          guestCart.userId = user._id;
          guestCart.guestId = null;
          await guestCart.save();
        } else {
          guestCart.items.forEach((g) => {
            const existing = userCart.items.find(i => i.productId.toString() === g.productId.toString());
            if (existing) existing.quantity += g.quantity;
            else userCart.items.push(g);
          });
          await userCart.save();
          await Cart.deleteOne({ guestId });
        }
      }
    }

    createTokenAndSetCookie(user, res);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

// new route: GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    // req.user comes from requireAuth or optionalAuth decoded token
    const { id, name, email } = req.user;
    res.json({ id, name, email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
