# 🚀 Инструкция по запуску Flowerboom

## Быстрый старт (5 минут)

### 1. Клонировать репозиторий
```bash
git clone https://github.com/ваш-username/flowerboom.git
cd flowerboom
```

### 2. Установить зависимости
```bash
npm install
```

### 3. Настроить .env файл
Скопируй `.env.example` в `.env`:
```bash
cp .env.example .env
```

Открой `.env` и **обязательно измени**:

```env
# JWT Secrets (КРИТИЧНО!)
# Сгенерируй новые ключи командой:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=твой_случайный_ключ_64_символа
JWT_REFRESH_SECRET=твой_другой_случайный_ключ_64_символа

# Пароль админа (КРИТИЧНО!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=твой_сильный_пароль

# Resend API для email (опционально)
RESEND_API_KEY=re_твой_ключ_с_resend_com
EMAIL_FROM=noreply@твойдомен.com
```

**Генерация JWT секретов:**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Создать базу данных
```bash
cd server
npx prisma migrate dev
node prisma/seed.js
cd ..
```

### 5. Запустить проект

**Терминал 1 — Backend:**
```bash
npm run server
```
Сервер запустится на http://localhost:3003

**Терминал 2 — Frontend:**
```bash
npm run dev
```
Фронтенд запустится на http://localhost:5173

### 6. Готово! 🎉

Открой браузер:
- **Сайт:** http://localhost:5173
- **Админка:** http://localhost:5173/admin/login
  - Логин: `admin`
  - Пароль: тот что указал в `.env`

---

## 📋 Чеклист перед запуском

- [ ] `npm install` выполнен
- [ ] `.env` файл создан из `.env.example`
- [ ] JWT секреты сгенерированы (64 символа hex)
- [ ] Пароль админа изменён
- [ ] База данных создана (`npx prisma migrate dev`)
- [ ] Seed выполнен (`node prisma/seed.js`)
- [ ] Backend запущен (порт 3003)
- [ ] Frontend запущен (порт 5173)

---

## 🔧 Команды

### Development
```bash
npm run dev          # Запустить Vite dev server (frontend)
npm run server       # Запустить Express server (backend)
```

### Database
```bash
cd server
npx prisma migrate dev    # Применить миграции
npx prisma studio         # Открыть GUI для БД
node prisma/seed.js       # Заполнить тестовыми данными
npx prisma migrate reset  # Сбросить БД (удалит все данные!)
```

### Build
```bash
npm run build        # Собрать production
npm run preview      # Просмотр production build
```

---

## ⚠️ Частые проблемы

### Порт 3003 занят
```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3003 | xargs kill -9
```

### Ошибка Prisma
```bash
cd server
npx prisma generate
npx prisma migrate reset
node prisma/seed.js
```

### Ошибка CORS
Проверь `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

### Email не отправляются
В dev режиме коды выводятся в консоль сервера:
```
[AUTH] Verification code for user@example.com: 123456
```

Для production настрой Resend API:
1. Зарегистрируйся на https://resend.com
2. Получи API ключ
3. Добавь в `.env`: `RESEND_API_KEY=re_...`

---

## 🗄️ Структура БД

После seed в базе будет:

**Админ:**
- Username: `admin`
- Password: из `.env`

**Товары (3 шт):**
1. Букет роз "Романтика" - 2990₽
2. Букет тюльпанов "Весна" - 2490₽
3. Букет пионов "Нежность" - 3990₽

---

## 🔐 Безопасность

### Перед деплоем на production:

- [ ] Изменить `JWT_SECRET` и `JWT_REFRESH_SECRET`
- [ ] Изменить `ADMIN_PASSWORD`
- [ ] Получить новый `RESEND_API_KEY`
- [ ] Обновить `FRONTEND_URL` на production домен
- [ ] Обновить `VITE_API_URL` на production API
- [ ] Установить `NODE_ENV=production`
- [ ] Проверить что `.env` не в Git (`git status`)
- [ ] Включить HTTPS (Vercel/Railway делают автоматически)

---

## 📚 Документация

- `README.md` — основная документация
- `OBSIDIAN-DOCS.md` — полная документация для Obsidian
- `SECURITY-FIXES.md` — исправления безопасности
- `.env.example` — шаблон переменных окружения

---

## 🆘 Помощь

Если что-то не работает:

1. Проверь что все команды выполнены по порядку
2. Проверь `.env` файл (все ли заполнено)
3. Проверь консоль сервера на ошибки
4. Проверь консоль браузера на ошибки
5. Попробуй `npx prisma migrate reset` и `node prisma/seed.js`

---

**Дата:** 22 апреля 2026  
**Версия:** 2.2.0  
**Статус:** Production-ready (95%)
