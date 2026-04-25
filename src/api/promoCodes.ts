import { API_ENDPOINTS, API_URL } from "./config";
import { apiRequest } from "./client";

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeInput {
  code: string;
  type: "percent" | "fixed";
  value: number;
  isActive: boolean;
  expiresAt?: string | null;
}

export interface PromoValidationResult {
  code: string;
  type: "percent" | "fixed";
  value: number;
  originalTotal: string;
  discountAmount: string;
  totalPrice: string;
}

export const promoCodesApi = {
  async validate(code: string, totalPrice: number): Promise<PromoValidationResult> {
    return apiRequest<PromoValidationResult>(`${API_URL}${API_ENDPOINTS.validatePromo}`, {
      method: "POST",
      body: JSON.stringify({ code, totalPrice }),
    });
  },

  async getAll(): Promise<PromoCode[]> {
    return apiRequest<PromoCode[]>(`${API_URL}${API_ENDPOINTS.adminPromoCodes}`);
  },

  async create(data: PromoCodeInput): Promise<PromoCode> {
    return apiRequest<PromoCode>(`${API_URL}${API_ENDPOINTS.adminPromoCodes}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: PromoCodeInput): Promise<PromoCode> {
    return apiRequest<PromoCode>(`${API_URL}${API_ENDPOINTS.adminPromoCode(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest<{ message: string }>(`${API_URL}${API_ENDPOINTS.adminPromoCode(id)}`, {
      method: "DELETE",
    });
  },
};
