# Рефакторинг фронтенда - Новая архитектура

## ✅ Что было исправлено

### 1. **Разбили монолитный App.tsx (450 строк → ~70 строк)**

**Было:** Один огромный файл со всей логикой  
**Стало:** Модульная структура с отдельными компонентами

```
src/
├── components/          # UI компоненты
│   ├── Header.tsx       # Шапка сайта
│   ├── Footer.tsx       # Подвал
│   ├── HeroSection.tsx  # Hero секция
│   ├── ProductGrid.tsx  # Сетка товаров
│   ├── ProductCard.tsx  # Карточка товара
│   ├── SearchModal.tsx  # Модалка поиска
│   ├── CartModal.tsx    # Модалка корзины
│   └── index.ts         # Экспорты
```

### 2. **Централизованное управление состоянием (Zustand)**

**Было:** Проп-дриллинг через все компоненты  
**Стало:** 3 независимых стора

```typescript
// stores/authStore.ts
- isAuthenticated
- userToken
- isAdmin
- login(), logout(), loginAdmin()

// stores/cartStore.ts
- items[]
- addItem(), removeItem(), clearCart()
- getTotalItems()

// stores/productsStore.ts
- products[]
- loading, error
- setProducts(), setLoading(), setError()
```

**Преимущества:**
- Любой компонент берёт данные напрямую из стора
- Нет цепочки пропов
- Автоматическая персистентность (localStorage)

### 3. **React Router v6 - единое SPA приложение**

**Было:** 2 отдельных HTML файла (index.html + admin.html)  
**Стало:** Один entry point с роутингом

**Главное приложение (main.tsx → App.tsx):**
```
/ → HomePage (защищено)
/auth → AuthPage
/profile → ProfilePage (защищено)
/admin/login → AdminLoginPage
/admin → AdminPanelPage (защищено + проверка isAdmin)
```

**Админка (admin.tsx → AdminApp.tsx):**
```
/ → AdminPanelPage (защищено)
/login → AdminLoginPage
```

**Преимущества:**
- Мгновенные переходы без перезагрузки
- Общее состояние между страницами
- Один бандл вместо двух

### 4. **Custom Hooks - вынесли логику из компонентов**

```typescript
// hooks/useProducts.ts
const { products, loading, error, refetch } = useProducts();

// hooks/useAuth.ts
const { 
  isAuthenticated, 
  sendVerificationCode, 
  verifyCode, 
  adminLogin, 
  logout 
} = useAuth();

// hooks/useReviews.ts
const { 
  reviews, 
  addReview, 
  averageRating 
} = useReviews(productId);
```

**Преимущества:**
- Компоненты не знают про API
- Переиспользуемая логика
- Легко тестировать

### 5. **API слой - централизованные запросы**

```typescript
// api/config.ts
export const API_URL = import.meta.env.VITE_API_URL;
export const API_ENDPOINTS = { ... };

// api/products.ts
export const productsApi = {
  getAll(), getById(id), 
  create(data), update(id, data), 
  delete(id), uploadImage(file)
};

// api/auth.ts
export const authApi = {
  sendCode(email), 
  verifyCode(email, code), 
  adminLogin(username, password)
};

// api/reviews.ts
export const reviewsApi = {
  getByProductId(id), 
  create(productId, data), 
  delete(id)
};
```

**Преимущества:**
- Все URL в одном месте
- Легко менять эндпоинты
- Типизация запросов/ответов

### 6. **TypeScript типы**

```typescript
// types/index.ts
export interface Product { ... }
export interface Review { ... }
export interface CartItem { ... }
export interface User { ... }
```

## 📊 Сравнение до/после

| Метрика | До | После |
|---------|-----|--------|
| App.tsx | 450 строк | ~70 строк |
| Компонентов | 1 файл | 7 файлов |
| Управление состоянием | useState + пропы | Zustand (3 стора) |
| Роутинг | 2 HTML файла | React Router |
| API запросы | В компонентах | Централизованы |
| Hooks | Нет | 3 кастомных хука |

## 🚀 Как запустить

```bash
# Установить новые зависимости
npm install

# Запустить фронтенд
npm run dev
# → http://localhost:5173/

# Запустить бэкенд
npm run server
# → http://localhost:3003/

# Собрать production
npm run build
```

## 📁 Новая структура

```
src/
├── api/                 # API запросы
│   ├── config.ts
│   ├── products.ts
│   ├── auth.ts
│   ├── reviews.ts
│   └── index.ts
├── components/          # UI компоненты
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   ├── SearchModal.tsx
│   ├── CartModal.tsx
│   └── index.ts
├── hooks/               # Custom hooks
│   ├── useProducts.ts
│   ├── useAuth.ts
│   ├── useReviews.ts
│   └── index.ts
├── pages/               # Страницы (роуты)
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── ProfilePage.tsx
│   ├── AdminLoginPage.tsx
│   ├── AdminPanelPage.tsx
│   └── index.ts
├── stores/              # Zustand stores
│   ├── authStore.ts
│   ├── cartStore.ts
│   ├── productsStore.ts
│   └── index.ts
├── types/               # TypeScript типы
│   └── index.ts
├── App.tsx              # Главный роутер (70 строк)
├── AdminApp.tsx         # Админ роутер
├── main.tsx             # Entry point
├── admin.tsx            # Admin entry point
└── index.css            # Стили

# Старые файлы (используются как есть)
├── Auth.tsx             # Обновлён для useAuth
├── AdminLogin.tsx       # Обновлён для useAuth
├── AdminPanel.tsx       # Обновлён для useProducts
├── Profile.tsx          # Без изменений
└── Reviews.tsx          # Без изменений
```

## 🎯 Преимущества новой архитектуры

1. **Читаемость** - каждый файл отвечает за одну вещь
2. **Масштабируемость** - легко добавлять новые фичи
3. **Тестируемость** - hooks и API легко тестировать
4. **Переиспользование** - компоненты независимы
5. **Производительность** - один бандл, React Router
6. **Типобезопасность** - TypeScript типы для всего

## 🔄 Миграция завершена

- ✅ Разбит App.tsx на компоненты
- ✅ Добавлен Zustand для состояния
- ✅ Настроен React Router
- ✅ Созданы custom hooks
- ✅ Централизован API слой
- ✅ Добавлены TypeScript типы
- ✅ Сборка работает без ошибок

## 📝 Следующие шаги (опционально)

1. Добавить React Query для кеширования API
2. Добавить тесты (Vitest + React Testing Library)
3. Добавить Storybook для компонентов
4. Оптимизировать бандл (code splitting)
5. Добавить Error Boundary
