import { motion } from "motion/react";
import { ArrowDown, Sparkles, Truck } from "lucide-react";
import { useThemeStore } from "../stores";

export default function HeroSection() {
  const { isDark } = useThemeStore();

  return (
    <div className="relative mb-24 overflow-hidden rounded-lg border border-sky/20 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.18),transparent_34%),linear-gradient(135deg,#080808_0%,#101010_52%,#181204_100%)] px-6 py-10 md:px-10 md:py-14">
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-25 [background:repeating-linear-gradient(135deg,transparent_0_18px,rgba(212,175,55,.2)_18px_19px)]" />
      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
      <div className="max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.28em] ${isDark ? 'border-pink-400/30 text-pink-300' : 'border-sky/30 text-sky'}`}
        >
          <Sparkles className="h-4 w-4" />
          Floral delivery studio
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-white-alt md:text-7xl"
        >
          Букеты, которые выглядят как событие
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className={`mt-6 max-w-2xl text-lg leading-relaxed font-sans ${isDark ? 'text-gray-300' : 'text-slate-300'}`}
        >
          Соберите заказ за минуту: выберите букет, добавьте открытку и назначьте удобное время доставки.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
      >
        <div className="rounded-lg border border-sky/25 bg-black/30 p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky text-ink">
            <Truck className="h-6 w-6" />
          </div>
          <div className="text-sm font-black uppercase tracking-widest text-white-alt">Доставка завтра</div>
          <div className="mt-2 text-sm text-slate-400">Выбор даты и времени прямо в корзине.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-sky text-sky">
            <ArrowDown className="h-6 w-6" />
          </div>
          <div className="text-sm font-black uppercase tracking-widest text-white-alt">Каталог ниже</div>
          <div className="mt-2 text-sm text-slate-400">Цены, корзина и быстрый заказ уже в карточках.</div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
