import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, ShoppingBag, X } from "lucide-react";
import { useProducts } from "../hooks";
import { useCartStore } from "../stores";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProducts();
  const addItem = useCartStore((state) => state.addItem);

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products.slice(0, 6);

    return products.filter((product) => {
      const haystack = `${product.title} ${product.description} ${product.price}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [products, searchQuery]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[94svh] w-full max-w-3xl overflow-y-auto rounded-lg border-2 border-sky/30 bg-slate-800 p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-sky sm:text-xs sm:tracking-[0.3em]">Live search</p>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white-alt sm:text-2xl">Поиск букетов</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Название, описание или цена"
            className="w-full rounded border border-slate-600 bg-slate-700 py-4 pl-12 pr-4 text-white-alt outline-none transition-colors focus:border-sky"
            autoFocus
          />
        </div>

        <div className="mt-6 grid gap-3">
          {results.length === 0 ? (
            <p className="rounded border border-slate-700 bg-slate-900/40 p-6 text-center text-slate-400">
              Ничего не найдено
            </p>
          ) : (
            results.map((product) => (
              <div key={product.id} className="grid grid-cols-[64px_1fr] items-center gap-3 rounded border border-slate-700 bg-slate-900/40 p-3 sm:grid-cols-[72px_1fr_auto] sm:gap-4">
                <img src={product.image} alt={product.title} className="h-16 w-16 rounded object-cover sm:h-[72px] sm:w-[72px]" />
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-white-alt">{product.title}</h3>
                  <p className="truncate text-sm text-slate-400">{product.description}</p>
                  <p className="mt-1 text-sm font-black text-sky">{product.price}</p>
                </div>
                <button
                  onClick={() => addItem(product)}
                  className="col-span-2 rounded border border-sky/40 p-3 text-sky transition-all hover:bg-sky hover:text-ink sm:col-auto"
                  aria-label="Добавить в корзину"
                >
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
