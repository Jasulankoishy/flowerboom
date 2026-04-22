import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendVerificationCode } from '../utils/email.js';

// Send verification code
export const sendCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email }
    });

    // Store new code
    await prisma.verificationCode.create({
      data: { email, code, expiresAt }
    });

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await sendVerificationCode(email, code);
        return res.json({
          success: true,
          message: 'Код отправлен на email'
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Fallback to console log if email fails
        console.log(`\n📧 Verification code for ${email}: ${code}\n`);
        return res.json({
          success: true,
          message: 'Код отправлен (проверьте консоль сервера)',
          devMode: true
        });
      }
    }

    // If Resend is not configured, log to console (dev mode)
    console.log(`\n📧 Verification code for ${email}: ${code}\n`);
    return res.json({
      success: true,
      message: 'Код отправлен (проверьте консоль сервера)',
      devMode: true
    });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ success: false, message: 'Failed to send code' });
  }
};

// Verify code
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const stored = await prisma.verificationCode.findFirst({
      where: { email, code }
    });

    if (!stored) {
      return res.status(400).json({ success: false, message: 'Code not found or expired' });
    }

    if (new Date() > stored.expiresAt) {
      await prisma.verificationCode.delete({ where: { id: stored.id } });
      return res.status(400).json({ success: false, message: 'Code expired' });
    }

    // Code is valid, create or get user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Delete used code
    await prisma.verificationCode.delete({ where: { id: stored.id } });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, isAdmin: false });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Verification successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify code' });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: admin.id, username: admin.username, isAdmin: true });
    const refreshToken = generateRefreshToken({ userId: admin.id, isAdmin: true });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: admin.id, username: admin.username, isAdmin: true }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }

  // Generate new access token
  const payload = decoded.isAdmin
    ? { userId: decoded.userId, isAdmin: true }
    : { userId: decoded.userId, isAdmin: false };

  const accessToken = generateAccessToken(payload);

  res.json({ success: true, accessToken });
};
