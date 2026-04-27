import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  getAdminStats,
  getAdminAnalytics,
  updateOrderStatus
} from '../controllers/ordersController.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/orders', authenticateToken, createOrder);
router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:id', authenticateToken, getOrder);

// Admin routes
router.get('/admin/stats', authenticateAdmin, getAdminStats);
router.get('/admin/analytics', authenticateAdmin, getAdminAnalytics);
router.get('/admin/orders', authenticateAdmin, getAllOrders);
router.patch('/admin/orders/:id/status', authenticateAdmin, updateOrderStatus);

export default router;
