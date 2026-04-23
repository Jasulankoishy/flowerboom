# 🔐 Новая система авторизации Flowerboom

**Дата:** 23 апреля 2026  
**Статус:** ✅ Готово к использованию

---

## 📋 Что было сделано

Добавлены два способа авторизации:
1. **Email + Пароль** — классическая регистрация
2. **Google OAuth 2.0** — вход через Google аккаунт

Старая система с одноразовыми кодами на email **удалена**.

---

## 🎯 Что работает

### Бэкенд (✅ Готово)

**Новые endpoints:**
- `POST /api/auth/register` — регистрация (email + password)
- `POST /api/auth/login` — вход (email + password)
- `POST /api/auth/forgot-password` — восстановление пароля (отправка кода)
- `POST /api/auth/reset-password` — сброс пароля (код + новый пароль)
- `GET /api/auth/google` — редирект на Google OAuth
- `GET /api/auth/google/callback` — callback после Google авторизации

**Passport.js стратегии:**
- ✅ LocalStrategy (email + password)
- ✅ GoogleStrategy (OAuth 2.0)

**База данных:**
- ✅ Поля `password` и `googleId` добавлены в модель `User`
- ✅ Миграция выполнена

**Валидация:**
- Email: правильный формат
- Пароль: минимум 8 символов + хотя бы 1 цифра
- Код восстановления: 6 цифр

### Фронтенд (✅ Готово)

**Страницы:**
- ✅ `/auth` — AuthPage с 4 режимами (вход, регистрация, забыли пароль, сброс пароля)
- ✅ `/auth/callback` — AuthCallbackPage для Google OAuth редиректа

**API модуль:**
- ✅ `authApi.register()` — регистрация
- ✅ `authApi.login()` — вход
- ✅ `authApi.forgotPassword()` — отправка кода
- ✅ `authApi.resetPassword()` — сброс пароля
- ✅ `authApi.loginWithGoogle()` — редирект на Google

**Zustand store:**
- ✅ Поля `name`, `avatar`, `googleId` добавлены в тип `User`
- ✅ Persist работает (токены сохраняются в localStorage)

---

## 🔧 Переменные окружения

В `.env` файле:

```env
# Google OAuth
GOOGLE_CLIENT_ID=299179772191-vd7v65vgn442tb8lvn38cpddo8ndqgbe.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Backend URL (для OAuth callbacks)
BACKEND_URL=http://localhost:3003

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Важно:** Опечатки `OUAUTH_GOOGLE_CLENT_SECRET` и `OUAITH_GOOGLE_CLIENT_ID` исправлены на правильные имена.

---

## 🚀 Как использовать

### 1. Регистрация через Email

**Фронтенд:**
```typescript
const response = await authApi.register(email, password);
login(response.accessToken, response.refreshToken, response.user);
```

**Бэкенд:**
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Ответ:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### 2. Вход через Email

**Фронтенд:**
```typescript
const response = await authApi.login(email, password);
login(response.accessToken, response.refreshToken, response.user);
```

**Бэкенд:**
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

### 3. Вход через Google

**Фронтенд:**
```typescript
authApi.loginWithGoogle(); // Редирект на Google
```

**Флоу:**
1. Пользователь нажимает "Войти через Google"
2. Редирект на `http://localhost:3003/api/auth/google`
3. Google OAuth страница
4. После успеха → редирект на `http://localhost:3003/api/auth/google/callback`
5. Бэкенд создаёт JWT токены
6. Редирект на `http://localhost:5173/auth/callback?token=...&refreshToken=...`
7. Фронтенд сохраняет токены в localStorage
8. Редирект на главную `/`

---

### 4. Восстановление пароля

**Шаг 1 — Отправить код:**
```typescript
await authApi.forgotPassword(email);
// Код придёт на email (или в консоль сервера в dev режиме)
```

**Шаг 2 — Сбросить пароль:**
```typescript
await authApi.resetPassword(email, code, newPassword);
```

**Бэкенд:**
```bash
# Шаг 1
curl -X POST http://localhost:3003/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Шаг 2
curl -X POST http://localhost:3003/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456","newPassword":"newpass123"}'
```

---

## 🔒 Безопасность

**Пароли:**
- Хэшируются через bcrypt (10 rounds)
- Минимум 8 символов + 1 цифра

**JWT токены:**
- Access token: 7 дней
- Refresh token: 7 дней

**Rate limiting:**
- Auth endpoints: 5 запросов / 15 минут

**Валидация:**
- Express-validator на всех endpoints
- XSS защита через `xss` пакет

**Google OAuth:**
- Использует официальную стратегию `passport-google-oauth20`
- Scopes: `profile`, `email`

---

## 📊 Структура БД

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String?  // bcrypt hash, null если через Google
  googleId     String?  @unique // null если через email
  name         String?  // имя из Google профиля
  avatar       String?  // фото из Google профиля
  orders       Order[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## 🧪 Тестирование

### Запуск проекта

**Терминал 1 — Backend:**
```bash
cd "C:\Users\User\OneDrive\Pictures\Desktop\сайт цветы"
npm run server
```

**Терминал 2 — Frontend:**
```bash
cd "C:\Users\User\OneDrive\Pictures\Desktop\сайт цветы"
npm run dev
```

### Проверка endpoints

```bash
# 1. Регистрация
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'

# 2. Вход
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'

# 3. Google OAuth (открыть в браузере)
http://localhost:3003/api/auth/google

# 4. Восстановление пароля
curl -X POST http://localhost:3003/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 5. Сброс пароля (код из консоли сервера)
curl -X POST http://localhost:3003/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456","newPassword":"newpass123"}'
```

---

## 🎨 UI/UX

**AuthPage имеет 4 режима:**

1. **Вход** (по умолчанию)
   - Email + Пароль
   - Кнопка "Войти через Google"
   - Ссылка "Забыли пароль?"
   - Ссылка "Зарегистрироваться"

2. **Регистрация**
   - Email + Пароль + Подтверждение пароля
   - Кнопка "Войти через Google"
   - Ссылка "Уже есть аккаунт?"

3. **Забыли пароль**
   - Email
   - Кнопка "Отправить код"
   - После отправки → автоматически режим 4

4. **Сброс пароля**
   - Код (6 цифр)
   - Новый пароль + Подтверждение
   - После успеха → режим 1 + сообщение "Пароль обновлён"

---

## ✅ Чеклист готовности

**Бэкенд:**
- [x] Passport.js установлен и настроен
- [x] LocalStrategy работает
- [x] GoogleStrategy работает
- [x] Endpoints созданы и протестированы
- [x] Валидация работает
- [x] Миграция БД выполнена
- [x] Переменные окружения исправлены

**Фронтенд:**
- [x] AuthPage создана (4 режима)
- [x] AuthCallbackPage создана
- [x] API модуль обновлён
- [x] Роуты добавлены в App.tsx
- [x] authStore обновлён (name, avatar, googleId)
- [x] Persist работает

**Конфигурация:**
- [x] .env файл обновлён (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL)
- [x] render.yaml обновлён (добавлены Google OAuth переменные)

---

## 🐛 Известные проблемы

**Нет проблем!** Всё работает.

---

## 📝 Что удалено

**Старые endpoints (больше не работают):**
- ~~POST /api/auth/send-code~~
- ~~POST /api/auth/verify-code~~

**Старые файлы:**
- Код для отправки одноразовых кодов удалён из контроллеров

---

## 🔄 Миграция существующих пользователей

Если в БД уже есть пользователи без поля `password`:
1. Они могут войти через Google (если email совпадает)
2. При первом входе через Google — `googleId` привяжется к аккаунту
3. Если хотят использовать email/password — нужно использовать "Забыли пароль?" для установки пароля

---

## 📚 Документация

- `OBSIDIAN-DOCS.md` — полная документация проекта
- `SETUP.md` — инструкция по запуску
- `AUTH-IMPLEMENTATION.md` — этот файл

---

**Автор:** Claude Code  
**Дата:** 23 апреля 2026  
**Версия:** 2.4.0
