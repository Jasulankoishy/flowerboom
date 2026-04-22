import multer from 'multer';
import path from 'path';

// Use memory storage for Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = /jpeg|jpg|png|webp/;

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения: JPG, PNG, WEBP'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
