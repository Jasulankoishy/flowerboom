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
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  totalPrice: string;
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
  };
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

  async getAllOrders(status?: string): Promise<Order[]> {
    const url = status
      ? `${API_URL}${API_ENDPOINTS.adminOrders}?status=${status}`
      : `${API_URL}${API_ENDPOINTS.adminOrders}`;
    return apiRequest<Order[]>(url);
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    return apiRequest<Order>(`${API_URL}${API_ENDPOINTS.updateOrderStatus(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
