import { useState } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../stores";

export const useAuth = () => {
  const { isAuthenticated, isAdmin, login, loginAdmin, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.sendCode(email);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send code";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.verifyCode(email, code);
      if (result.success && result.accessToken) {
        login(result.accessToken, email);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify code";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.adminLogin(username, password);
      if (result.success && result.accessToken) {
        loginAdmin(result.accessToken);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to login";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    sendVerificationCode,
    verifyCode,
    adminLogin,
    logout,
  };
};
