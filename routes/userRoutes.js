const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Admin: get all users
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// Admin: delete user
router.delete('/admin/:id', protect, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin user' });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});

// Admin: toggle isAdmin
router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isAdmin = req.body.isAdmin;
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, isAdmin: updated.isAdmin });
});

router.post('/register', (req, res, next) => {
  console.log("Register route hit!");
  next();
}, registerUser);

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;