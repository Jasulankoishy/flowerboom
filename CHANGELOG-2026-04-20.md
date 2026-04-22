# Changelog - 20 апреля 2026

## Проблема
Сайт цветов не работал правильно - localhost давал неправильные ссылки, фронтенд и бэкенд не были связаны.

## Что исправили

### 1. Убрали хардкод localhost
**Проблема:** В коде были захардкожены URL `http://localhost:3003`

**Исправлено:**
- `server/index.js` - добавили переменные `HOST` и `PORT` из `.env`
- `src/AdminPanel.tsx` - использует `VITE_API_URL` из `.env`
- `src/AdminLogin.tsx` - использует `VITE_API_URL` из `.env`
- `src/Auth.tsx` и `src/Reviews.tsx` - уже были правильно настроены

### 2. Добавили dotenv в сервер
**Проблема:** Сервер не загружал `.env` файл

**Исправлено:**
```js
import dotenv from 'dotenv';
dotenv.config();
```

### 3. Изменили порты (конфликт портов)
**Проблема:** Порты 3000-3003 были заняты другими процессами

**Новые порты:**
- Frontend (Vite): `5173` (стандартный для Vite)
- Backend API: `4000`

### 4. Исправили API endpoints
**Проблема:** В `AdminPanel.tsx` был неправильный API URL

**Исправлено:**
- Изменили `API_URL` с `"http://localhost:3003/api"` на переменную окружения `VITE_API_URL`
- Все fetch запросы используют правильные пути:
  - `${API_URL}/api/products`
  - `${API_URL}/api/products/${id}`
  - `${API_URL}/api/admin/login`

### 5. Создали .env файл
```env
# Server configuration
PORT=4000
HOST=0.0.0.0

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Email configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=

# API URL for frontend
VITE_API_URL=http://localhost:4000
```

## Как запускать проект

### Терминал 1 - Backend API
```bash
cd "C:\Users\User\OneDrive\Pictures\Desktop\сайт цветы"
npm run server
```
Должно показать: `Server running on http://0.0.0.0:4000`

### Терминал 2 - Frontend (Vite)
```bash
cd "C:\Users\User\OneDrive\Pictures\Desktop\сайт цветы"
npm run dev
```
Должно показать: `http://localhost:5173/`

### Открыть в браузере
- Главная страница: `http://localhost:5173/`
- Админка: `http://localhost:5173/admin.html`
- Backend API: `http://localhost:4000/api/products`

## Важно помнить
- После изменения `.env` нужно **перезапустить оба сервера**
- Vite не подхватывает изменения `.env` на лету
- Если порт занят (Windows), используй `netstat -ano | findstr :PORT` и `taskkill /PID XXX /F`

## Структура проекта
```
сайт цветы/
├── server/
│   ├── index.js          # Backend API (Express)
│   ├── data/             # JSON файлы с данными
│   └── uploads/          # Загруженные изображения
├── src/
│   ├── main.tsx          # Главная страница
│   ├── admin.tsx         # Админка entry point
│   ├── AdminPanel.tsx    # Админ панель
│   ├── AdminLogin.tsx    # Логин админа
│   ├── Auth.tsx          # Авторизация пользователей
│   └── Reviews.tsx       # Отзывы
├── .env                  # Переменные окружения (НЕ коммитить!)
├── .env.example          # Пример .env
└── package.json          # Зависимости и скрипты
```

## Тестовые данные
- Админ логин: `admin`
- Админ пароль: `admin123`
