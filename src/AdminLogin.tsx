import { motion } from "motion/react";
import { useState } from "react";
import { Eye, EyeOff, Flower2, LockKeyhole, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "./hooks";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090806] px-4 py-10 text-white-alt">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-sky/20 blur-[100px]" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px] opacity-30" />
      </div>

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12100d]/85 shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="hidden border-r border-white/10 bg-white/[0.035] p-10 lg:block"
        >
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky text-ink">
              <Flower2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black uppercase tracking-tight">Flowerboom</p>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Admin cockpit</p>
            </div>
          </div>

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/20 bg-sky/10 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-sky">
            <Sparkles className="h-4 w-4" />
            Secure workspace
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white">
            Управляйте заказами красиво
          </h1>
          <p className="mt-6 text-sm leading-7 text-slate-400">
            Вход для владельца: товары, витрина, промокоды, заказы и быстрые статусы доставки в одном месте.
          </p>

          <div className="mt-10 space-y-3">
            {["Заказы и статусы", "Товары и фото", "Промокоды и витрина"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <ShieldCheck className="h-5 w-5 text-sky" />
                <span className="text-sm font-bold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-8 lg:p-10"
        >
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-ink">
              <Flower2 className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky">Admin cockpit</p>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-4xl">
            Вход в админку
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Введите логин и пароль владельца, чтобы открыть панель управления магазином.
          </p>

          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {localError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Логин</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 pl-12 text-white-alt placeholder:text-slate-500 outline-none transition-all focus:border-sky/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-sky/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Пароль</label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 pl-12 pr-12 text-white-alt placeholder:text-slate-500 outline-none transition-all focus:border-sky/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-sky/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-ink shadow-[0_18px_60px_rgba(212,175,55,0.22)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Проверяем..." : "Войти"}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.22em] text-slate-600">
            Flowerboom secure admin
          </p>
        </motion.div>
      </section>
    </main>
  );
}
