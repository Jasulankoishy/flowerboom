import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendVerificationCode } from '../utils/email.js';

// Register with email + password
export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isAdmin: false
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Регистрация успешна',
      accessToken,
      refreshToken,
      isNewUser: !user.name, // true если имя не заполнено
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Ошибка регистрации' });
  }
};

// Login with email + password
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Check if user registered via Google
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Этот аккаунт создан через Google. Войдите через Google.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isAdmin: false
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Вход выполнен',
      accessToken,
      refreshToken,
      isNewUser: !user.name, // true если имя не заполнено
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Ошибка входа' });
  }
};

// Forgot password - send reset code
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user (but don't reveal if user exists for security)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete old codes for this email
      await prisma.verificationCode.deleteMany({
        where: { email },
      });

      // Store new code
      await prisma.verificationCode.create({
        data: { email, code, expiresAt },
      });

      // Send email
      if (process.env.RESEND_API_KEY) {
        try {
          await sendVerificationCode(email, code);
        } catch (emailError) {
          console.error('Email send error:', emailError);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`\n📧 Password reset code for ${email}: ${code}\n`);
          }
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`\n📧 Password reset code for ${email}: ${code}\n`);
        }
      }
    }

    // Always return success (security best practice)
    res.json({
      success: true,
      message: 'Если аккаунт существует, код отправлен на email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Ошибка отправки кода' });
  }
};

// Reset password with code
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Find verification code
    const stored = await prisma.verificationCode.findFirst({
      where: { email, code },
    });

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'Неверный код или код истёк'
      });
    }

    if (new Date() > stored.expiresAt) {
      await prisma.verificationCode.delete({ where: { id: stored.id } });
      return res.status(400).json({
        success: false,
        message: 'Код истёк'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used code
    await prisma.verificationCode.delete({ where: { id: stored.id } });

    res.json({
      success: true,
      message: 'Пароль успешно обновлён',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сброса пароля' });
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

// Set user name
export const setName = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Имя должно содержать минимум 2 символа'
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Имя слишком длинное (максимум 50 символов)'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name: name.trim() }
    });

    res.json({
      success: true,
      message: 'Имя успешно сохранено',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Set name error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сохранения имени' });
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
