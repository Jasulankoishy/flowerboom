import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Tag, Trash2 } from "lucide-react";
import { promoCodesApi, type PromoCode, type PromoCodeInput } from "../api";

const emptyForm: PromoCodeInput = {
  code: "",
  type: "percent",
  value: 10,
  isActive: true,
  expiresAt: "",
};

export default function AdminPromoCodesPanel() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoCodeInput>(emptyForm);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await promoCodesApi.getAll();
      setPromoCodes(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки промокодов");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPromoCode(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: Number(form.value),
        expiresAt: form.expiresAt || null,
      };

      if (editingPromoCode) {
        await promoCodesApi.update(editingPromoCode.id, payload);
      } else {
        await promoCodesApi.create(payload);
      }

      await loadPromoCodes();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения промокода");
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setForm({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      isActive: promoCode.isActive,
      expiresAt: promoCode.expiresAt ? promoCode.expiresAt.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить промокод?")) return;

    try {
      await promoCodesApi.delete(id);
      await loadPromoCodes();
    } catch (err: any) {
      setError(err.message || "Ошибка удаления промокода");
    }
  };

  const formatDiscount = (promoCode: PromoCode) => {
    return promoCode.type === "percent" ? `${promoCode.value}%` : `${promoCode.value.toFixed(0)}₽`;
  };

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white-alt">Промокоды ({promoCodes.length})</h2>
          <p className="text-sm text-slate-400">Скидки для корзины и заказов</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded bg-sky px-4 py-2 font-bold text-ink hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          Добавить промокод
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-lg border-2 border-slate-700/50 bg-slate-800 p-4 sm:p-6"
        >
          <h3 className="mb-4 text-lg font-bold text-white-alt">
            {editingPromoCode ? "Редактировать промокод" : "Новый промокод"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                placeholder="LOVE10"
                className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                required
              />
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as "percent" | "fixed" }))}
                className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
              >
                <option value="percent">Процент</option>
                <option value="fixed">Сумма</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                min="1"
                max={form.type === "percent" ? 100 : undefined}
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))}
                className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                required
              />
              <input
                type="date"
                value={form.expiresAt || ""}
                onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 accent-sky"
              />
              Активен
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded bg-sky px-4 py-2 font-bold text-ink hover:brightness-110">
                {editingPromoCode ? "Сохранить" : "Создать"}
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
        <p className="py-12 text-center text-slate-400">Загрузка промокодов...</p>
      ) : promoCodes.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
          <Tag className="mx-auto mb-4 h-10 w-10 text-sky" />
          <p className="text-lg font-bold text-white-alt">Промокодов пока нет</p>
          <p className="mt-2 text-slate-400">Создайте первый промокод для скидок в корзине.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promoCodes.map((promoCode) => (
            <article key={promoCode.id} className="flex flex-col gap-4 rounded-lg border-2 border-slate-700/50 bg-slate-800 p-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-sky/10 text-sky">
                <Tag className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-lg font-black text-white-alt">{promoCode.code}</h3>
                  <span className={`rounded-full border px-2 py-1 text-xs font-bold ${promoCode.isActive ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-slate-600 bg-slate-700 text-slate-300"}`}>
                    {promoCode.isActive ? "Активен" : "Выключен"}
                  </span>
                </div>
                <p className="mt-1 text-sky font-bold">Скидка: {formatDiscount(promoCode)}</p>
                <p className="text-sm text-slate-400">
                  {promoCode.expiresAt ? `До ${new Date(promoCode.expiresAt).toLocaleDateString("ru-RU")}` : "Без срока окончания"}
                </p>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <button
                  onClick={() => handleEdit(promoCode)}
                  className="rounded border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(promoCode.id)}
                  className="rounded border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
