import { API_URL, API_ENDPOINTS } from "./config";

export const authApi = {
  async sendCode(email: string): Promise<{ success: boolean; message: string; devMode?: boolean }> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.sendCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to send code");
    return response.json();
  },

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string; accessToken: string }> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.verifyCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) throw new Error("Failed to verify code");
    return response.json();
  },

  async adminLogin(username: string, password: string): Promise<{ success: boolean; accessToken?: string; message?: string }> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.adminLogin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to login");
    return data;
  },
};
