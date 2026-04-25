import express from 'express';
import { getProductReviews, addReview, deleteReview } from '../controllers/reviewsController.js';
import { validateProductId, validateReview, validateReviewId } from '../middleware/validate.js';
import { apiLimiter, reviewLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/products/:id/reviews', apiLimiter, validateProductId, getProductReviews);
router.post('/products/:id/reviews', authenticateToken, reviewLimiter, validateProductId, validateReview, addReview);
router.delete('/reviews/:id', authenticateAdmin, apiLimiter, validateReviewId, deleteReview);

export default router;
