import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
    const loadShowcase = async () => {
      try {
        const data = await showcaseApi.getPublic();
        setSlides(data);
      } catch (error) {
        console.error("Showcase loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShowcase();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <HeroSection />;
  }

  const activeSlide = slides[activeIndex];
  const product = activeSlide.product;
  const canOrder = canOrderProduct(product);

  return (
    <section className="relative mb-14 overflow-hidden rounded-3xl border border-sky/20 bg-[#050505] px-4 py-6 shadow-2xl shadow-black/40 sm:px-6 md:mb-24 md:rounded-[2rem] md:px-10 md:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(212,175,55,0.24),transparent_30%),radial-gradient(circle_at_24%_74%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,#050505_0%,#0f1216_52%,#211706_100%)]" />
      <motion.div
        className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-sky/20 blur-3xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.42, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-8 left-8 hidden text-[clamp(5rem,14vw,13rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.035] md:block"
        animate={{ x: [-12, 18, -12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        Flower Boom
      </motion.div>

      <div className="relative grid min-h-[auto] gap-8 lg:min-h-[620px] lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="z-10">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/30 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-sky sm:px-4 sm:text-xs sm:tracking-[0.28em]"
          >
            <Sparkles className="h-4 w-4" />
            Premium flower scene
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, x: 52, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -52, filter: "blur(10px)" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-slate-500 sm:text-sm sm:tracking-[0.45em]">
                Showcase {String(activeIndex + 1).padStart(2, "0")}
              </div>
              <h1 className="max-w-3xl text-[clamp(2.7rem,16vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white-alt md:text-7xl xl:text-8xl">
                {activeSlide.title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
                {activeSlide.description}
              </p>
              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                <div className="rounded-2xl border border-sky/30 bg-sky/10 px-4 py-3 text-xl font-black text-sky sm:px-5 sm:text-2xl">
                  {product.price}
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest ${getAvailabilityClass(product.availability)}`}>
                  {getAvailabilityLabel(product.availability)}
                </div>
                <button
                  onClick={() => onQuickOrder(product)}
                  disabled={!canOrder}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-sky px-5 py-4 text-xs font-black uppercase tracking-widest text-ink shadow-lg shadow-sky/20 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:hover:brightness-100 sm:px-6 sm:text-sm"
                >
                  <Zap className="h-5 w-5" />
                  {canOrder ? "Заказать" : "Нет в наличии"}
                </button>
                <button
                  onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-5 py-4 text-xs font-black uppercase tracking-widest text-white-alt transition-all hover:border-sky hover:text-sky sm:px-6 sm:text-sm"
                >
                  <ArrowDown className="h-5 w-5" />
                  Каталог
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative flex min-h-[320px] items-center justify-center sm:min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, x: 120, rotate: 4, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, x: -120, rotate: -5, scale: 0.92 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[620px]"
            >
              <motion.div
                className="absolute inset-8 rounded-full bg-sky/25 blur-3xl"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="relative z-10 mx-auto h-[320px] w-full rounded-3xl object-cover object-center shadow-2xl shadow-black/50 sm:h-[420px] md:h-[560px] md:rounded-[2rem]"
                referrerPolicy="no-referrer"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute -bottom-4 left-3 right-3 z-20 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl sm:left-6 sm:right-auto sm:px-5 sm:py-4">
                <p className="text-xs font-black uppercase tracking-[0.32em] text-sky">Linked bouquet</p>
                <p className="mt-1 font-bold text-white-alt">{product.title}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-20 mt-6 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex ? "w-10 bg-sky" : "w-2 bg-white/25 hover:bg-white/50"
            }`}
            aria-label={`Показать слайд ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
