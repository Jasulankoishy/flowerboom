import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Eye, EyeOff, Plus, Sparkles, Trash2 } from "lucide-react";
import { showcaseApi, type ShowcaseSlideInput } from "../api";
import type { Product, ShowcaseSlide } from "../types";
import ImageUpload from "./ImageUpload";

interface AdminShowcasePanelProps {
  products: Product[];
}

const emptyForm: ShowcaseSlideInput = {
  title: "",
  description: "",
  image: "",
  productId: "",
  sortOrder: 1,
  isActive: true,
};

export default function AdminShowcasePanel({ products }: AdminShowcasePanelProps) {
  const [slides, setSlides] = useState<ShowcaseSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<ShowcaseSlide | null>(null);
  const [form, setForm] = useState<ShowcaseSlideInput>(emptyForm);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await showcaseApi.getAdmin();
      setSlides(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки витрины");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setForm({
      ...emptyForm,
      productId: products[0]?.id || "",
      sortOrder: slides.length + 1,
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (slide: ShowcaseSlide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      description: slide.description,
      image: slide.image,
      productId: slide.productId,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      if (editingSlide) {
        await showcaseApi.update(editingSlide.id, form);
      } else {
        await showcaseApi.create(form);
      }

      await loadSlides();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения витрины");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить слайд витрины?")) return;

    try {
      await showcaseApi.delete(id);
      await loadSlides();
    } catch (err: any) {
      setError(err.message || "Ошибка удаления слайда");
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    setForm((current) => ({
      ...current,
      productId,
      title: current.title || product?.title || "",
      description: current.description || product?.description || "",
      image: current.image || product?.image || "",
    }));
  };

  const canCreate = slides.length < 5 && products.length > 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white-alt">Витрина ({slides.length}/5)</h2>
          <p className="text-sm text-slate-400">Красивый анимированный блок на главной странице</p>
        </div>
        <button
          onClick={handleCreateClick}
          disabled={!canCreate}
          className="flex items-center gap-2 rounded bg-sky px-4 py-2 font-bold text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
          Добавить слайд
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {products.length === 0 && (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-200">
          Сначала добавьте хотя бы один товар, потом можно будет связать его со слайдом витрины.
        </div>
      )}

      {slides.length >= 5 && !editingSlide && (
        <div className="mb-4 rounded border border-sky/30 bg-sky/10 p-4 text-sky">
          Достигнут лимит: максимум 5 слайдов в витрине.
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-lg border-2 border-slate-700/50 bg-slate-800 p-6"
        >
          <h3 className="mb-4 text-lg font-bold text-white-alt">
            {editingSlide ? "Редактировать слайд" : "Новый слайд витрины"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Товар</label>
                <select
                  value={form.productId}
                  onChange={(event) => handleProductChange(event.target.value)}
                  className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-2 text-white-alt outline-none focus:border-sky"
                  required
                >
                  <option value="">Выберите товар</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} · {product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Порядок</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
                  className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-2 text-white-alt outline-none focus:border-sky"
                />
              </div>
            </div>

            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Большой заголовок"
              className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-2 text-white-alt outline-none focus:border-sky"
              required
            />

            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Красивое описание для hero"
              rows={3}
              className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-2 text-white-alt outline-none focus:border-sky"
              required
            />

            <ImageUpload value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} />

            <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 accent-sky"
              />
              Показывать на главной
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded bg-sky px-4 py-2 font-bold text-ink hover:brightness-110"
              >
                {editingSlide ? "Сохранить" : "Создать"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded bg-slate-700 px-4 py-2 text-white-alt hover:bg-slate-600"
              >
                Отмена
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <p className="py-12 text-center text-slate-400">Загрузка витрины...</p>
      ) : slides.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-sky" />
          <p className="text-lg font-bold text-white-alt">Витрина пока пустая</p>
          <p className="mt-2 text-slate-400">Пока слайдов нет, главная будет показывать старый hero.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {slides.map((slide) => (
            <motion.article
              key={slide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 rounded-lg border-2 border-slate-700/60 bg-slate-800 p-4 md:grid-cols-[160px_1fr_auto] md:items-center"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="h-40 w-full rounded object-cover md:h-28"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-sky/30 bg-sky/10 px-2 py-1 text-xs font-bold text-sky">
                    #{slide.sortOrder}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${
                    slide.isActive
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-slate-600 bg-slate-700 text-slate-300"
                  }`}>
                    {slide.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {slide.isActive ? "Активен" : "Скрыт"}
                  </span>
                </div>
                <h3 className="font-bold text-white-alt">{slide.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{slide.description}</p>
                <p className="mt-2 text-sm font-bold text-sky">
                  Товар: {slide.product?.title || "Не найден"} · {slide.product?.price || ""}
                </p>
              </div>
              <div className="flex gap-2 md:flex-col">
                <button
                  onClick={() => handleEdit(slide)}
                  className="rounded border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="rounded border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
