const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  discount: { type: Number },
  colors: [String],
  sizes: [String],
  stock: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: { type: String },
  images: [String],
  description: { type: String },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);