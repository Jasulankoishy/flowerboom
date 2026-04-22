import express from 'express';
import { getProductReviews, addReview, deleteReview } from '../controllers/reviewsController.js';
import { validateProductId, validateReview, validateReviewId } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/products/:id/reviews', apiLimiter, validateProductId, getProductReviews);
router.post('/products/:id/reviews', apiLimiter, validateProductId, validateReview, addReview);
router.delete('/reviews/:id', apiLimiter, validateReviewId, deleteReview);

export default router;
