const express = require("express");
const multer = require("multer");
const path = require("path");
const { addProduct, getProducts, getProductById } = require("../controllers/productController");
const { optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/add-product", upload.single("image"), addProduct); // you can add requireAuth if you want to restrict
module.exports = router;
