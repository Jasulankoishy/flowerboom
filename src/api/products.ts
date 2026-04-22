import { API_URL, API_ENDPOINTS } from "./config";
import { apiFetch, apiRequest } from "./client";
import type { Product } from "../types";

export const productsApi = {
  async getAll(): Promise<Product[]> {
    return apiRequest<Product[]>(`${API_URL}${API_ENDPOINTS.products}`);
  },

  async getById(id: string): Promise<Product> {
    return apiRequest<Product>(`${API_URL}${API_ENDPOINTS.product(id)}`);
  },

  async create(data: FormData): Promise<Product> {
    const response = await apiFetch(`${API_URL}${API_ENDPOINTS.products}`, {
      method: "POST",
      body: data,
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  },

  async update(id: string, data: FormData): Promise<Product> {
    const response = await apiFetch(`${API_URL}${API_ENDPOINTS.product(id)}`, {
      method: "PUT",
      body: data,
    });
    if (!response.ok) throw new Error("Failed to update product");
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await apiFetch(`${API_URL}${API_ENDPOINTS.product(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete product");
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiFetch(`${API_URL}${API_ENDPOINTS.upload}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload image");
    return response.json();
  },
};
