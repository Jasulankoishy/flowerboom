import express from 'express';
import { uploadImage } from '../controllers/productsController.js';
import { upload } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateAdmin, uploadLimiter, upload.single('image'), uploadImage);

export default router;
