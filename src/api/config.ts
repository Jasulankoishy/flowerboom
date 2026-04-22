export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export const API_ENDPOINTS = {
  // Auth
  sendCode: "/api/auth/send-code",
  verifyCode: "/api/auth/verify-code",
  adminLogin: "/api/auth/admin/login",

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
  updateOrderStatus: (id: string) => `/api/admin/orders/${id}/status`,

  // Upload
  upload: "/api/upload",
} as const;
