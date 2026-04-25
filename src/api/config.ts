export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export const API_ENDPOINTS = {
  // Auth
  register: "/api/auth/register",
  login: "/api/auth/login",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
  googleAuth: "/api/auth/google",
  adminLogin: "/api/auth/admin/login",
  setName: "/api/auth/set-name",
  refresh: "/api/auth/refresh",

  // Products
  products: "/api/products",
  adminProducts: "/api/products/admin/all",
  product: (id: string) => `/api/products/${id}`,

  // Reviews
  productReviews: (id: string) => `/api/products/${id}/reviews`,
  deleteReview: (id: string) => `/api/reviews/${id}`,

  // Orders
  orders: "/api/orders",
  order: (id: string) => `/api/orders/${id}`,
  adminOrders: "/api/admin/orders",
  adminStats: "/api/admin/stats",
  updateOrderStatus: (id: string) => `/api/admin/orders/${id}/status`,
  exportProducts: "/api/admin/export/products",
  exportOrders: "/api/admin/export/orders",

  // Promo codes
  validatePromo: "/api/promo/validate",
  adminPromoCodes: "/api/admin/promo-codes",
  adminPromoCode: (id: string) => `/api/admin/promo-codes/${id}`,

  // Showcase
  showcase: "/api/showcase",
  adminShowcase: "/api/admin/showcase",
  adminShowcaseSlide: (id: string) => `/api/admin/showcase/${id}`,

  // Upload
  upload: "/api/upload",
} as const;
