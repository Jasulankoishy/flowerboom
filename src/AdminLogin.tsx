import { motion } from "motion/react";
import { useState } from "react";
import { Lock, User } from "lucide-react";
import { useAuth } from "./hooks";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const { adminLogin, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      const result = await adminLogin(username, password);
      if (result.success) {
        onLoginSuccess();
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Неверные данные");
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-sky uppercase tracking-tighter mb-2">
            Flowerboom
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Admin Panel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 border-2 border-slate-700/50 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white-alt mb-2">Вход в админку</h2>
          <p className="text-slate-400 text-sm mb-8">
            Введите данные для доступа
          </p>

          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm"
            >
              {localError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Логин
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-700 border border-slate-600 rounded pl-12 pr-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 border border-slate-600 rounded pl-12 pr-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-sky text-ink font-bold uppercase tracking-widest py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Вход..." : "Войти"}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-slate-700/50 rounded text-xs text-slate-400">
            <p className="font-bold mb-1">Тестовые данные:</p>
            <p>Логин: admin</p>
            <p>Пароль: admin123</p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-slate-500 text-xs mt-8 uppercase tracking-wider"
        >
          © 2026 Flowerboom Design System
        </motion.p>
      </div>
    </div>
  );
}
