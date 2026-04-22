# 🚀 Деплой на Render (100% бесплатно)

## Шаг 1: Подготовка (уже сделано ✅)

- ✅ `render.yaml` создан
- ✅ `package.json` обновлён
- ✅ `.dockerignore` создан

## Шаг 2: Закоммить изменения в GitHub

```bash
git add .
git commit -m "Add Render deployment config"
git push
```

## Шаг 3: Деплой на Render

### 1. Зарегистрируйся на Render
- Перейди на https://render.com
- Нажми **Get Started for Free**
- Войди через **GitHub**

### 2. Создай новый Blueprint
- На главной странице нажми **New +**
- Выбери **Blueprint**
- Подключи свой GitHub аккаунт (если ещё не подключён)
- Выбери репозиторий `flowerboom`
- Render автоматически найдёт `render.yaml`

### 3. Настрой переменные окружения

Render попросит заполнить секретные переменные (те что с `sync: false`):

#### Для Backend (flowerboom-api):

**JWT_SECRET** и **JWT_REFRESH_SECRET** — сгенерируй новые:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Запусти команду 2 раза, получишь 2 разных ключа.

**ADMIN_PASSWORD** — придумай сильный пароль (мин. 12 символов)

**RESEND_API_KEY** — если есть ключ от Resend, вставь. Если нет — оставь пустым (коды будут в логах)

**FRONTEND_URL** — пока оставь пустым, заполнишь после деплоя фронтенда

#### Для Frontend (flowerboom-web):

**VITE_API_URL** — пока оставь пустым, заполнишь после деплоя бэкенда

### 4. Нажми Apply

Render начнёт деплой обоих сервисов одновременно:
- `flowerboom-api` (Backend)
- `flowerboom-web` (Frontend)

Это займёт 5-10 минут.

### 5. Получи URL сервисов

После успешного деплоя:

**Backend URL:**
```
https://flowerboom-api.onrender.com
```

**Frontend URL:**
```
https://flowerboom-web.onrender.com
```

### 6. Свяжи Backend и Frontend

#### Обнови переменные окружения:

**В flowerboom-api:**
- Зайди в Dashboard → flowerboom-api → Environment
- Найди `FRONTEND_URL`
- Вставь: `https://flowerboom-web.onrender.com`
- Нажми **Save Changes**
- Сервис автоматически перезапустится

**В flowerboom-web:**
- Зайди в Dashboard → flowerboom-web → Environment
- Найди `VITE_API_URL`
- Вставь: `https://flowerboom-api.onrender.com`
- Нажми **Save Changes**
- Сервис автоматически пересоберётся

### 7. Инициализируй базу данных

После первого деплоя нужно заполнить БД начальными данными:

- Зайди в Dashboard → flowerboom-api
- Перейди в **Shell** (вкладка справа)
- Выполни команду:
```bash
node server/prisma/seed.js
```

Должно вывести:
```
🌱 Seeding database...
✅ Admin created: admin
✅ Migrated 3 products
🎉 Seeding completed!
```

### 8. Готово! 🎉

Открой в браузере:
```
https://flowerboom-web.onrender.com
```

**Админка:**
```
https://flowerboom-web.onrender.com/admin/login
```
- Логин: `admin`
- Пароль: тот что указал в `ADMIN_PASSWORD`

---

## ⚠️ Важно знать про Free Tier

### Ограничения бесплатного плана:

1. **Сервис засыпает после 15 минут неактивности**
   - Первый запрос после сна будет медленным (~30 секунд)
   - Потом работает нормально

2. **750 часов/месяц на аккаунт**
   - У тебя 2 сервиса (backend + frontend)
   - Backend считается, frontend — нет (статика)
   - Хватит на 24/7 работу одного backend

3. **База данных SQLite**
   - Файл `dev.db` хранится на диске сервера
   - При перезапуске сервиса БД сохраняется
   - Но лучше делать бэкапы

### Как избежать засыпания (опционально):

Можно настроить ping каждые 10 минут через:
- **UptimeRobot** (бесплатно)
- **Cron-job.org** (бесплатно)

Но для тестового проекта это не обязательно.

---

## 🔧 Полезные команды

### Просмотр логов
Dashboard → flowerboom-api → Logs

### Перезапуск сервиса
Dashboard → flowerboom-api → Manual Deploy → Deploy latest commit

### Выполнить команду на сервере
Dashboard → flowerboom-api → Shell

### Скачать базу данных (бэкап)
```bash
# В Shell на Render
cat server/prisma/dev.db | base64
```
Скопируй вывод, сохрани локально, декодируй через `base64 -d`

---

## 🐛 Troubleshooting

### Backend не запускается
Проверь логи: Dashboard → flowerboom-api → Logs

Частые проблемы:
- Не заполнены переменные окружения
- Ошибка миграции Prisma
- Порт занят (должен быть 10000)

### Frontend показывает ошибки API
Проверь:
1. `VITE_API_URL` правильно указан
2. Backend запущен и доступен
3. CORS настроен (уже настроен в коде)

### База данных пустая
Выполни seed:
```bash
node server/prisma/seed.js
```

### 500 Internal Server Error
Проверь логи backend. Обычно это:
- Не заполнен JWT_SECRET
- Ошибка подключения к БД
- Ошибка в коде

---

## 📊 Мониторинг

### Проверка здоровья сервиса:
```
https://flowerboom-api.onrender.com/health
```

Должно вернуть:
```json
{
  "status": "ok",
  "timestamp": "2026-04-22T17:08:11.347Z"
}
```

---

## 🔄 Автоматический деплой

Render автоматически деплоит при каждом `git push` в main ветку:

1. Делаешь изменения локально
2. `git add .`
3. `git commit -m "Update"`
4. `git push`
5. Render автоматически деплоит (2-5 минут)

---

## 💰 Стоимость

**Сейчас:** 0₽ (бесплатно навсегда)

**Если захочешь убрать засыпание:**
- Paid план: $7/месяц за сервис
- Для 2 сервисов: $14/месяц

Но для учебного проекта бесплатного хватит!

---

## 📚 Полезные ссылки

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Prisma Deploy Guide: https://www.prisma.io/docs/guides/deployment

---

**Дата:** 22 апреля 2026  
**Автор:** Claude Code  
**Статус:** Готово к деплою ✅
