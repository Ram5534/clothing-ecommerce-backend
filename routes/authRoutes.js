const express = require("express");
const { register, login, logout, getMe } = require("../controllers/authController");
const { optionalAuth, requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// me
router.get("/me", optionalAuth, getMe); // optionalAuth sets req.user if cookie present

module.exports = router;
