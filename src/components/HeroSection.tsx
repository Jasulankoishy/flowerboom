import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useThemeStore } from "../stores";

export default function HeroSection() {
  const { isDark } = useThemeStore();

  return (
    <div className="flex flex-col lg:flex-row gap-16 mb-24 items-end justify-between">
      <div className="max-w-xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`text-2xl font-script italic mb-4 ${isDark ? 'text-pink-400/80' : 'text-sky/80'}`}
        >
          Создаем любовь через цветы
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className={`text-lg leading-relaxed font-sans ${isDark ? 'text-gray-300' : 'text-slate-400'}`}
        >
          Мы выращиваем наши цветы с любовью специально для вас.
          Трепетно относимся к доставке, чтобы доставить вам эстетическое удовольствие.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-6 border-t border-slate-700 pt-8 mt-8 w-full max-w-sm"
      >
        <div
          onClick={() => alert("Показать все 348+ товаров")}
          className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky cursor-pointer hover:bg-sky hover:text-ink transition-all"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
        </div>
        <div>
          <div className="font-bold uppercase tracking-widest text-sm mb-1">Explore all products</div>
          <div className="text-slate-500 text-xs uppercase tracking-widest">348+ varieties available</div>
        </div>
      </motion.div>
    </div>
  );
}
