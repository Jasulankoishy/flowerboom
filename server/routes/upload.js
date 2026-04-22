import express from 'express';
import { uploadImage } from '../controllers/productsController.js';
import { upload } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', uploadLimiter, upload.single('image'), uploadImage);

export default router;
