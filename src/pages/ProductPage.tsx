import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Zap } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QuickOrderModal from "../components/QuickOrderModal";
import CartModal from "../components/CartModal";
import SearchModal from "../components/SearchModal";
import { productsApi } from "../api";
import { useCartStore, useThemeStore } from "../stores";
import type { Product } from "../types";

export default function ProductPage() {
  const { idOrSlug = "" } = useParams();
  const { isDark } = useThemeStore();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await productsApi.getById(idOrSlug);
        if (!ignore) setProduct(data);
      } catch (err: any) {
        if (!ignore) setError(err.message || "Товар не найден");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [idOrSlug]);

  return (
    <div className={`min-h-screen overflow-x-hidden px-4 py-6 transition-colors duration-500 sm:px-6 lg:px-8 ${isDark ? "bg-gray-900" : "bg-ink"}`}>
      <Header
        onSearchClick={() => setShowSearch(true)}
        onCartClick={() => setShowCart(true)}
        onProfileClick={() => window.location.assign("/profile")}
      />

      <main className="mx-auto w-full max-w-[1280px] py-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-slate-400 transition hover:text-sky">
          <ArrowLeft className="h-4 w-4" />
          В каталог
        </Link>

        {loading ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-800 p-10 text-center text-slate-400">
            Загружаем букет...
          </div>
        ) : error || !product ? (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center">
            <h1 className="text-2xl font-black text-white-alt">Товар не найден</h1>
            <p className="mt-3 text-slate-400">Возможно, ссылка устарела или букет удалён.</p>
          </div>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-800">
              <img
                src={product.image}
                alt={product.title}
                className="h-full min-h-[420px] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-[2rem] border border-slate-700 bg-slate-900/80 p-6 shadow-2xl sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky">Flowerboom bouquet</p>
              <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white-alt sm:text-5xl">
                {product.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">{product.description}</p>
              <div className="mt-8 inline-flex rounded-2xl border border-sky/30 bg-sky/10 px-5 py-3 text-2xl font-black text-sky">
                {product.price}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => {
                    addItem(product);
                    setShowCart(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-sky/40 py-4 text-sm font-black uppercase tracking-widest text-sky transition hover:bg-sky hover:text-ink"
                >
                  <ShoppingBag className="h-5 w-5" />
                  В корзину
                </button>
                <button
                  onClick={() => setQuickOrderProduct(product)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-sky py-4 text-sm font-black uppercase tracking-widest text-ink transition hover:brightness-110"
                >
                  <Zap className="h-5 w-5" />
                  Быстрый заказ
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
      {showCart && <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />}
      {quickOrderProduct && <QuickOrderModal product={quickOrderProduct} onClose={() => setQuickOrderProduct(null)} />}

      <div className="mx-auto w-full max-w-[1560px]">
        <Footer />
      </div>
    </div>
  );
}
