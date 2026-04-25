import { API_URL, API_ENDPOINTS } from "./config";
import { apiRequest } from "./client";
import type { Product } from "../types";

export const productsApi = {
  async getAll(): Promise<Product[]> {
    return apiRequest<Product[]>(`${API_URL}${API_ENDPOINTS.products}`);
  },

  async getAllAdmin(): Promise<Product[]> {
    return apiRequest<Product[]>(`${API_URL}${API_ENDPOINTS.adminProducts}`);
  },

  async getById(id: string): Promise<Product> {
    return apiRequest<Product>(`${API_URL}${API_ENDPOINTS.product(id)}`);
  },

  async create(data: FormData): Promise<Product> {
    return apiRequest<Product>(`${API_URL}${API_ENDPOINTS.products}`, {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: FormData): Promise<Product> {
    return apiRequest<Product>(`${API_URL}${API_ENDPOINTS.product(id)}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest<{ message: string }>(`${API_URL}${API_ENDPOINTS.product(id)}`, {
      method: "DELETE",
    });
  },

  async uploadImage(file: File): Promise<{ url: string; path: string; success: boolean }> {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest<{ url: string; path: string; success: boolean }>(`${API_URL}${API_ENDPOINTS.upload}`, {
      method: "POST",
      body: formData,
    });
  },
};
