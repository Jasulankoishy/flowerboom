import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss';
import session from 'express-session';

// Import passport AFTER env vars are loaded
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import reviewsRoutes from './routes/reviews.js';
import uploadRoutes from './routes/upload.js';
import ordersRoutes from './routes/orders.js';
import showcaseRoutes from './routes/showcase.js';
import telegramRoutes from './routes/telegram.js';
import promoRoutes from './routes/promo.js';

const app = express();

// Hide Express server info
app.disable('x-powered-by');

// Security middleware with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3003"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// XSS protection - sanitize all string inputs
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      });
    };
    sanitize(req.body);
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api', reviewsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', ordersRoutes);
app.use('/api', showcaseRoutes);
app.use('/api', telegramRoutes);
app.use('/api', promoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler with Multer error handling
app.use((err, req, res, next) => {
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Файл слишком большой. Максимум 2MB' });
  }

  // Multer file type error
  if (
    err.message === 'Разрешены только изображения: JPG, PNG, WEBP' ||
    err.message === 'Только JPG, PNG, WEBP'
  ) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
