const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // include id and name/email optionally
    req.user = decoded;
    return next();
  } catch (err) {
    // invalid token -> clear cookie and continue as guest
    res.clearCookie("token");
    return next();
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { optionalAuth, requireAuth };
