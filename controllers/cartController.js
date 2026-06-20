const Cart = require('../models/Cart');

// Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name image price salePrice');
    if (!cart) return res.json({ cartItems: [], totalPrice: 0 });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  const { product, name, image, price, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const itemIndex = cart.cartItems.findIndex(i => i.product.toString() === product);

      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({ product, name, image, price, quantity });
      }
    } else {
      cart = new Cart({
        user: req.user._id,
        cartItems: [{ product, name, image, price, quantity }]
      });
    }

    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.cartItems = cart.cartItems.filter(i => i.product.toString() !== req.params.productId);
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};