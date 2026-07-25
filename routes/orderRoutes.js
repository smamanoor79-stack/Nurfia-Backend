const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { placeOrder, getMyOrders, getOrderById, deleteOrder } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/myorders', protect, getMyOrders);

router.get('/admin/all', protect, isAdmin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
});

router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const wasPaidBefore = order.isPaid;

  order.isPaid = req.body.isPaid ?? order.isPaid;
  order.isDelivered = req.body.isDelivered ?? order.isDelivered;
  if (req.body.isPaid && !order.paidAt) order.paidAt = new Date();
  if (req.body.isDelivered && !order.deliveredAt) order.deliveredAt = new Date();

  const updated = await order.save();

  if (!wasPaidBefore && order.isPaid) {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
  }

  res.json(updated);
});

router.delete('/admin/:id', protect, isAdmin, deleteOrder);

router.get('/:id', protect, getOrderById);

module.exports = router;
