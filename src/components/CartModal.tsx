import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Gift, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { ordersApi } from "../api/orders";
import { promoCodesApi, type PromoValidationResult } from "../api/promoCodes";
import { useAuthStore, useCartStore } from "../stores";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_TIMES = ["9:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"];

const formatMoney = (value: number) => `${value.toFixed(0)}₽`;

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [giftCardEnabled, setGiftCardEnabled] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [formData, setFormData] = useState({
    city: "",
    street: "",
    house: "",
    apartment: "",
    phone: "+7 ",
    deliveryDate: "",
    deliveryTime: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setAppliedPromo(null);
    setPromoError("");
  }, [items]);

  if (!isOpen) return null;

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handlePhoneInput = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) {
      setFormData((prev) => ({ ...prev, phone: "+7 " }));
      return;
    }

    if (cleaned[0] !== "7") cleaned = "7" + cleaned;
    cleaned = cleaned.slice(0, 11);

    if (cleaned.length <= 1) {
      setFormData((prev) => ({ ...prev, phone: "+7 " }));
    } else if (cleaned.length <= 4) {
      setFormData((prev) => ({ ...prev, phone: `+7 (${cleaned.slice(1)}` }));
    } else if (cleaned.length <= 7) {
      setFormData((prev) => ({ ...prev, phone: `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}` }));
    } else {
      setFormData((prev) => ({
        ...prev,
        phone: `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`,
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (items.length === 0) errors.items = "Корзина пуста";
    if (!formData.city.trim() || formData.city.trim().length < 2) errors.city = "Город: минимум 2 символа";
    if (!formData.street.trim() || formData.street.trim().length < 3) errors.street = "Улица: минимум 3 символа";
    if (!formData.house.trim()) errors.house = "Дом обязателен";
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) errors.phone = "Формат: +7 (XXX) XXX-XX-XX";
    if (!formData.deliveryDate) errors.deliveryDate = "Выберите дату доставки";
    if (!formData.deliveryTime) errors.deliveryTime = "Выберите время доставки";
    if (giftCardEnabled && giftMessage.trim().length > 300) errors.giftMessage = "Максимум 300 символов";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    setPromoError("");
    setAppliedPromo(null);

    if (!code) {
      setPromoError("Введите промокод");
      return;
    }

    setPromoLoading(true);
    try {
      const result = await promoCodesApi.validate(code, getTotalPrice());
      setAppliedPromo(result);
      setPromoCode(result.code);
    } catch (err: any) {
      setPromoError(err.message || "Промокод не найден");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isAuthenticated) {
      onClose();
      navigate("/auth");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      await ordersApi.create({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        city: formData.city.trim(),
        street: formData.street.trim(),
        house: formData.house.trim(),
        apartment: formData.apartment.trim() || undefined,
        phone: formData.phone,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        giftCardEnabled,
        giftMessage: giftCardEnabled ? giftMessage.trim() : undefined,
        promoCode: appliedPromo?.code,
      });

      clearCart();
      setSuccessMessage("Заказ оформлен");
      setTimeout(() => {
        onClose();
        navigate("/profile/orders");
      }, 800);
    } catch (err: any) {
      setError(err.error || err.message || "Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[94svh] w-full max-w-5xl overflow-y-auto rounded-lg border-2 border-sky/30 bg-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-800/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-sky sm:text-xs sm:tracking-[0.35em]">Smart checkout</p>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white-alt sm:text-2xl">Корзина</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-slate-600" />
            <p className="text-xl font-bold text-white-alt">Корзина пуста</p>
            <p className="mt-2 text-slate-400">Добавьте букет, и оформление появится здесь.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 border-b border-slate-700 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-3 sm:grid-cols-[88px_1fr] sm:gap-4 sm:p-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-[72px] rounded-[42px_42px_14px_14px] object-cover sm:h-24 sm:w-[88px] sm:rounded-[56px_56px_18px_18px]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white-alt">{item.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-sky">{item.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                        aria-label="Удалить из корзины"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded border border-slate-600 bg-slate-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 text-sky hover:bg-slate-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.productId, Number.parseInt(event.target.value, 10) || 1)}
                          className="h-9 w-12 bg-transparent text-center font-bold text-white-alt outline-none"
                          inputMode="numeric"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 text-sky hover:bg-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-sky/30 bg-sky/10 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-sky">Итого</p>
                {appliedPromo && (
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    <p>До скидки: {formatMoney(Number(appliedPromo.originalTotal))}</p>
                    <p className="text-green-300">Скидка {appliedPromo.code}: −{formatMoney(Number(appliedPromo.discountAmount))}</p>
                  </div>
                )}
                <p className="mt-2 text-3xl font-black text-white-alt sm:text-4xl">
                  {formatMoney(appliedPromo ? Number(appliedPromo.totalPrice) : getTotalPrice())}
                </p>
                <p className="mt-2 text-sm text-slate-400">Финальная сумма пересчитывается сервером по актуальным ценам.</p>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {error && <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
              {successMessage && <div className="rounded border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-300">{successMessage}</div>}
              {fieldErrors.items && <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{fieldErrors.items}</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input
                    value={formData.city}
                    onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="Город"
                    className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.city ? "border-red-500" : "border-slate-600"}`}
                  />
                  {fieldErrors.city && <p className="mt-1 text-sm text-red-400">{fieldErrors.city}</p>}
                </div>
                <div>
                  <input
                    value={formData.street}
                    onChange={(event) => setFormData((prev) => ({ ...prev, street: event.target.value }))}
                    placeholder="Улица"
                    className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.street ? "border-red-500" : "border-slate-600"}`}
                  />
                  {fieldErrors.street && <p className="mt-1 text-sm text-red-400">{fieldErrors.street}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    value={formData.house}
                    onChange={(event) => setFormData((prev) => ({ ...prev, house: event.target.value }))}
                    placeholder="Дом"
                    className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.house ? "border-red-500" : "border-slate-600"}`}
                  />
                  {fieldErrors.house && <p className="mt-1 text-sm text-red-400">{fieldErrors.house}</p>}
                </div>
                <input
                  value={formData.apartment}
                  onChange={(event) => setFormData((prev) => ({ ...prev, apartment: event.target.value }))}
                  placeholder="Квартира"
                  className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={formData.phone}
                  onInput={(event) => handlePhoneInput(event.currentTarget.value)}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.phone ? "border-red-500" : "border-slate-600"}`}
                />
                {fieldErrors.phone && <p className="mt-1 text-sm text-red-400">{fieldErrors.phone}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky" />
                    <input
                      type="date"
                      min={getMinDate()}
                      value={formData.deliveryDate}
                      onChange={(event) => setFormData((prev) => ({ ...prev, deliveryDate: event.target.value }))}
                      className={`w-full rounded border bg-slate-700 py-3 pl-10 pr-4 text-white-alt outline-none focus:border-sky ${fieldErrors.deliveryDate ? "border-red-500" : "border-slate-600"}`}
                    />
                  </div>
                  {fieldErrors.deliveryDate && <p className="mt-1 text-sm text-red-400">{fieldErrors.deliveryDate}</p>}
                </div>
                <div>
                  <select
                    value={formData.deliveryTime}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deliveryTime: event.target.value }))}
                    className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.deliveryTime ? "border-red-500" : "border-slate-600"}`}
                  >
                    <option value="">Время доставки</option>
                    {DELIVERY_TIMES.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {fieldErrors.deliveryTime && <p className="mt-1 text-sm text-red-400">{fieldErrors.deliveryTime}</p>}
                </div>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <label className="mb-3 block text-sm font-bold text-white-alt">Промокод</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value.toUpperCase());
                      setAppliedPromo(null);
                      setPromoError("");
                    }}
                    placeholder="LOVE10"
                    className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="rounded bg-sky px-5 py-3 font-bold text-ink hover:brightness-110 disabled:opacity-50"
                  >
                    {promoLoading ? "..." : "Применить"}
                  </button>
                </div>
                {appliedPromo && <p className="mt-2 text-sm text-green-300">Промокод применён</p>}
                {promoError && <p className="mt-2 text-sm text-red-400">{promoError}</p>}
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={giftCardEnabled}
                    onChange={(event) => setGiftCardEnabled(event.target.checked)}
                    className="h-5 w-5 accent-[#d4af37]"
                  />
                  <span className="flex items-center gap-2 font-bold text-white-alt">
                    <Gift className="h-5 w-5 text-sky" />
                    Добавить открытку
                  </span>
                </label>
                {giftCardEnabled && (
                  <div className="mt-4">
                    <textarea
                      value={giftMessage}
                      onChange={(event) => setGiftMessage(event.target.value)}
                      maxLength={300}
                      rows={4}
                      placeholder="Текст открытки"
                      className={`w-full rounded border bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky ${fieldErrors.giftMessage ? "border-red-500" : "border-slate-600"}`}
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                      <span>{fieldErrors.giftMessage || "До 300 символов"}</span>
                      <span>{giftMessage.length}/300</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-sky px-6 py-4 font-black uppercase tracking-widest text-ink transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Оформляем..." : `Оформить заказ ${formatMoney(appliedPromo ? Number(appliedPromo.totalPrice) : getTotalPrice())}`}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
