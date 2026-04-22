import ProductCard from "./ProductCard";
import { useProducts } from "../hooks";
import type { Product } from "../types";

interface ProductGridProps {
  onQuickOrder: (product: Product) => void;
  onShowReviews: (product: Product) => void;
}

export default function ProductGrid({ onQuickOrder, onShowReviews }: ProductGridProps) {
  const { products, loading } = useProducts();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          delay={0.1 * (idx + 1)}
          onQuickOrder={onQuickOrder}
          onShowReviews={() => onShowReviews(product)}
        />
      ))}
    </div>
  );
}
