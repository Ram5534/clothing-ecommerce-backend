const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { createOrder, getOrderById } = require("../controllers/orderController");

router.post("/",requireAuth,  createOrder);
router.get("/:id",requireAuth,  getOrderById);

module.exports = router;
