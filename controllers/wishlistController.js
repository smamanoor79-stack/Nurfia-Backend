const Wishlist = require('../models/Wishlist');

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.json({ wishlistItems: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  const { product, name, image, price } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      const exists = wishlist.wishlistItems.find(i => i.product.toString() === product);
      if (exists) return res.status(400).json({ message: 'Product already in wishlist' });
      wishlist.wishlistItems.push({ product, name, image, price });
    } else {
      wishlist = new Wishlist({
        user: req.user._id,
        wishlistItems: [{ product, name, image, price }]
      });
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.wishlistItems = wishlist.wishlistItems.filter(i => i.product.toString() !== req.params.productId);
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};