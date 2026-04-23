import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Flower2 } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (token && refreshToken) {
      // Decode JWT to get user info (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const user = {
          id: payload.userId,
          email: payload.email,
        };

        login(token, refreshToken, user);
        navigate("/");
      } catch (error) {
        console.error("Failed to parse token:", error);
        navigate("/auth?error=invalid_token");
      }
    } else {
      navigate("/auth?error=missing_tokens");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4 animate-pulse">
          <Flower2 className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Вход через Google</h2>
        <p className="text-gray-600">Завершаем авторизацию...</p>
      </div>
    </div>
  );
}
