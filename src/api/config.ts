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

  // Products
  products: "/api/products",
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

  // Upload
  upload: "/api/upload",
} as const;
