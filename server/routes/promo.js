import express from 'express';
import {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  updatePromoCode,
  validatePromoCode
} from '../controllers/promoController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validateProductId } from '../middleware/validate.js';

const router = express.Router();

router.post('/promo/validate', validatePromoCode);
router.get('/admin/promo-codes', authenticateAdmin, getPromoCodes);
router.post('/admin/promo-codes', authenticateAdmin, createPromoCode);
router.put('/admin/promo-codes/:id', authenticateAdmin, validateProductId, updatePromoCode);
router.delete('/admin/promo-codes/:id', authenticateAdmin, validateProductId, deletePromoCode);

export default router;
