const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wishlistItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);