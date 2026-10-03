import { useEffect, useState } from "react";
import { ArrowDown, Sparkles, Zap } from "lucide-react";
import { showcaseApi } from "../api";
import type { Product, ShowcaseSlide } from "../types";
import HeroSection from "./HeroSection";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";

interface ProHeroShowcaseProps {
  onQuickOrder: (product: Product) => void;
}

export default function ProHeroShowcase({ onQuickOrder }: ProHeroShowcaseProps) {
  const [slides, setSlides] = useState<ShowcaseSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadShowcase = async () => {
      try {
        const data = await showcaseApi.getPublic();
        if (!cancelled) setSlides(data);
      } catch (error) {
        console.error("Showcase loading error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadShowcase();
    return () => { cancelled = true; };
  }, []);

  if (loading || slides.length === 0) {
    return <HeroSection />;
  }

  const activeSlide = slides[activeIndex];
  const product = activeSlide.product;
  const canOrder = canOrderProduct(product);

  return (
    <section aria-label="Букеты FlowerBoom" className="relative mb-14 overflow-hidden rounded-3xl border border-sky/20 bg-[#0b0b09] p-4 sm:p-6 lg:mb-24 lg:rounded-[2rem] lg:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(212,175,55,0.14),transparent_55%)]" />

      <div className="relative grid min-w-0 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
        <div className="min-w-0 lg:order-1">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky sm:text-xs">
            <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0" />
            Цветочная витрина
          </p>

          <h1 className="text-[clamp(1.9rem,7.5vw,4.8rem)] font-black uppercase leading-[1.05] tracking-[-0.05em] text-white-alt [overflow-wrap:anywhere]">
            {activeSlide.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {activeSlide.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-sky/30 bg-sky/10 px-4 py-2 text-xl font-black text-sky">
              {product.price}
            </div>
            <div className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest sm:text-xs ${getAvailabilityClass(product.availability)}`}>
              {getAvailabilityLabel(product.availability)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => onQuickOrder(product)}
              disabled={!canOrder}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky px-4 py-3 text-xs font-black uppercase tracking-widest text-ink transition-colors hover:bg-[#e2bf4a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              <Zap aria-hidden="true" className="h-4 w-4 shrink-0" />
              {canOrder ? "Заказать" : "Нет в наличии"}
            </button>
            <button
              onClick={() => document.getElementById("catalog")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-white-alt transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
            >
              <ArrowDown aria-hidden="true" className="h-4 w-4 shrink-0" />
              Каталог
            </button>
          </div>
        </div>

        <div className="order-first min-w-0 lg:order-2">
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            width={620}
            height={620}
            className="block aspect-square max-h-[420px] w-full rounded-2xl object-cover object-center sm:aspect-[4/3] lg:aspect-square lg:max-h-[560px]"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
          <p className="mt-3 text-sm text-slate-300">{product.title}</p>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="relative mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Выбор букета в витрине">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              aria-pressed={index === activeIndex}
              aria-label={`Показать букет: ${slide.title}`}
              className={`min-h-11 min-w-11 rounded-full border px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky ${
                index === activeIndex ? "border-sky bg-sky text-ink" : "border-white/20 text-white-alt hover:border-sky"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
