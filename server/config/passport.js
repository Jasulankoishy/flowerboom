import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';

// Local Strategy (Email + Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Найти пользователя по email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: 'Неверный email или пароль' });
        }

        // Проверить что пользователь не зашёл через Google
        if (!user.password) {
          return done(null, false, {
            message: 'Этот аккаунт создан через Google. Войдите через Google.',
          });
        }

        // Проверить пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Неверный email или пароль' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === 'production'
          ? `${process.env.BACKEND_URL}/api/auth/google/callback`
          : 'http://localhost:3003/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('Email не найден в Google профиле'));
        }

        // Найти пользователя по googleId
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (user) {
          return done(null, user);
        }

        // Найти пользователя по email
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Привязать googleId к существующему аккаунту
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              name: name || user.name,
              avatar: avatar || user.avatar,
            },
          });
          return done(null, user);
        }

        // Создать нового пользователя
        user = await prisma.user.create({
          data: {
            email,
            googleId,
            name,
            avatar,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Сериализация пользователя (для сессий)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Десериализация пользователя
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
