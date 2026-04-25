import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
} from '../controllers/productsController.js';
import { upload } from '../middleware/upload.js';
import { validateProduct, validateProductId } from '../middleware/validate.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, getAllProducts);
router.get('/:idOrSlug', apiLimiter, getProductById);

// Protected admin routes
router.post('/', authenticateAdmin, uploadLimiter, upload.single('image'), validateProduct, createProduct);
router.put('/:id', authenticateAdmin, uploadLimiter, upload.single('image'), validateProductId, validateProduct, updateProduct);
router.delete('/:id', authenticateAdmin, apiLimiter, validateProductId, deleteProduct);

export default router;
