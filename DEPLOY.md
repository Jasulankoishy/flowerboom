# 🌐 Деплой Flowerboom в интернет

## Вариант 1: Vercel (Frontend) + Railway (Backend) — РЕКОМЕНДУЕТСЯ

### Шаг 1: Деплой Backend на Railway

1. **Зарегистрируйся на Railway**
   - Перейди на https://railway.app
   - Войди через GitHub

2. **Создай новый проект**
   - New Project → Deploy from GitHub repo
   - Выбери репозиторий `flowerboom`

3. **Настрой переменные окружения**
   
   В Railway Dashboard → Variables добавь:
   ```env
   NODE_ENV=production
   PORT=3003
   HOST=0.0.0.0
   
   # JWT Secrets (НОВЫЕ! Не используй старые из .env)
   JWT_SECRET=сгенерируй_новый_64_символа
   JWT_REFRESH_SECRET=сгенерируй_новый_64_символа
   
   # Admin (НОВЫЙ пароль!)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=новый_сильный_пароль
   
   # Resend API
   RESEND_API_KEY=re_твой_ключ
   EMAIL_FROM=noreply@твойдомен.com
   
   # Frontend URL (заполнишь после деплоя Vercel)
   FRONTEND_URL=https://твой-сайт.vercel.app
   ```

4. **Настрой команды запуска**
   
   Railway автоматически определит `package.json`, но проверь:
   - **Build Command:** `npm install && cd server && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm run server`

5. **Добавь домен**
   - Settings → Generate Domain
   - Скопируй URL (например: `flowerboom-production.up.railway.app`)

6. **Инициализируй базу данных**
   
   После первого деплоя выполни seed через Railway CLI:
   ```bash
   railway login
   railway link
   railway run node server/prisma/seed.js
   ```

---

### Шаг 2: Деплой Frontend на Vercel

1. **Зарегистрируйся на Vercel**
   - Перейди на https://vercel.com
   - Войди через GitHub

2. **Импортируй проект**
   - New Project → Import Git Repository
   - Выбери `flowerboom`

3. **Настрой переменные окружения**
   
   В Vercel → Settings → Environment Variables добавь:
   ```env
   VITE_API_URL=https://твой-backend.up.railway.app
   ```
   
   Используй URL из Railway (Шаг 1.5)

4. **Настрой Build Settings**
   
   Vercel автоматически определит Vite, но проверь:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Deploy**
   - Нажми Deploy
   - Дождись завершения (2-3 минуты)
   - Скопируй URL (например: `flowerboom.vercel.app`)

6. **Обновi FRONTEND_URL в Railway**
   - Вернись в Railway → Variables
   - Обнови `FRONTEND_URL=https://flowerboom.vercel.app`
   - Railway автоматически перезапустится

---

### Шаг 3: Проверка

1. Открой `https://твой-сайт.vercel.app`
2. Проверь что товары загружаются
3. Попробуй войти в админку: `/admin/login`
4. Проверь создание заказа

---

## Вариант 2: Render (всё в одном)

### Шаг 1: Подготовь проект

Создай файл `render.yaml` в корне проекта:

```yaml
services:
  # Backend
  - type: web
    name: flowerboom-api
    env: node
    buildCommand: npm install && cd server && npx prisma generate && npx prisma migrate deploy
    startCommand: npm run server
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3003
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_PASSWORD
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: EMAIL_FROM
        value: noreply@yourdomain.com
      - key: FRONTEND_URL
        value: https://flowerboom.onrender.com

  # Frontend
  - type: web
    name: flowerboom-web
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://flowerboom-api.onrender.com
```

### Шаг 2: Деплой на Render

1. Зарегистрируйся на https://render.com
2. New → Blueprint
3. Подключи GitHub репозиторий
4. Render автоматически прочитает `render.yaml`
5. Заполни секретные переменные (пароли, API ключи)
6. Deploy

---

## ⚠️ Важно для Production

### 1. Обнови package.json

Добавь скрипт для production:

```json
{
  "scripts": {
    "server": "node server/index.js",
    "server:prod": "NODE_ENV=production node server/index.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2. Создай .env.production (НЕ коммить!)

```env
NODE_ENV=production
FRONTEND_URL=https://твой-сайт.vercel.app
VITE_API_URL=https://твой-backend.railway.app
```

### 3. Обнови CORS в server/app.js

Уже настроено правильно:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 4. База данных для Production

**SQLite** работает на Railway/Render, но для production лучше **PostgreSQL**.

Если хочешь PostgreSQL:
1. Railway → Add PostgreSQL
2. Обнови `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Railway автоматически добавит `DATABASE_URL`

---

## 🔐 Чеклист безопасности перед деплоем

- [ ] Новые JWT секреты (не из локального .env!)
- [ ] Новый пароль админа
- [ ] Resend API ключ настроен
- [ ] FRONTEND_URL указывает на Vercel
- [ ] VITE_API_URL указывает на Railway
- [ ] CORS настроен правильно
- [ ] HTTPS включён (автоматически на Vercel/Railway)
- [ ] `.env` НЕ в Git (проверь `git status`)

---

## 💰 Стоимость

**Vercel:**
- Hobby план: **БЕСПЛАТНО**
- 100GB bandwidth/месяц
- Автоматический HTTPS

**Railway:**
- $5 кредитов бесплатно
- Потом ~$5-10/месяц
- Автоматический HTTPS

**Render:**
- Free tier: **БЕСПЛАТНО**
- Засыпает после 15 минут неактивности
- Автоматический HTTPS

---

## 🆘 Частые проблемы

### CORS ошибка
Проверь что `FRONTEND_URL` в Railway совпадает с доменом Vercel

### 500 Internal Server Error
Проверь логи в Railway Dashboard → Deployments → Logs

### База данных пустая
Выполни seed:
```bash
railway run node server/prisma/seed.js
```

### Изображения не загружаются
На Railway/Render файловая система эфемерная. Нужно использовать:
- **Cloudinary** (бесплатно до 25GB)
- **AWS S3**
- **Vercel Blob Storage**

---

## 📚 Полезные ссылки

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Prisma Deploy: https://www.prisma.io/docs/guides/deployment

---

**Дата:** 22 апреля 2026  
**Автор:** Claude Code
