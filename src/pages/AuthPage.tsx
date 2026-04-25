import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Flower2, Gift, LockKeyhole, Mail, ShieldCheck, Sparkles, Truck, UserRound } from "lucide-react";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

type AuthMode = "login" | "register" | "forgot" | "reset" | "name";

const modeCopy: Record<AuthMode, { eyebrow: string; title: string; subtitle: string }> = {
  login: {
    eyebrow: "Private flower club",
    title: "Вход в Flowerboom",
    subtitle: "Вернитесь к заказам, открыткам и быстрым доставкам цветов.",
  },
  register: {
    eyebrow: "New customer",
    title: "Создайте аккаунт",
    subtitle: "Сохраним профиль, историю заказов и ускорим следующие покупки.",
  },
  forgot: {
    eyebrow: "Password recovery",
    title: "Восстановление",
    subtitle: "Отправим код на email, чтобы вы безопасно вернули доступ.",
  },
  reset: {
    eyebrow: "New password",
    title: "Новый пароль",
    subtitle: "Введите код из письма и придумайте новый пароль.",
  },
  name: {
    eyebrow: "Almost ready",
    title: "Как вас зовут?",
    subtitle: "Это имя увидит магазин при обработке вашего заказа.",
  },
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-white-alt placeholder:text-slate-500 outline-none transition-all focus:border-sky/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-sky/10";

const primaryButtonClass =
  "w-full rounded-2xl bg-sky px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-ink shadow-[0_18px_60px_rgba(212,175,55,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, setName: setStoreName, accessToken } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get("mode");

    if (urlMode === "name" && accessToken) {
      setMode("name");
      setTempAccessToken(accessToken);
    }
  }, [accessToken, searchParams]);

  const switchMode = (nextMode: AuthMode) => {
    setError("");
    setSuccess("");
    setMode(nextMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      if (response.accessToken && response.refreshToken && response.user) {
        login(response.accessToken, response.refreshToken, response.user);

        if (response.isNewUser) {
          setTempAccessToken(response.accessToken);
          switchMode("name");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Пароль должен содержать хотя бы одну цифру");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(email, password);
      if (response.accessToken && response.refreshToken && response.user) {
        login(response.accessToken, response.refreshToken, response.user);

        if (response.isNewUser) {
          setTempAccessToken(response.accessToken);
          switchMode("name");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess("Код отправлен на email");
      setMode("reset");
    } catch (err: any) {
      setError(err.message || "Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (newPassword.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Пароль должен содержать хотя бы одну цифру");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(email, code, newPassword);
      setSuccess("Пароль успешно обновлён");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setCode("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Ошибка сброса пароля");
    } finally {
      setLoading(false);
    }
  };

  const handleSetName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Имя должно содержать минимум 2 символа");
      return;
    }

    if (name.trim().length > 50) {
      setError("Имя слишком длинное (максимум 50 символов)");
      return;
    }

    if (!tempAccessToken) {
      setError("Ошибка авторизации");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.setName(name.trim(), tempAccessToken);
      if (response.user?.name) {
        setStoreName(response.user.name);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения имени");
    } finally {
      setLoading(false);
    }
  };

  const copy = modeCopy[mode];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090806] px-4 py-8 text-white-alt sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-12 h-72 w-72 rounded-full bg-sky/20 blur-[90px]" />
        <div className="absolute right-[-8rem] top-20 h-96 w-96 rounded-full bg-rose-500/15 blur-[110px]" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px] opacity-30" />
      </div>

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-sky backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Premium floral delivery
          </div>
          <h1 className="max-w-2xl text-[clamp(4.5rem,8vw,8.5rem)] font-black uppercase leading-[0.78] tracking-[-0.08em] text-white">
            Flower
            <span className="block text-sky">Boom</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
            Личный кабинет для красивых заказов: букеты, открытки, доставка и история покупок в одном мягком, быстром интерфейсе.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Быстрая доставка" },
              { icon: Gift, label: "Открытки к букету" },
              { icon: ShieldCheck, label: "Безопасный вход" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <item.icon className="mb-5 h-6 w-6 text-sky" />
                <p className="text-sm font-bold text-white-alt">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[520px]"
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
              <Flower2 className="h-6 w-6 text-sky" />
              Flowerboom
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#12100d]/85 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-sky/20" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky/10 blur-2xl" />

            <div className="relative mb-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-ink shadow-[0_18px_50px_rgba(212,175,55,0.28)]">
                <Flower2 className="h-7 w-7" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky">{copy.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-4xl">
                {copy.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy.subtitle}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </motion.div>
            )}

            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-12`} placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Пароль</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClass} pl-12 pr-12`} placeholder="Введите пароль" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button type="button" onClick={() => switchMode("forgot")} className="text-sm font-bold text-sky transition hover:text-white">
                  Забыли пароль?
                </button>

                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? "Входим..." : "Войти"}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">или</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button type="button" onClick={authApi.loginWithGoogle} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 font-bold text-white transition hover:bg-white/[0.1]">
                  <GoogleIcon />
                  Войти через Google
                </button>

                <p className="text-center text-sm text-slate-400">
                  Нет аккаунта?{" "}
                  <button type="button" onClick={() => switchMode("register")} className="font-black text-sky transition hover:text-white">
                    Зарегистрироваться
                  </button>
                </p>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-12`} placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Пароль</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClass} pl-12 pr-12`} placeholder="Минимум 8 символов, 1 цифра" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="Повторите пароль" />

                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? "Создаём..." : "Создать аккаунт"}
                </button>

                <button type="button" onClick={authApi.loginWithGoogle} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 font-bold text-white transition hover:bg-white/[0.1]">
                  <GoogleIcon />
                  Продолжить через Google
                </button>

                <p className="text-center text-sm text-slate-400">
                  Уже есть аккаунт?{" "}
                  <button type="button" onClick={() => switchMode("login")} className="font-black text-sky transition hover:text-white">
                    Войти
                  </button>
                </p>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-12`} placeholder="your@email.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? "Отправляем..." : "Отправить код"}
                </button>
                <button type="button" onClick={() => switchMode("login")} className="w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                  Вернуться к входу
                </button>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required maxLength={6} className={`${inputClass} text-center text-2xl tracking-[0.45em]`} placeholder="000000" />
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} placeholder="Новый пароль" />
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="Повторите новый пароль" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm font-bold text-sky transition hover:text-white">
                  {showPassword ? "Скрыть пароль" : "Показать пароль"}
                </button>
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? "Сохраняем..." : "Сохранить пароль"}
                </button>
              </form>
            )}

            {mode === "name" && (
              <form onSubmit={handleSetName} className="space-y-4">
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} autoFocus className={`${inputClass} pl-12`} placeholder="Введите своё имя" />
                </div>
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading ? "Сохраняем..." : "Продолжить"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
