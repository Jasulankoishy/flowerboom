import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldCheck, ShoppingBag, Sparkles, Truck, Zap } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QuickOrderModal from "../components/QuickOrderModal";
import CartModal from "../components/CartModal";
import SearchModal from "../components/SearchModal";
import { productsApi } from "../api";
import { useCartStore, useThemeStore } from "../stores";
import type { Product } from "../types";
import { getOccasionLabel } from "../constants/occasions";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";
import { getProductPath } from "../utils/productLinks";

export default function ProductPage() {
  const { idOrSlug = "" } = useParams();
  const { isDark } = useThemeStore();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
        const allProducts = await productsApi.getAll();
        if (!ignore) {
          setProduct(data);
          setProducts(allProducts);
        }
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

  useEffect(() => {
    if (!product) return;

    const previousTitle = document.title;
    const description = product.description.slice(0, 155);
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") || "";

    document.title = `${product.title} — Flowerboom`;
    metaDescription?.setAttribute("content", `${description} ${product.price ? `Цена: ${product.price}.` : ""}`);

    return () => {
      document.title = previousTitle;
      metaDescription?.setAttribute("content", previousDescription);
    };
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const byOccasion = products.filter((item) => (
      item.id !== product.id &&
      item.isPublished !== false &&
      item.occasions?.some((occasion) => product.occasions?.includes(occasion))
    ));

    const fallback = products.filter((item) => item.id !== product.id && item.isPublished !== false);
    return (byOccasion.length > 0 ? byOccasion : fallback).slice(0, 3);
  }, [product, products]);

  const productAvailability = product?.availability === "out_of_stock"
    ? "https://schema.org/OutOfStock"
    : product?.availability === "preorder"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/InStock";

  const structuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price.replace(/\s/g, "").replace(/[^\d.]/g, ""),
      priceCurrency: "KZT",
      availability: productAvailability,
      url: `${window.location.origin}${getProductPath(product)}`,
    },
  } : null;
  const canOrder = product ? canOrderProduct(product) : false;

  return (
    <div className={`min-h-screen overflow-x-hidden px-4 py-6 transition-colors duration-500 sm:px-6 lg:px-8 ${isDark ? "bg-gray-900" : "bg-ink"}`}>
      <Header
        onSearchClick={() => setShowSearch(true)}
        onCartClick={() => setShowCart(true)}
        onProfileClick={() => window.location.assign("/profile")}
      />

      <main className="mx-auto w-full max-w-[1280px] py-10">
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
          <>
            {structuredData && (
              <script type="application/ld+json">
                {JSON.stringify(structuredData)}
              </script>
            )}

            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              <Link to="/" className="inline-flex items-center gap-2 transition hover:text-sky">
                <ArrowLeft className="h-4 w-4" />
                Главная
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/#catalog" className="transition hover:text-sky">Каталог</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-sky">{product.title}</span>
            </nav>

            <section className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-900/80 p-4 shadow-2xl sm:p-6 lg:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,175,55,0.14),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.08),transparent_24%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-800">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full min-h-[360px] w-full object-cover sm:min-h-[520px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-2 sm:p-4">
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${getAvailabilityClass(product.availability)}`}>
                      {getAvailabilityLabel(product.availability)}
                    </span>
                    {product.occasions?.map((occasion) => (
                      <span key={occasion} className="rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-sky">
                        {getOccasionLabel(occasion)}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.45em] text-sky">Flowerboom bouquet</p>
                  <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight text-white-alt sm:text-6xl">
                    {product.title}
                  </h1>
                  <p className="mt-5 text-lg leading-relaxed text-slate-300">{product.description}</p>
                  <div className="mt-8 inline-flex rounded-2xl border border-sky/30 bg-sky/10 px-5 py-3 text-3xl font-black text-sky">
                    {product.price}
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        addItem(product);
                        setShowCart(true);
                      }}
                      disabled={!canOrder}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-sky/40 py-4 text-sm font-black uppercase tracking-widest text-sky transition hover:bg-sky hover:text-ink disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {canOrder ? "В корзину" : "Нет в наличии"}
                    </button>
                    <button
                      onClick={() => setQuickOrderProduct(product)}
                      disabled={!canOrder}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-sky py-4 text-sm font-black uppercase tracking-widest text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:hover:brightness-100"
                    >
                      <Zap className="h-5 w-5" />
                      {product.availability === "preorder" ? "Заказать под заказ" : "Быстрый заказ"}
                    </button>
                  </div>

                  <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700 bg-ink/40 p-4">
                      <Truck className="mb-3 h-5 w-5 text-sky" />
                      Доставка по городу
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-ink/40 p-4">
                      <ShieldCheck className="mb-3 h-5 w-5 text-sky" />
                      Актуальная цена
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-ink/40 p-4">
                      <Sparkles className="mb-3 h-5 w-5 text-sky" />
                      Открытка к заказу
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {relatedProducts.length > 0 && (
              <section className="mt-14">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-sky">Похожие букеты</p>
                    <h2 className="mt-2 text-2xl font-black uppercase text-white-alt">Может понравиться</h2>
                  </div>
                  <Link to="/#catalog" className="hidden text-sm font-bold uppercase tracking-widest text-slate-400 transition hover:text-sky sm:block">
                    В каталог
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedProducts.map((item) => (
                    <Link key={item.id} to={getProductPath(item)} className="group rounded-3xl border border-slate-700 bg-slate-800 p-4 transition hover:border-sky/50">
                      <img src={item.image} alt={item.title} className="h-56 w-full rounded-2xl object-cover transition group-hover:scale-[1.02]" />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black uppercase text-white-alt">{item.title}</h3>
                          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{item.description}</p>
                        </div>
                        <p className="shrink-0 font-black text-sky">{item.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
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
