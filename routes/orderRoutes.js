const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { createOrder, getOrderById } = require("../controllers/orderController");

router.post("/add-order",  createOrder);
router.get("/:id",  getOrderById);

module.exports = router;
