import express from 'express';
import {
  createShowcaseSlide,
  deleteShowcaseSlide,
  getAdminShowcase,
  getPublicShowcase,
  updateShowcaseSlide
} from '../controllers/showcaseController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validateProductId } from '../middleware/validate.js';

const router = express.Router();

router.get('/showcase', getPublicShowcase);
router.get('/admin/showcase', authenticateAdmin, getAdminShowcase);
router.post('/admin/showcase', authenticateAdmin, createShowcaseSlide);
router.put('/admin/showcase/:id', authenticateAdmin, validateProductId, updateShowcaseSlide);
router.delete('/admin/showcase/:id', authenticateAdmin, validateProductId, deleteShowcaseSlide);

export default router;
