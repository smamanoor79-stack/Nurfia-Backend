const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

const upload = multer({ storage });

router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.file.path });
});

module.exports = router;