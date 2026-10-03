import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowDown, Pause, Play, Sparkles, Zap } from "lucide-react";
import { showcaseApi } from "../api";
import type { Product, ShowcaseSlide } from "../types";
import HeroSection from "./HeroSection";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

interface ProHeroShowcaseProps {
  onQuickOrder: (product: Product) => void;
}

export default function ProHeroShowcase({ onQuickOrder }: ProHeroShowcaseProps) {
  const [slides, setSlides] = useState<ShowcaseSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.25 });
  const { isDesktop, reducedMotion } = useMotionPreferences();
  const ambientMotion = isDesktop && !reducedMotion && inView && pageVisible;

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

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || !autoPlay || reducedMotion || !inView || !pageVisible || hovered || focused) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, isDesktop ? 6000 : 10000);
    return () => window.clearTimeout(timer);
  }, [slides.length, activeIndex, autoPlay, reducedMotion, inView, pageVisible, hovered, focused, isDesktop]);

  if (loading || slides.length === 0) {
    return <section ref={sectionRef} aria-label="Букеты FlowerBoom"><HeroSection /></section>;
  }

  const activeSlide = slides[activeIndex];
  const product = activeSlide.product;
  const canOrder = canOrderProduct(product);

  return (
    <section
      ref={sectionRef}
      aria-label="Букеты FlowerBoom"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className="relative mb-14 overflow-hidden rounded-3xl border border-sky/20 bg-[#0b0b09] p-4 shadow-2xl shadow-black/40 sm:p-6 lg:mb-24 lg:rounded-[2rem] lg:p-10"
    >
      <div data-depth="0" aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(212,175,55,0.2),transparent_50%),linear-gradient(135deg,#050505_0%,#0f1216_52%,#211706_100%)]" />
      <motion.div
        data-depth="1"
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-16 hidden h-64 w-64 rounded-full bg-sky/15 blur-3xl lg:block"
        animate={ambientMotion ? { scale: [1, 1.14, 1], opacity: [0.2, 0.38, 0.2] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: reducedMotion ? 0 : 8, repeat: ambientMotion ? Infinity : 0, ease: "easeInOut" }}
      />
      <motion.div
        data-depth="2"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-8 hidden text-[clamp(5rem,12vw,12rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.035] lg:block"
        animate={ambientMotion ? { x: [-8, 12, -8] } : { x: 0 }}
        transition={{ duration: reducedMotion ? 0 : 10, repeat: ambientMotion ? Infinity : 0, ease: "easeInOut" }}
      >Flower Boom</motion.div>

      <div className="relative grid min-w-0 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
        <motion.div
          data-depth="4"
          initial={reducedMotion ? false : { opacity: 0, y: isDesktop ? 16 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6 }}
          className="min-w-0 lg:order-1"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky sm:text-xs">
            <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0" />
            Цветочная витрина
          </p>

          {/* Shared grid space reserves the tallest title/description, so a slide change never moves the buttons. */}
          <div className="grid min-w-0">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                aria-hidden={index !== activeIndex}
                inert={index !== activeIndex}
                initial={false}
                animate={{ opacity: index === activeIndex ? 1 : 0, x: isDesktop && !reducedMotion && index !== activeIndex ? -24 : 0 }}
                transition={{ duration: reducedMotion ? 0 : isDesktop ? 0.65 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="col-start-1 row-start-1 min-w-0"
              >
                <h1 className="text-[clamp(1.9rem,7.5vw,4.8rem)] font-black uppercase leading-[1.05] tracking-[-0.05em] text-white-alt [overflow-wrap:anywhere]">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {slide.description}
                </p>
              </motion.div>
            ))}
          </div>

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
        </motion.div>

        <div data-depth="3" className="order-first min-w-0 lg:order-2">
          <motion.div
            animate={ambientMotion ? { y: [0, -10, 0] } : { y: 0 }}
            transition={{ duration: reducedMotion ? 0 : ambientMotion ? 7 : 0.35, repeat: ambientMotion ? Infinity : 0, ease: "easeInOut" }}
            className="relative aspect-square max-h-[420px] w-full rounded-2xl sm:aspect-[4/3] lg:aspect-square lg:max-h-[560px]"
          >
            {slides.map((slide, index) => (
              <motion.img
                key={slide.id}
                src={slide.image}
                alt={index === activeIndex ? slide.title : ""}
                aria-hidden={index !== activeIndex}
                width={620}
                height={620}
                initial={false}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  x: isDesktop && !reducedMotion && index !== activeIndex ? 48 : 0,
                  rotate: isDesktop && !reducedMotion && index !== activeIndex ? 2 : 0,
                  scale: isDesktop && !reducedMotion && index !== activeIndex ? 0.96 : 1,
                }}
                transition={{ duration: reducedMotion ? 0 : isDesktop ? 0.8 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 block h-full w-full rounded-2xl object-cover object-center shadow-xl shadow-black/30"
                referrerPolicy="no-referrer"
              />
            ))}
          </motion.div>
          <p className="mt-3 text-sm text-slate-300">{product.title}</p>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="relative mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Выбор букета в витрине">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => { setActiveIndex(index); setAutoPlay(false); }}
              aria-pressed={index === activeIndex}
              aria-label={`Показать букет: ${slide.title}`}
              className={`min-h-11 min-w-11 rounded-full border px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky ${
                index === activeIndex ? "border-sky bg-sky text-ink" : "border-white/20 text-white-alt hover:border-sky"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
          {!reducedMotion && (
            <button
              onClick={() => { setAutoPlay((current) => !current); setFocused(false); }}
              aria-label={autoPlay ? "Приостановить смену букетов" : "Включить смену букетов"}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white-alt transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
            >
              {autoPlay ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
