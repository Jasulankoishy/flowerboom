import { motion } from "motion/react";
import { useThemeStore } from "../stores";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  delay: number;
  onQuickOrder: (product: Product) => void;
  onShowReviews: () => void;
}

export default function ProductCard({ product, delay, onQuickOrder, onShowReviews }: ProductCardProps) {
  const { isDark } = useThemeStore();

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
      className={`card flex flex-col items-center p-6 rounded-lg group transition-all duration-500 ${
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
        <h3 className="text-xl font-bold text-white-alt uppercase tracking-tight">{product.title}</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onQuickOrder(product)}
            className="text-xs uppercase font-bold tracking-widest text-ink bg-sky py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Quick Order
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
