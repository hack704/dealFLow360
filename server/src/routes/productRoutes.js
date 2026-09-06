const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, archiveProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .patch(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), archiveProduct);

router.patch('/:id/archive', protect, authorize('admin'), archiveProduct);

module.exports = router;
