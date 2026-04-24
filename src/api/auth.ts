import { API_URL, API_ENDPOINTS } from "./config";

interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export const authApi = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.register}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка регистрации");
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка входа");
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.forgotPassword}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка отправки кода");
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.resetPassword}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка сброса пароля");
    return data;
  },

  loginWithGoogle(): void {
    window.location.href = `${API_URL}${API_ENDPOINTS.googleAuth}`;
  },

  async adminLogin(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.adminLogin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка входа");
    return data;
  },

  async setName(name: string, accessToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.setName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Ошибка сохранения имени");
    return data;
  },
};
