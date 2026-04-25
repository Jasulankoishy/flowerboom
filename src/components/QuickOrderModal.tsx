import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Gift, X } from "lucide-react";
import { useAuthStore } from "../stores";
import { ordersApi } from "../api/orders";
import type { Product, CreateOrderDto } from "../types";
import { useNavigate } from "react-router-dom";
import { canOrderProduct, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";

interface QuickOrderModalProps {
  product: Product;
  onClose: () => void;
}

const DELIVERY_TIMES = ["9:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"];

const createOrderKey = () => {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export default function QuickOrderModal({ product, onClose }: QuickOrderModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [giftCardEnabled, setGiftCardEnabled] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Form fields
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

  const priceValue = Number.parseFloat(product.price.replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, ""));
  const totalPrice = ((Number.isFinite(priceValue) ? priceValue : 0) * quantity).toFixed(2);
  const canOrder = canOrderProduct(product);

  // Format phone number on input
  const handlePhoneInput = (value: string) => {
    // Remove all non-digits except the +
    let cleaned = value.replace(/\D/g, "");

    // If starts with 7, keep it; otherwise add 7
    if (cleaned.length === 0) {
      setFormData((prev) => ({ ...prev, phone: "+7 " }));
      return;
    }

    if (cleaned[0] !== "7") {
      cleaned = "7" + cleaned;
    }

    // Limit to 11 digits (7 + 10 digits)
    cleaned = cleaned.slice(0, 11);

    // Format as +7 (XXX) XXX-XX-XX
    if (cleaned.length <= 1) {
      setFormData((prev) => ({ ...prev, phone: "+7 " }));
    } else if (cleaned.length <= 4) {
      const part1 = cleaned.slice(1);
      setFormData((prev) => ({ ...prev, phone: `+7 (${part1}` }));
    } else if (cleaned.length <= 7) {
      const part1 = cleaned.slice(1, 4);
      const part2 = cleaned.slice(4);
      setFormData((prev) => ({ ...prev, phone: `+7 (${part1}) ${part2}` }));
    } else {
      const part1 = cleaned.slice(1, 4);
      const part2 = cleaned.slice(4, 7);
      const part3 = cleaned.slice(7, 9);
      const part4 = cleaned.slice(9, 11);
      setFormData((prev) => ({
        ...prev,
        phone: `+7 (${part1}) ${part2}-${part3}-${part4}`,
      }));
    }
  };

  // Get minimum delivery date (today)
  const getMinDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = "Город: минимум 2 символа";
    }
    if (!formData.street || formData.street.trim().length < 3) {
      errors.street = "Улица: минимум 3 символа";
    }
    if (!formData.house || formData.house.trim().length === 0) {
      errors.house = "Дом обязателен";
    }
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      errors.phone = "Формат: +7 (XXX) XXX-XX-XX";
    }
    if (!formData.deliveryDate) {
      errors.deliveryDate = "Выберите дату доставки";
    }
    if (!formData.deliveryTime) {
      errors.deliveryTime = "Выберите время доставки";
    }
    if (giftCardEnabled && giftMessage.trim().length > 300) {
      errors.giftMessage = "Максимум 300 символов";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;

    setError("");
    setSuccessMessage("");

    if (!canOrder) {
      setError("Этот букет сейчас нельзя заказать");
      return;
    }

    if (!validateForm()) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = createOrderKey();
    }

    try {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: product.id,
            quantity: quantity,
          },
        ],
        city: formData.city.trim(),
        street: formData.street.trim(),
        house: formData.house.trim(),
        apartment: formData.apartment?.trim() || undefined,
        phone: formData.phone,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        totalPrice: totalPrice,
        giftCardEnabled,
        giftMessage: giftCardEnabled ? giftMessage.trim() : undefined,
        idempotencyKey: idempotencyKeyRef.current,
      };

      await ordersApi.create(orderData);

      idempotencyKeyRef.current = null;
      setSuccessMessage("Заказ оформлен 🌸");

      // Close modal after 1 second
      setTimeout(() => {
        onClose();
        // Redirect to orders page
        navigate("/profile/orders");
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.error || err.message || "Ошибка при оформлении заказа";
      setError(errorMsg);
      console.error("Order error:", err);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-2 backdrop-blur-sm sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-lg border-2 border-sky/30 bg-slate-800 p-5 text-center sm:p-8"
        >
          <h2 className="text-2xl font-bold text-white-alt mb-4">Оформить заказ</h2>
          <p className="text-slate-400 mb-8">Войдите чтобы оформить заказ</p>
          <button
            onClick={() => {
              onClose();
              navigate("/auth");
            }}
            className="w-full px-6 py-3 bg-sky text-ink font-bold rounded hover:brightness-110 transition-all"
          >
            Войти
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 px-6 py-3 bg-slate-700 text-white-alt font-bold rounded hover:bg-slate-600 transition-all"
          >
            Отмена
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-2 backdrop-blur-sm sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[94svh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-sky/30 bg-slate-800 p-4 sm:p-8"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white-alt sm:text-2xl">Быстрый заказ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white-alt" />
          </button>
        </div>

        {/* Product Block */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-slate-700/50 p-4 sm:flex-row sm:p-6">
          <img
            src={product.image}
            alt={product.title}
            className="h-28 w-full rounded-[32px_32px_18px_18px] object-cover sm:h-24 sm:w-24 sm:rounded-[100px_100px_24px_24px]"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white-alt">{product.title}</h3>
            <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
              <p className="text-sky font-bold">{product.price}</p>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${getAvailabilityClass(product.availability)}`}>
                {getAvailabilityLabel(product.availability)}
              </span>
            </div>

            {/* Quantity control */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white-alt rounded flex items-center justify-center font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(99, Math.max(1, val)));
                }}
                className="w-12 text-center bg-slate-600 text-white-alt rounded px-2 py-1 font-bold"
              />
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white-alt rounded flex items-center justify-center font-bold"
              >
                +
              </button>
              <div className="ml-auto min-w-24 text-right">
                <p className="text-sm text-slate-400">Итого</p>
                <p className="text-xl font-bold text-sky">{totalPrice}₽</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">{error}</div>}

          {/* Success message */}
          {successMessage && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {/* City */}
          <div>
            <input
              type="text"
              placeholder="Город"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all ${
                fieldErrors.city ? "border-red-500" : "border-slate-600"
              }`}
            />
            {fieldErrors.city && <p className="text-red-400 text-sm mt-1">{fieldErrors.city}</p>}
          </div>

          {/* Street */}
          <div>
            <input
              type="text"
              placeholder="Улица"
              value={formData.street}
              onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
              className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all ${
                fieldErrors.street ? "border-red-500" : "border-slate-600"
              }`}
            />
            {fieldErrors.street && <p className="text-red-400 text-sm mt-1">{fieldErrors.street}</p>}
          </div>

          {/* House & Apartment */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="Дом"
                value={formData.house}
                onChange={(e) => setFormData((prev) => ({ ...prev, house: e.target.value }))}
                className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all ${
                  fieldErrors.house ? "border-red-500" : "border-slate-600"
                }`}
              />
              {fieldErrors.house && <p className="text-red-400 text-sm mt-1">{fieldErrors.house}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Квартира (необязательно)"
                value={formData.apartment}
                onChange={(e) => setFormData((prev) => ({ ...prev, apartment: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              placeholder="+7 (XXX) XXX-XX-XX"
              value={formData.phone}
              onInput={(e) => handlePhoneInput(e.currentTarget.value)}
              className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all ${
                fieldErrors.phone ? "border-red-500" : "border-slate-600"
              }`}
            />
            {fieldErrors.phone && <p className="text-red-400 text-sm mt-1">{fieldErrors.phone}</p>}
          </div>

          {/* Delivery Date */}
          <div>
            <input
              type="date"
              min={getMinDate()}
              value={formData.deliveryDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))}
              className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt placeholder-slate-500 focus:outline-none focus:border-sky transition-all ${
                fieldErrors.deliveryDate ? "border-red-500" : "border-slate-600"
              }`}
            />
            {fieldErrors.deliveryDate && <p className="text-red-400 text-sm mt-1">{fieldErrors.deliveryDate}</p>}
          </div>

          {/* Delivery Time */}
          <div>
            <select
              value={formData.deliveryTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
              className={`w-full bg-slate-700 border rounded px-4 py-2 text-white-alt focus:outline-none focus:border-sky transition-all ${
                fieldErrors.deliveryTime ? "border-red-500" : "border-slate-600"
              }`}
            >
              <option value="">Выберите время доставки</option>
              {DELIVERY_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {fieldErrors.deliveryTime && <p className="text-red-400 text-sm mt-1">{fieldErrors.deliveryTime}</p>}
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
                  <span>{fieldErrors.giftMessage || "Работники напишут этот текст рядом с букетом"}</span>
                  <span>{giftMessage.length}/300</span>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={loading || !canOrder}
              className="flex-1 px-6 py-3 bg-sky text-ink font-bold rounded hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {!canOrder ? "Сейчас недоступно" : loading ? "Оформление..." : "Оформить заказ"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 text-white-alt font-bold rounded hover:bg-slate-600 transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
