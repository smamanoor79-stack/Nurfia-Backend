const Product = require('../models/Product');

// GET all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get FilteredProducts

const getFilteredProducts = async (req, res) => {
  try {
    const { category, colors, sizes, maxPrice, stock, search, sortBy } = req.query;

    let filter = {};

    // Category/SubCategory
    if (category && category !== 'all') {
      filter.subCategory = category;
    }

    // Colors
    if (colors) {
      const colorArray = colors.split(',');
      filter.colors = { $in: colorArray };
    }

    // Sizes
    if (sizes) {
      const sizeArray = sizes.split(',');
      filter.sizes = { $in: sizeArray };
    }

    // Price
    if (maxPrice) {
      filter.$or = [
        { salePrice: { $lte: Number(maxPrice) } },
        { price: { $lte: Number(maxPrice) } }
      ];
    }

    // Stock
    if (stock === 'in-stock') filter.stock = { $gt: 0 };
    if (stock === 'out-of-stock') filter.stock = { $lte: 0 };

    // Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    let sortOption = {};
    if (sortBy === 'price-low') sortOption = { salePrice: 1, price: 1 };
    else if (sortBy === 'price-high') sortOption = { salePrice: -1, price: -1 };
    else if (sortBy === 'rating') sortOption = { rating: -1 };
    else if (sortBy === 'discount') sortOption = { discount: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN - Create product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN - Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN - Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getFilteredProducts };