import { motion } from "motion/react";
import { Mail, ArrowRight, Apple } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks";

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { sendVerificationCode, verifyCode, login, loading } = useAuth();

  // Timer for resend button
  useEffect(() => {
    if (step !== "code") return;

    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      const result = await sendVerificationCode(email);
      if (result.success) {
        setStep("code");
        setTimer(60);
        setCanResend(false);
        if (result.devMode) {
          setLocalError("Режим разработки: проверьте консоль сервера для кода");
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Ошибка отправки кода");
    }
  };

  const handleResend = async () => {
    setLocalError("");
    try {
      const result = await sendVerificationCode(email);
      if (result.success) {
        setTimer(60);
        setCanResend(false);
        if (result.devMode) {
          setLocalError("Код отправлен (проверьте консоль сервера)");
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Ошибка отправки кода");
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      const result = await verifyCode(email, code);
      if (result.success) {
        onAuthSuccess();
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Неверный код");
    }
  };

  const handleSocialAuth = (provider: string) => {
    // Mock social auth — устанавливаем состояние авторизации, затем переходим
    login("social-mock-token", "social-mock-refresh-token", {
      id: provider.toLowerCase(),
      email: `${provider.toLowerCase()}-user@social.com`,
    });
    setTimeout(() => onAuthSuccess(), 100);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-sky uppercase tracking-tighter mb-2">
            Flowerboom
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Floral Design Studio
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 border-2 border-slate-700/50 rounded-lg p-8"
        >
          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm"
            >
              {localError}
            </motion.div>
          )}

          {step === "email" ? (
            <>
              <h2 className="text-2xl font-bold text-white-alt mb-2">Вход</h2>
              <p className="text-slate-400 text-sm mb-8">
                Введите email для получения кода
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-slate-700 border border-slate-600 rounded pl-12 pr-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky text-ink font-bold uppercase tracking-widest py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Получить код"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800 text-slate-500 uppercase tracking-wider">
                    или
                  </span>
                </div>
              </div>

              {/* Social Auth */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialAuth("Google")}
                  className="w-full bg-slate-700 border border-slate-600 text-white-alt font-medium py-3 rounded hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Войти через Google
                </button>

                <button
                  onClick={() => handleSocialAuth("Apple")}
                  className="w-full bg-slate-700 border border-slate-600 text-white-alt font-medium py-3 rounded hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
                >
                  <Apple className="w-5 h-5" />
                  Войти через Apple
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white-alt mb-2">
                Введите код
              </h2>
              <p className="text-slate-400 text-sm mb-2">
                Код отправлен на <span className="text-sky">{email}</span>
              </p>
              <p className="text-slate-500 text-xs mb-8">
                Проверьте папку Входящие и Спам
              </p>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Код подтверждения
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-sky transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky text-ink font-bold uppercase tracking-widest py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Проверка..." : "Войти"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-slate-400 text-sm hover:text-sky transition-colors"
                  >
                    Изменить email
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className="text-slate-400 text-sm hover:text-sky transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canResend
                      ? "Отправить повторно"
                      : `Отправить повторно (${timer}с)`}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>

        {/* Footer */}
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
