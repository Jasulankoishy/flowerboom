import { motion } from "motion/react";
import { ShoppingBag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore, useThemeStore } from "../stores";
import type { Product } from "../types";
import { getProductPath } from "../utils/productLinks";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

interface ProductCardProps {
  product: Product;
  delay?: number;
  onQuickOrder: (product: Product) => void;
  onShowReviews: () => void;
}

export default function ProductCard({ product, delay = 0, onQuickOrder, onShowReviews }: ProductCardProps) {
  const { isDark } = useThemeStore();
  const addItem = useCartStore((state) => state.addItem);
  const canOrder = canOrderProduct(product);
  const { isDesktop, reducedMotion } = useMotionPreferences();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: isDesktop ? 28 : 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reducedMotion ? 0 : isDesktop ? 0.6 : 0.35, delay: isDesktop && !reducedMotion ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isDesktop && !reducedMotion ? { y: -6 } : undefined}
      className={`card flex flex-col items-center rounded-lg p-4 transition-colors group sm:p-6 ${
        isDark
          ? 'bg-gray-800 border-2 border-gray-700/50 hover:border-pink-500/30'
          : 'bg-slate-800 border-2 border-slate-700/50 hover:border-sky/30'
      }`}
    >
      <div className="w-full flex justify-between items-start mb-4">
        <div className="text-sm font-bold tracking-[0.4em] text-slate-600 uppercase">Series {product.index}</div>
        <div className="text-4xl font-extralight text-sky leading-none opacity-40 group-hover:opacity-100 transition-opacity">{product.index}</div>
      </div>

      <div
        className="relative w-full aspect-[4/5] bg-slate-700 rounded-md overflow-hidden border border-slate-600"
      >
        <motion.img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover cursor-pointer"
          referrerPolicy="no-referrer"
          loading="lazy"
          whileHover={isDesktop && !reducedMotion ? { scale: 1.04 } : undefined}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={onShowReviews}
        />
      </div>

      <div className="mt-6 w-full space-y-4">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${getAvailabilityClass(product.availability)}`}>
          {getAvailabilityLabel(product.availability)}
        </span>
        <div className="flex items-start justify-between gap-3">
          <Link
            to={getProductPath(product)}
            className="text-lg font-bold uppercase tracking-tight text-white-alt transition hover:text-sky sm:text-xl"
          >
            {product.title}
          </Link>
          <div className="shrink-0 rounded border border-sky/30 bg-sky/10 px-3 py-2 text-sm font-black text-sky">
            {product.price}
          </div>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-400">{product.description}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => addItem(product)}
            disabled={!canOrder}
            className="flex items-center justify-center gap-2 rounded border border-sky/40 py-4 text-xs font-bold uppercase tracking-widest text-sky transition-all hover:bg-sky hover:text-ink disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent"
          >
            <ShoppingBag className="h-4 w-4" />
            {canOrder ? "В корзину" : "Недоступно"}
          </button>
          <button
            onClick={() => onQuickOrder(product)}
            disabled={!canOrder}
            className="flex items-center justify-center gap-2 rounded bg-sky py-4 text-xs font-bold uppercase tracking-widest text-ink transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:hover:brightness-100"
          >
            <Zap className="h-4 w-4" />
            <span className="block">
              Быстрый заказ
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
