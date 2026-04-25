import { motion } from "motion/react";
import { ShoppingBag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore, useThemeStore } from "../stores";
import type { Product } from "../types";
import { getProductPath } from "../utils/productLinks";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";

interface ProductCardProps {
  product: Product;
  delay: number;
  onQuickOrder: (product: Product) => void;
  onShowReviews: () => void;
}

export default function ProductCard({ product, delay, onQuickOrder, onShowReviews }: ProductCardProps) {
  const { isDark } = useThemeStore();
  const addItem = useCartStore((state) => state.addItem);
  const canOrder = canOrderProduct(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
      }}
      className={`card flex flex-col items-center rounded-lg p-4 transition-all duration-500 group sm:p-6 ${
        isDark
          ? 'bg-gray-800 border-2 border-gray-700/50 hover:border-pink-500/30'
          : 'bg-slate-800 border-2 border-slate-700/50 hover:border-sky/30'
      }`}
    >
      <div className="w-full flex justify-between items-start mb-4">
        <div className="text-sm font-bold tracking-[0.4em] text-slate-600 uppercase">Series {product.index}</div>
        <div className="text-4xl font-extralight text-sky leading-none opacity-40 group-hover:opacity-100 transition-opacity">{product.index}</div>
      </div>

      <motion.div
        className="relative w-full aspect-[4/5] bg-slate-700 rounded-md overflow-hidden border border-slate-600"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-[1.1] cursor-pointer"
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={onShowReviews}
        />
        <motion.div
          className="absolute inset-0 bg-ink/10 pointer-events-none"
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

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
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Быстрый заказ
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
