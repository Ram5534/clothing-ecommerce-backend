const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://clothing-ecommerce-frontend-4kti-3trjfk2vp-ram5534s-projects.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
};

// ------------------
// Middlewares
// ------------------
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Enable CORS
app.use(cors(corsOptions));


// ------------------
// Routes
// ------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Health check
app.get("/", (req, res) => res.send("Welcome"));

// Global Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
