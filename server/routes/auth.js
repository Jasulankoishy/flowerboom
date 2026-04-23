import express from 'express';
import passport from '../config/passport.js';
import { register, login, forgotPassword, resetPassword, adminLogin, refreshToken } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateEmail, validateResetPassword, validateAdminLogin } from '../middleware/validate.js';
import { authLimiter, adminLoginLimiter } from '../middleware/rateLimiter.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

// Email/Password authentication
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Password reset
router.post('/forgot-password', authLimiter, validateEmail, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.FRONTEND_URL + '/auth?error=google_auth_failed'
  }),
  (req, res) => {
    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: req.user.id,
      email: req.user.email,
      isAdmin: false
    });
    const refreshToken = generateRefreshToken({ userId: req.user.id });

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  }
);

// Admin login (keep existing)
router.post('/admin/login', adminLoginLimiter, validateAdminLogin, adminLogin);

// Refresh token (keep existing)
router.post('/refresh', authLimiter, refreshToken);

export default router;
