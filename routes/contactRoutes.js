const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ===== PUBLIC: Submit contact form =====
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({ message: 'Name, email and subject are required.' });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({ message: 'Message sent successfully!', data: newMessage });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// ===== ADMIN: Get all messages =====
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch messages.' });
  }
});

// ===== ADMIN: Mark message as read/unread =====
router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    msg.isRead = req.body.isRead ?? msg.isRead;
    const updated = await msg.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Could not update message.' });
  }
});

// ===== ADMIN: Delete a message =====
router.delete('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    await msg.deleteOne();
    res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete message.' });
  }
});

module.exports = router;