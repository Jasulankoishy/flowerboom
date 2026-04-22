import express from 'express';
import { sendCode, verifyCode, adminLogin, refreshToken } from '../controllers/authController.js';
import { validateEmail, validateVerificationCode, validateAdminLogin } from '../middleware/validate.js';
import { authLimiter, adminLoginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/send-code', authLimiter, validateEmail, sendCode);
router.post('/verify-code', authLimiter, validateVerificationCode, verifyCode);
router.post('/admin/login', adminLoginLimiter, validateAdminLogin, adminLogin);
router.post('/refresh', authLimiter, refreshToken);

export default router;
