const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
  try {
    const { title, price, brand, category, stock, description } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : (req.body.image || null);
    const product = await Product.create({ title, price: Number(price), brand, category, stock: Number(stock || 0), description, image });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, brand, min, max, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (min || max) filter.price = { $gte: Number(min) || 0, $lte: Number(max) || 9999999 };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
