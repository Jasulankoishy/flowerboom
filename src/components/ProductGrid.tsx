import ProductCard from "./ProductCard";
import { useProducts } from "../hooks";
import { OCCASIONS, getOccasionLabel } from "../constants/occasions";
import type { Product } from "../types";

interface ProductGridProps {
  onQuickOrder: (product: Product) => void;
  onShowReviews: (product: Product) => void;
  selectedOccasion: string;
  onOccasionChange: (occasion: string) => void;
}

export default function ProductGrid({ onQuickOrder, onShowReviews, selectedOccasion, onOccasionChange }: ProductGridProps) {
  const { products, loading } = useProducts();
  const visibleProducts = selectedOccasion === "all"
    ? products
    : products.filter((product) => product.occasions?.includes(selectedOccasion));

  if (loading) {
    return (
      <div className="col-span-full text-center py-20 text-slate-500 uppercase tracking-widest">
        Загрузка коллекции...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-slate-500 uppercase tracking-widest">
        Коллекция пуста
      </div>
    );
  }

  return (
    <section className="mb-20">
      <div className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky">Повод</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white-alt">
              Выберите настроение букета
            </h2>
          </div>
          <p className="hidden text-sm text-slate-500 md:block">
            {selectedOccasion === "all" ? `${products.length} товаров` : getOccasionLabel(selectedOccasion)}
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => onOccasionChange("all")}
            className={`shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition-all ${
              selectedOccasion === "all"
                ? "border-sky bg-sky text-ink"
                : "border-slate-700 bg-slate-800 text-white-alt hover:border-sky"
            }`}
          >
            Все
          </button>
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion.slug}
              onClick={() => onOccasionChange(occasion.slug)}
              className={`shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition-all ${
                selectedOccasion === occasion.slug
                  ? "border-sky bg-sky text-ink"
                  : "border-slate-700 bg-slate-800 text-white-alt hover:border-sky"
              }`}
            >
              {occasion.label}
            </button>
          ))}
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-10 text-center">
          <p className="text-xl font-bold text-white-alt">В этом поводе пока нет букетов</p>
          <p className="mt-2 text-slate-400">Можно вернуться ко всем товарам или добавить поводы в админке.</p>
          <button
            onClick={() => onOccasionChange("all")}
            className="mt-6 rounded bg-sky px-6 py-3 font-bold text-ink hover:brightness-110"
          >
            Показать все букеты
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              delay={0.1 * (idx + 1)}
              onQuickOrder={onQuickOrder}
              onShowReviews={() => onShowReviews(product)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
