import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { bouquetInspiration } from "../constants/bouquetInspiration";
import "./BouquetInspiration.css";

export default function BouquetInspiration() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const active = bouquetInspiration[activeIndex];

  return (
    <section id="bouquet-inspiration" className="fb-inspiration" aria-labelledby="fb-inspiration-title">
      <div className="fb-inspiration-backdrop" data-depth="0" aria-hidden="true" />
      <div className="fb-inspiration-glow" data-depth="1" aria-hidden="true" />
      <motion.header
        className="fb-inspiration-header"
        data-depth="4"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <p className="fb-inspiration-eyebrow">Цветочные настроения</p>
          <h2 id="fb-inspiration-title">Букеты, в которые<br />влюбляются.</h2>
        </div>
        <p className="fb-inspiration-intro">Шесть идей для вдохновения.<br />Выберите букет, который ближе вам.</p>
      </motion.header>

      <div className="fb-inspiration-layout">
        <figure className="fb-inspiration-feature" data-depth="3">
          <div className="fb-inspiration-photo">
            {imageFailed ? (
              <p role="status" className="fb-inspiration-image-error">Не удалось загрузить фото.<br />Посмотрите оригинал по ссылке ниже.</p>
            ) : (
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.alt}
                width={736}
                height={736}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: active.position || "center" }}
                initial={reduceMotion ? false : { opacity: 0.5, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                onError={() => setImageFailed(true)}
              />
            )}
            <span className="fb-inspiration-photo-tag" data-depth="4">Подборка для вдохновения</span>
          </div>
          <figcaption className="fb-inspiration-caption" aria-live="polite" aria-atomic="true" data-depth="4">
            <div>
              <p className="fb-inspiration-counter">{String(activeIndex + 1).padStart(2, "0")} / 06</p>
              <h3>{active.title}</h3>
              <p className="fb-inspiration-description">{active.description}</p>
            </div>
            <a href={active.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Фото букета «${active.title}» на Pinterest`}>Pinterest <span aria-hidden="true">↗</span></a>
          </figcaption>
        </figure>

        <div className="fb-inspiration-selection" data-depth="4">
          <p className="fb-inspiration-selection-label">Найдите своё настроение</p>
          <div className="fb-inspiration-choices" role="group" aria-label="Выбор букета для просмотра">
            {bouquetInspiration.map((bouquet, index) => (
              <motion.button
                key={bouquet.id}
                type="button"
                className="fb-inspiration-choice"
                aria-pressed={index === activeIndex}
                aria-label={`Показать букет «${bouquet.title}»`}
                onClick={() => {
                  setActiveIndex(index);
                  setImageFailed(false);
                }}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.3, delay: index * 0.045 }}
              >
                <img src={bouquet.image} alt="" loading="lazy" decoding="async" width={92} height={108} style={{ objectPosition: bouquet.position || "center" }} />
                <span className="fb-inspiration-choice-copy">
                  <span className="fb-inspiration-choice-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="fb-inspiration-choice-title">{bouquet.title}</span>
                  <span className="fb-inspiration-choice-flowers">{bouquet.flowers}</span>
                </span>
                <span className="fb-inspiration-choice-arrow" aria-hidden="true">↗</span>
              </motion.button>
            ))}
          </div>
          <p className="fb-inspiration-note">Фотографии из Pinterest — примеры цветочных сочетаний. Доступные букеты и цены смотрите в каталоге.</p>
        </div>
      </div>
    </section>
  );
}
