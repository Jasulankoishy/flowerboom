import express from 'express';
import { exportOrders, exportProducts } from '../controllers/exportController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/admin/export/products', authenticateAdmin, apiLimiter, exportProducts);
router.get('/admin/export/orders', authenticateAdmin, apiLimiter, exportOrders);

export default router;
