import { API_URL, API_ENDPOINTS } from "./config";
import { apiRequest } from "./client";

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  city: string;
  street: string;
  house: string;
  apartment?: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  totalPrice?: string;
  giftCardEnabled?: boolean;
  giftMessage?: string;
  promoCode?: string;
  idempotencyKey?: string;
}

export interface Order {
  id: string;
  userId: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  status: "pending" | "accepted" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
  totalPrice: string;
  originalTotalPrice?: string;
  discountAmount?: string;
  promoCode?: string;
  giftCardEnabled: boolean;
  giftMessage?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: string;
    product: {
      id: string;
      title: string;
      image: string;
      price: string;
    };
  }>;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export interface AdminStats {
  productsCount: number;
  ordersToday: number;
  pendingOrders: number;
  totalRevenue: string;
}

export interface AdminAnalytics {
  ordersByDay: Array<{ date: string; count: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueByStatus: Array<{ status: string; total: number }>;
}

export interface AdminOrderFilters {
  status?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "newest" | "oldest" | "deliveryDate" | "totalHigh" | "totalLow";
  sortDir?: "asc" | "desc";
}

export const ordersApi = {
  async create(data: CreateOrderData): Promise<Order> {
    return apiRequest<Order>(`${API_URL}${API_ENDPOINTS.orders}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getUserOrders(): Promise<Order[]> {
    return apiRequest<Order[]>(`${API_URL}${API_ENDPOINTS.orders}`);
  },

  async getById(id: string): Promise<Order> {
    return apiRequest<Order>(`${API_URL}${API_ENDPOINTS.order(id)}`);
  },

  async getAllOrders(filters?: string | AdminOrderFilters): Promise<Order[]> {
    const params = new URLSearchParams();
    const normalizedFilters = typeof filters === "string" ? { status: filters } : filters;

    if (normalizedFilters) {
      Object.entries(normalizedFilters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
      });
    }

    const query = params.toString();
    const url = query
      ? `${API_URL}${API_ENDPOINTS.adminOrders}?${query}`
      : `${API_URL}${API_ENDPOINTS.adminOrders}`;
    return apiRequest<Order[]>(url);
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    return apiRequest<Order>(`${API_URL}${API_ENDPOINTS.updateOrderStatus(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getAdminStats(): Promise<AdminStats> {
    return apiRequest<AdminStats>(`${API_URL}${API_ENDPOINTS.adminStats}`);
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    return apiRequest<AdminAnalytics>(`${API_URL}${API_ENDPOINTS.adminAnalytics}`);
  },
};
