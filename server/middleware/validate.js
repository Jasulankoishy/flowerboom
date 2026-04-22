import { body, param, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth validation
export const validateEmail = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  validate
];

export const validateVerificationCode = [
  body('email').isEmail().normalizeEmail(),
  body('code').isString().isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  validate
];

export const validateAdminLogin = [
  body('username').isString().trim().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  validate
];

// Product validation
export const validateProduct = [
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('price').isString().trim().notEmpty().withMessage('Price is required'),
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  validate
];

export const validateProductId = [
  param('id').isUUID().withMessage('Invalid product ID'),
  validate
];

// Review validation
export const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().trim(),
  body('userName').optional().isString().trim(),
  validate
];

export const validateReviewId = [
  param('id').isUUID().withMessage('Invalid review ID'),
  validate
];
