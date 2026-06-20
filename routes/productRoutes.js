const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getFilteredProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/filter', getFilteredProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;