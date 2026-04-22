import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Data file paths
const dataDir = path.join(__dirname, 'data');
const productsFile = path.join(dataDir, 'products.json');
const reviewsFile = path.join(dataDir, 'reviews.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from files
const loadData = (filePath, defaultData) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return defaultData;
};

// Save data to file
const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// In-memory database (replace with MongoDB in production)
let products = loadData(productsFile, [
  {
    id: "1",
    index: "01",
    title: "Vintage Sahara",
    image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?q=80&w=800&auto=format&fit=crop",
    price: "4500",
    description: "Элегантный букет в винтажном стиле"
  },
  {
    id: "2",
    index: "02",
    title: "Amber Peony",
    image: "https://images.unsplash.com/photo-1591880482226-259779357021?q=80&w=800&auto=format&fit=crop",
    price: "5200",
    description: "Роскошные пионы янтарного оттенка"
  },
  {
    id: "3",
    index: "03",
    title: "Golden Hour",
    image: "https://images.unsplash.com/photo-1522673607200-164848371868?q=80&w=800&auto=format&fit=crop",
    price: "3800",
    description: "Букет золотого заката"
  }
]);

let nextId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;

// Store reviews (in production, use a database)
let reviews = loadData(reviewsFile, []);

// Admin credentials (TODO: Move to environment variables and use proper hashing)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Routes

// Send verification code
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store code with 10 minute expiration
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  // If email is not configured, just log the code (for development)
  if (!process.env.EMAIL_USER) {
    console.log(`\n📧 Verification code for ${email}: ${code}\n`);
    return res.json({
      success: true,
      message: 'Code sent (check server console)',
      devMode: true
    });
  }

  // Send email
  try {
    await transporter.sendMail({
      from: `"Flowerboom" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Ваш код подтверждения - Flowerboom',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4af37; text-align: center;">Flowerboom</h1>
          <p style="font-size: 16px; color: #333;">Ваш код подтверждения:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d4af37; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #666;">Код действителен в течение 10 минут.</p>
          <p style="font-size: 14px; color: #666;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2026 Flowerboom Design System</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Code sent to email' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// Verify code
app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.status(400).json({ success: false, message: 'Code not found or expired' });
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({ success: false, message: 'Code expired' });
  }

  if (stored.code !== code) {
    return res.status(400).json({ success: false, message: 'Invalid code' });
  }

  // Code is valid, remove it
  verificationCodes.delete(email);

  res.json({
    success: true,
    message: 'Verification successful',
    token: 'user-token-' + Date.now()
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Create product
app.post('/api/products', upload.single('image'), (req, res) => {
  const { title, price, description } = req.body;

  const newProduct = {
    id: String(nextId++),
    index: String(nextId - 1).padStart(2, '0'),
    title,
    price,
    description,
    image: req.file ? `http://${HOST}:${PORT}/uploads/${req.file.filename}` : req.body.imageUrl || ''
  };

  products.push(newProduct);
  saveData(productsFile, products);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const { title, price, description } = req.body;
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updatedProduct = {
    ...products[productIndex],
    title: title || products[productIndex].title,
    price: price || products[productIndex].price,
    description: description || products[productIndex].description,
  };

  if (req.file) {
    updatedProduct.image = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl) {
    updatedProduct.image = req.body.imageUrl;
  }

  products[productIndex] = updatedProduct;
  saveData(productsFile, products);
  res.json(updatedProduct);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(productIndex, 1);
  saveData(productsFile, products);
  res.json({ message: 'Product deleted successfully' });
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.json({
    url: `http://${HOST}:${PORT}/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Get reviews for a product
app.get('/api/products/:id/reviews', (req, res) => {
  const productReviews = reviews.filter(r => r.productId === req.params.id);
  res.json(productReviews);
});

// Add review
app.post('/api/products/:id/reviews', (req, res) => {
  const { rating, comment, userName } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const newReview = {
    id: Date.now().toString(),
    productId: req.params.id,
    rating: Number(rating),
    comment: comment || '',
    userName: userName || 'Аноним',
    date: new Date().toISOString()
  };

  reviews.push(newReview);
  saveData(reviewsFile, reviews);
  res.status(201).json(newReview);
});

// Delete review
app.delete('/api/reviews/:id', (req, res) => {
  const reviewIndex = reviews.findIndex(r => r.id === req.params.id);

  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }

  reviews.splice(reviewIndex, 1);
  saveData(reviewsFile, reviews);
  res.json({ message: 'Review deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
