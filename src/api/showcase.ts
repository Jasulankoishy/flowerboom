import { API_ENDPOINTS, API_URL } from "./config";
import { apiRequest } from "./client";
import type { ShowcaseSlide } from "../types";

export interface ShowcaseSlideInput {
  title: string;
  description: string;
  image: string;
  productId: string;
  sortOrder: number;
  isActive: boolean;
}

export const showcaseApi = {
  async getPublic(): Promise<ShowcaseSlide[]> {
    return apiRequest<ShowcaseSlide[]>(`${API_URL}${API_ENDPOINTS.showcase}`);
  },

  async getAdmin(): Promise<ShowcaseSlide[]> {
    return apiRequest<ShowcaseSlide[]>(`${API_URL}${API_ENDPOINTS.adminShowcase}`);
  },

  async create(data: ShowcaseSlideInput): Promise<ShowcaseSlide> {
    return apiRequest<ShowcaseSlide>(`${API_URL}${API_ENDPOINTS.adminShowcase}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: ShowcaseSlideInput): Promise<ShowcaseSlide> {
    return apiRequest<ShowcaseSlide>(`${API_URL}${API_ENDPOINTS.adminShowcaseSlide(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest<{ message: string }>(`${API_URL}${API_ENDPOINTS.adminShowcaseSlide(id)}`, {
      method: "DELETE",
    });
  },
};
