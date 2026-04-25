import ProductCard from "./ProductCard";
import { useProducts } from "../hooks";
import { OCCASIONS, getOccasionLabel } from "../constants/occasions";
import type { Product } from "../types";
import { useState } from "react";

interface ProductGridProps {
  onQuickOrder: (product: Product) => void;
  onShowReviews: (product: Product) => void;
  selectedOccasion: string;
  onOccasionChange: (occasion: string) => void;
}

const PRICE_FILTERS = [
  { slug: "all", label: "Любая цена", min: 0, max: Infinity },
  { slug: "under-10k", label: "до 10к", min: 0, max: 10000 },
  { slug: "10-20k", label: "10–20к", min: 10000, max: 20000 },
  { slug: "20-30k", label: "20–30к", min: 20000, max: 30000 },
  { slug: "vip", label: "VIP 30к+", min: 30000, max: Infinity },
];

const parsePrice = (value: string) => {
  const normalized = String(value || "").replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price : 0;
};

export default function ProductGrid({ onQuickOrder, onShowReviews, selectedOccasion, onOccasionChange }: ProductGridProps) {
  const { products, loading } = useProducts();
  const [selectedPrice, setSelectedPrice] = useState("all");
  const selectedPriceFilter = PRICE_FILTERS.find((filter) => filter.slug === selectedPrice) || PRICE_FILTERS[0];
  const occasionProducts = selectedOccasion === "all"
    ? products
    : products.filter((product) => product.occasions?.includes(selectedOccasion));
  const visibleProducts = selectedPrice === "all"
    ? occasionProducts
    : occasionProducts.filter((product) => {
        const price = parsePrice(product.price);
        return price >= selectedPriceFilter.min && price < selectedPriceFilter.max;
      });

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
    <section id="catalog" className="mb-20 scroll-mt-8">
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky">Повод</p>
            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white-alt sm:text-2xl">
              Выберите настроение букета
            </h2>
          </div>
          <p className="hidden text-sm text-slate-500 md:block">
            {visibleProducts.length} товаров
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

        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Цена</p>
            <p className="hidden text-xs text-slate-500 sm:block">
              {selectedOccasion === "all" ? "Все поводы" : getOccasionLabel(selectedOccasion)}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRICE_FILTERS.map((filter) => (
              <button
                key={filter.slug}
                onClick={() => setSelectedPrice(filter.slug)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                  selectedPrice === filter.slug
                    ? "border-sky bg-sky text-ink"
                    : "border-slate-700 bg-ink/60 text-white-alt hover:border-sky"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-10 text-center">
          <p className="text-xl font-bold text-white-alt">Под этот фильтр пока нет букетов</p>
          <p className="mt-2 text-slate-400">Можно сбросить повод/цену или добавить подходящие товары в админке.</p>
          <button
            onClick={() => {
              onOccasionChange("all");
              setSelectedPrice("all");
            }}
            className="mt-6 rounded bg-sky px-6 py-3 font-bold text-ink hover:brightness-110"
          >
            Сбросить фильтры
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
