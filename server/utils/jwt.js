import jwt from 'jsonwebtoken';

const getSecret = (name, fallback) => {
  const value = process.env[name];

  if (process.env.NODE_ENV === 'production') {
    if (!value || value.length < 32 || value.includes('change-in-production') || value.startsWith('your-')) {
      throw new Error(`${name} must be set to a strong secret in production`);
    }
  }

  return value || fallback;
};

const JWT_SECRET = getSecret('JWT_SECRET', 'development-only-access-secret-change-me');
const JWT_REFRESH_SECRET = getSecret('JWT_REFRESH_SECRET', 'development-only-refresh-secret-change-me');

// Generate access token (7 days for e-commerce)
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Generate refresh token (7 days)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'] // Explicitly specify algorithm
    });
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256'] // Explicitly specify algorithm
    });
  } catch (error) {
    return null;
  }
};
