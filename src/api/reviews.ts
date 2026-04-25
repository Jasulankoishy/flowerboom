import { API_URL, API_ENDPOINTS } from "./config";
import { apiRequest } from "./client";
import type { Review } from "../types";

export const reviewsApi = {
  async getByProductId(productId: string): Promise<Review[]> {
    return apiRequest<Review[]>(`${API_URL}${API_ENDPOINTS.productReviews(productId)}`);
  },

  async create(productId: string, data: { rating: number; comment: string; userName: string }): Promise<Review> {
    return apiRequest<Review>(`${API_URL}${API_ENDPOINTS.productReviews(productId)}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(reviewId: string): Promise<void> {
    await apiRequest<{ message: string }>(`${API_URL}${API_ENDPOINTS.deleteReview(reviewId)}`, {
      method: "DELETE",
    });
  },
};
