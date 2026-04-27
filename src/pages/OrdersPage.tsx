import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuthStore } from "../stores";
import { ordersApi, type Order } from "../api/orders";
import { Package, MapPin, Phone, Calendar, Clock, Gift, Tag } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Новый заказ",
  accepted: "Принят",
  confirmed: "Принят",
  preparing: "Собираем",
  delivering: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  accepted: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  preparing: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  delivering: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  delivered: "bg-green-500/20 text-green-400 border-green-500/50",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: "Заказ получен, скоро администратор примет его в работу.",
  accepted: "Заказ принят, команда готовит букет к сборке.",
  confirmed: "Заказ принят, команда готовит букет к сборке.",
  preparing: "Букет сейчас собирают и готовят к доставке.",
  delivering: "Курьер уже в пути к указанному адресу.",
  delivered: "Заказ доставлен. Спасибо, что выбрали Flowerboom.",
  cancelled: "Заказ отменён. Если это ошибка, напишите нам в WhatsApp.",
};

const ORDER_STEPS = [
  { status: "accepted", label: "Принят" },
  { status: "preparing", label: "Собираем" },
  { status: "delivering", label: "В доставке" },
  { status: "delivered", label: "Доставлен" },
];

const getStepIndex = (status: string) => {
  if (status === "pending") return -1;
  if (status === "confirmed") return 0;
  return Math.max(0, ORDER_STEPS.findIndex((step) => step.status === status));
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getUserOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки заказов");
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-white-alt text-xl">Загрузка заказов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full px-6 py-3 bg-sky text-ink font-bold rounded hover:brightness-110 transition-all"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Package className="w-24 h-24 text-slate-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white-alt mb-4">
            У вас пока нет заказов
          </h2>
          <p className="text-slate-400 mb-8">
            Оформите первый заказ и он появится здесь
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-sky text-ink font-bold rounded hover:brightness-110 transition-all"
          >
            Перейти в каталог
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white-alt sm:text-4xl">Мои заказы</h1>
          <p className="text-slate-400">
            Здесь видно, где сейчас ваш заказ, когда доставка и что вы заказывали. Всего заказов: {orders.length}
          </p>
        </motion.div>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border-2 border-sky/30 bg-slate-800 p-4 sm:p-6"
            >
              {/* Header */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Заказ от {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    #{order.id.slice(0, 8)}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full border font-bold text-sm ${
                    STATUS_COLORS[order.status] || STATUS_COLORS.pending
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </div>
              </div>
              <div className="mb-6 rounded-lg border border-sky/30 bg-sky/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky">Где сейчас заказ</p>
                <p className="mt-2 text-white-alt">{STATUS_DESCRIPTIONS[order.status] || "Статус заказа обновляется."}</p>
              </div>

              {order.status !== "cancelled" && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ORDER_STEPS.map((step, stepIndex) => {
                    const active = stepIndex <= getStepIndex(order.status);
                    return (
                      <div
                        key={step.status}
                        className={`rounded-lg border p-3 text-center text-xs font-bold uppercase tracking-wider ${
                          active
                            ? "border-sky bg-sky/10 text-sky"
                            : "border-slate-700 bg-slate-900/40 text-slate-500"
                        }`}
                      >
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white-alt mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky" />
                  Товары
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                    className="flex gap-3 rounded-lg bg-slate-700/50 p-3 sm:gap-4 sm:p-4"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="h-14 w-14 shrink-0 rounded-[42px_42px_10px_10px] object-cover sm:h-16 sm:w-16 sm:rounded-[50px_50px_12px_12px]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white-alt font-bold">
                          {item.product.title}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {item.quantity} шт. × {item.price}₽
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sky font-bold">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky" />
                    Адрес доставки
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {order.city}, {order.street}, д. {order.house}
                    {order.apartment && `, кв. ${order.apartment}`}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky" />
                    Контакт
                  </h3>
                  <p className="text-slate-300 text-sm">{order.phone}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky" />
                    Дата доставки
                  </h3>
                  <p className="text-slate-300 text-sm">{order.deliveryDate}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky" />
                    Время доставки
                  </h3>
                  <p className="text-slate-300 text-sm">{order.deliveryTime}</p>
                </div>
              </div>

              {order.giftCardEnabled && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-sky" />
                    Открытка
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {order.giftMessage || "Без текста"}
                  </p>
                </div>
              )}

              {(order.promoCode || Number(order.discountAmount || 0) > 0) && (
                <div className="mb-6 rounded-lg bg-green-500/10 p-4 border border-green-500/30">
                  <h3 className="text-sm font-bold text-white-alt mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-300" />
                    Промокод
                  </h3>
                  <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                    <p>Код: <span className="font-bold text-green-300">{order.promoCode || "—"}</span></p>
                    <p>До скидки: {order.originalTotalPrice || order.totalPrice}₽</p>
                    <p>Скидка: −{order.discountAmount || "0.00"}₽</p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-700 pt-4">
                <span className="text-slate-400 font-bold">Итого:</span>
                <span className="text-2xl font-bold text-sky">
                  {order.totalPrice}₽
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-slate-700 text-white-alt font-bold rounded hover:bg-slate-600 transition-all"
          >
            Вернуться в каталог
          </button>
        </motion.div>
      </div>
    </div>
  );
}
