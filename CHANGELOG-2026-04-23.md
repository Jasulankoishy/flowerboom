# 🆕 Обновления от 23 апреля 2026

## Что было добавлено сегодня

### 1. ✅ Новая система авторизации

**Удалено:**
- ❌ Старая система с одноразовыми кодами на email

**Добавлено:**
- ✅ **Email + Пароль** — классическая регистрация
- ✅ **Google OAuth 2.0** — вход через Google аккаунт
- ✅ **Восстановление пароля** — отправка кода на email

**Технические детали:**
- Passport.js с LocalStrategy и GoogleStrategy
- JWT токены (7 дней)
- Bcrypt для паролей (10 rounds)
- Валидация: минимум 8 символов + 1 цифра

**Новые endpoints:**
```
POST /api/auth/register        - Регистрация
POST /api/auth/login           - Вход
POST /api/auth/forgot-password - Восстановление пароля
POST /api/auth/reset-password  - Сброс пароля
GET  /api/auth/google          - Google OAuth
GET  /api/auth/google/callback - Google callback
```

**Новые файлы:**
- `server/config/passport.js` — конфигурация Passport.js
- `src/pages/AuthPage.tsx` — страница авторизации (4 режима)
- `src/pages/AuthCallbackPage.tsx` — Google OAuth callback
- `AUTH-IMPLEMENTATION.md` — полная документация

**База данных:**
```prisma
model User {
  password  String?  // bcrypt hash, null если через Google
  googleId  String?  @unique
  name      String?  // из Google профиля
  avatar    String?  // из Google профиля
}
```

---

### 2. ✅ Тёмная/светлая тема

**Функционал:**
- 🌙 Кнопка Луна/Солнце в шапке сайта
- 🎨 Тёмная тема: серый фон + розовые акценты
- ☀️ Светлая тема: оригинальный дизайн + голубые акценты
- 💾 Сохранение выбора в localStorage
- ✨ Плавные переходы (500ms)

**Технические детали:**
- Zustand store с persist
- Применяется ко всем компонентам
- Анимация иконки при наведении

**Новые файлы:**
- `src/stores/themeStore.ts` — store для темы

**Обновлённые компоненты:**
- `Header.tsx` — добавлена кнопка переключения
- `HomePage.tsx` — применение темы к фону
- `ProductCard.tsx` — адаптивные цвета
- `HeroSection.tsx` — адаптивные цвета

---

### 3. ✅ Base64 хранение фото

**Удалено:**
- ❌ Cloudinary (внешний сервис)
- ❌ Зависимость `cloudinary`
- ❌ Переменные `CLOUDINARY_*`

**Добавлено:**
- ✅ Base64 конвертация на сервере
- ✅ Хранение в SQLite (поле `image`)
- ✅ Лимит 2MB (было 5MB)

**Преимущества:**
- Никаких внешних сервисов
- Никаких API ключей
- Работает сразу на Render
- Фото никогда не потеряются
- Идеально для ~50 товаров

**Технические детали:**
```javascript
// Сервер конвертирует в base64
const base64 = req.file.buffer.toString('base64');
const dataUrl = `data:${mimeType};base64,${base64}`;

// Сохраняется в SQLite
image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

**Обновлённые файлы:**
- `server/middleware/upload.js` — memoryStorage
- `server/controllers/productsController.js` — base64 конвертация
- `src/components/ImageUpload.tsx` — поддержка base64

---

### 4. ✅ Исправления и улучшения

**Исправлено:**
- ✅ Seed скрипт больше не запускается при каждом деплое
- ✅ Товары не возвращаются после удаления
- ✅ Удалены неиспользуемые переменные из render.yaml
- ✅ Синтаксические ошибки в productsController.js

**Оптимизация:**
- Удалена зависимость `cloudinary` (-1 пакет)
- Очищен render.yaml от старых переменных
- Упрощена загрузка фото

---

## 📊 Статистика изменений

**Коммиты сегодня:** 8
- `b5b2b30` — Email/Password + Google OAuth
- `01a87f6` — Google OAuth опциональный
- `d220053` — Тёмная тема для AuthPage
- `701adf5` — Переключатель темы
- `5933218` — Base64 хранение фото
- `01f07ca` — Исправление синтаксиса
- `b8e2f46` — Удаление seed из деплоя
- `[текущий]` — Обновление документации

**Файлов изменено:** 30+
**Строк добавлено:** ~2000
**Строк удалено:** ~500

---

## 🔐 Переменные окружения (обновлено)

### Локальная разработка (.env)

```env
# Server
PORT=3003
HOST=0.0.0.0
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Backend URL (для OAuth)
BACKEND_URL=http://localhost:3003

# JWT Secrets
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password

# Google OAuth (новое!)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# API URL
VITE_API_URL=http://localhost:3003
```

### Production (Render)

**Обязательные:**
- `ADMIN_PASSWORD` — пароль админа
- `GOOGLE_CLIENT_ID` — для Google OAuth
- `GOOGLE_CLIENT_SECRET` — для Google OAuth
- `BACKEND_URL` — URL backend сервиса
- `FRONTEND_URL` — URL frontend сервиса
- `RESEND_API_KEY` — для отправки email

**Удалены:**
- ~~`CLOUDINARY_CLOUD_NAME`~~
- ~~`CLOUDINARY_API_KEY`~~
- ~~`CLOUDINARY_API_SECRET`~~

---

## 🚀 Как использовать новые функции

### Авторизация

**Email + Пароль:**
1. Открой `/auth`
2. Переключись на "Регистрация"
3. Введи email и пароль (мин 8 символов, 1 цифра)
4. Готово!

**Google OAuth:**
1. Открой `/auth`
2. Нажми "Войти через Google"
3. Выбери аккаунт Google
4. Готово!

**Восстановление пароля:**
1. Открой `/auth`
2. Нажми "Забыли пароль?"
3. Введи email
4. Получи код на email
5. Введи код + новый пароль

### Тёмная тема

1. Открой главную страницу
2. В правом верхнем углу нажми кнопку 🌙
3. Сайт станет тёмным
4. Кнопка изменится на ☀️
5. Нажми снова — вернётся светлая тема

### Загрузка фото (админка)

1. Зайди в админку
2. Создай/редактируй товар
3. Нажми на область загрузки фото
4. Выбери фото (макс 2MB, JPG/PNG/WEBP)
5. Фото автоматически конвертируется в base64
6. Сохрани товар

---

## 📝 Changelog

### v2.5.0 (2026-04-23) — Новая авторизация + Тёмная тема + Base64

**Добавлено:**
- ✅ Email + Пароль авторизация
- ✅ Google OAuth 2.0
- ✅ Восстановление пароля
- ✅ Тёмная/светлая тема с переключателем
- ✅ Base64 хранение фото в SQLite
- ✅ Passport.js интеграция
- ✅ AuthPage с 4 режимами
- ✅ AuthCallbackPage для Google
- ✅ ThemeStore с persist

**Удалено:**
- ❌ Старая система с одноразовыми кодами
- ❌ Cloudinary зависимость
- ❌ Seed из buildCommand

**Исправлено:**
- ✅ Товары не возвращаются после удаления
- ✅ Синтаксические ошибки
- ✅ Очищен render.yaml

**Документация:**
- ✅ AUTH-IMPLEMENTATION.md
- ✅ Обновлён OBSIDIAN-DOCS.md
- ✅ Обновлён .env.example

---

## 🎯 Текущий статус проекта

**Готовность:** 95% production-ready

**Что работает:**
- ✅ Email + Пароль авторизация
- ✅ Google OAuth 2.0
- ✅ Восстановление пароля
- ✅ Тёмная/светлая тема
- ✅ Base64 фото в SQLite
- ✅ CRUD товаров
- ✅ Система отзывов
- ✅ API заказов
- ✅ Корзина
- ✅ Админ-панель
- ✅ JWT авторизация (7 дней)
- ✅ Rate limiting
- ✅ Безопасность (bcrypt, helmet, валидация)

**Что осталось (5%):**
- [ ] Страница `/checkout` — форма оформления заказа
- [ ] Страница `/profile/orders` — история заказов
- [ ] Админка: вкладка "Заказы"
- [ ] Toast уведомления
- [ ] Error Boundaries

---

**Дата:** 23 апреля 2026  
**Версия:** 2.5.0  
**Статус:** 95% production-ready
