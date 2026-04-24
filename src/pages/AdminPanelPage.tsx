import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Banknote, ClipboardList, Edit2, Gift, LogOut, Package, Plus, ShoppingBag, Sparkles, Timer, Trash2 } from "lucide-react";
import { ordersApi, type AdminStats, type Order } from "../api/orders";
import AdminShowcasePanel from "../components/AdminShowcasePanel";
import ImageUpload from "../components/ImageUpload";
import { OCCASIONS, getOccasionLabel } from "../constants/occasions";
import { useProducts } from "../hooks";
import { useAuthStore } from "../stores";
import type { Product } from "../types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  confirmed: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  delivered: "border-green-500/40 bg-green-500/10 text-green-300",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
};

const STATUS_OPTIONS = ["all", "pending", "confirmed", "delivered", "cancelled"];

export default function AdminPanelPage() {
  const { logout } = useAuthStore();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "showcase">("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders(statusFilter);
    }
  }, [activeTab, statusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const loadOrders = async (status = statusFilter) => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await ordersApi.getAllOrders(status === "all" ? undefined : status);
      setOrders(data);
    } catch (err: any) {
      setOrdersError(err.message || "Ошибка загрузки заказов");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsError("");
    try {
      const data = await ordersApi.getAdminStats();
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message || "Ошибка загрузки статистики");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await ordersApi.updateStatus(id, status);
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
      await loadStats();
    } catch (err: any) {
      setOrdersError(err.message || "Ошибка обновления статуса");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      title: formData.get("title") as string,
      price: formData.get("price") as string,
      image: imageUrl,
      description: formData.get("description") as string,
      occasions: selectedOccasions,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }

    setShowForm(false);
    setEditingProduct(null);
    setImageUrl("");
    setSelectedOccasions([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageUrl(product.image);
    setSelectedOccasions(product.occasions || []);
    setShowForm(true);
  };

  const handleOccasionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOccasions(Array.from(event.target.selectedOptions, (option) => option.value));
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить товар?")) {
      await deleteProduct(id);
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="bg-slate-800 border-b-2 border-slate-700/50">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-sky" />
            <h1 className="text-2xl font-bold text-white-alt">Админ панель</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-bold transition-all sm:px-4 ${
                activeTab === "products"
                  ? "border-sky bg-sky text-ink"
                  : "border-slate-600 text-white-alt hover:border-sky"
              }`}
            >
              <Package className="w-4 h-4" />
              Товары
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-bold transition-all sm:px-4 ${
                activeTab === "orders"
                  ? "border-sky bg-sky text-ink"
                  : "border-slate-600 text-white-alt hover:border-sky"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Заказы
            </button>
            <button
              onClick={() => setActiveTab("showcase")}
              className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-bold transition-all sm:px-4 ${
                activeTab === "showcase"
                  ? "border-sky bg-sky text-ink"
                  : "border-slate-600 text-white-alt hover:border-sky"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Витрина
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/20 sm:px-4"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          {statsError && (
            <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
              {statsError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-sky/10 text-sky">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Товаров</p>
              <p className="mt-1 text-3xl font-black text-white-alt">{stats?.productsCount ?? products.length}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-blue-500/10 text-blue-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Заказов сегодня</p>
              <p className="mt-1 text-3xl font-black text-white-alt">{stats?.ordersToday ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-yellow-500/10 text-yellow-300">
                <Timer className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Ожидают</p>
              <p className="mt-1 text-3xl font-black text-white-alt">{stats?.pendingOrders ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-green-500/10 text-green-300">
                <Banknote className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Сумма заказов</p>
              <p className="mt-1 text-3xl font-black text-white-alt">{Number(stats?.totalRevenue ?? 0).toFixed(0)}₽</p>
            </div>
          </div>
        </section>

        {activeTab === "products" ? (
          <>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-white-alt">Товары ({products.length})</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setImageUrl("");
                  setSelectedOccasions([]);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-ink font-bold rounded hover:brightness-110 transition-all"
              >
                <Plus className="w-5 h-5" />
                Добавить товар
              </button>
            </div>

            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border-2 border-slate-700/50 rounded-lg p-6 mb-8"
              >
                <h3 className="text-lg font-bold text-white-alt mb-4">
                  {editingProduct ? "Редактировать товар" : "Новый товар"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    name="title"
                    defaultValue={editingProduct?.title}
                    placeholder="Название"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white-alt focus:outline-none focus:border-sky"
                    required
                  />
                  <input
                    name="price"
                    defaultValue={editingProduct?.price}
                    placeholder="Цена"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white-alt focus:outline-none focus:border-sky"
                    required
                  />
                  <ImageUpload value={imageUrl} onChange={setImageUrl} />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Поводы
                    </label>
                    <select
                      multiple
                      value={selectedOccasions}
                      onChange={handleOccasionSelect}
                      className="min-h-40 w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                    >
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion.slug} value={occasion.slug}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                      Можно выбрать несколько поводов через Ctrl или Shift.
                    </p>
                  </div>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description}
                    placeholder="Описание"
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white-alt focus:outline-none focus:border-sky"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky text-ink font-bold rounded hover:brightness-110"
                    >
                      {editingProduct ? "Сохранить" : "Создать"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                        setImageUrl("");
                        setSelectedOccasions([]);
                      }}
                      className="px-4 py-2 bg-slate-700 text-white-alt rounded hover:bg-slate-600"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {loading ? (
              <p className="text-slate-400 text-center">Загрузка...</p>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-4 rounded-lg border-2 border-slate-700/50 bg-slate-800 p-4 sm:flex-row sm:items-center"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-32 w-full rounded object-cover sm:h-20 sm:w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white-alt">{product.title}</h3>
                      <p className="text-sky font-bold">{product.price}</p>
                      <p className="text-sm text-slate-400 line-clamp-1">{product.description}</p>
                      {product.occasions?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.occasions.map((occasion) => (
                            <span
                              key={occasion}
                              className="rounded-full border border-sky/30 bg-sky/10 px-2 py-1 text-xs font-bold text-sky"
                            >
                              {getOccasionLabel(occasion)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "orders" ? (
          <section>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white-alt">Заказы ({orders.length})</h2>
                <p className="text-sm text-slate-400">Управление доставкой, статусами и открытками</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded border px-3 py-2 text-sm font-bold transition-all ${
                      statusFilter === status
                        ? "border-sky bg-sky text-ink"
                        : "border-slate-600 text-slate-300 hover:border-sky"
                    }`}
                  >
                    {status === "all" ? "Все" : STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {ordersError && (
              <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-4 text-red-300">
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <p className="py-12 text-center text-slate-400">Загрузка заказов...</p>
            ) : orders.length === 0 ? (
              <p className="rounded border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                Заказов пока нет
              </p>
            ) : (
              <div className="grid gap-5">
                {orders.map((order) => (
                  <motion.article
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border-2 border-slate-700/60 bg-slate-800 p-4 sm:p-5"
                  >
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="font-mono text-sm text-slate-400">#{order.id.slice(0, 8)}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="mt-2 text-white-alt">
                          {order.user?.email || "Клиент"} · {formatDate(order.createdAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {order.city}, {order.street}, д. {order.house}
                          {order.apartment ? `, кв. ${order.apartment}` : ""} · {order.phone}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Доставка: {order.deliveryDate}, {order.deliveryTime}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 md:items-end">
                        <select
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          className="rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white-alt outline-none focus:border-sky"
                        >
                          {STATUS_OPTIONS.filter((status) => status !== "all").map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                        <p className="text-2xl font-black text-sky">{order.totalPrice}₽</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded border border-slate-700 bg-slate-900/40 p-3">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div>
                            <p className="font-bold text-white-alt">{item.product.title}</p>
                            <p className="text-sm text-slate-400">
                              {item.quantity} шт. × {item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.giftCardEnabled && (
                      <div className="mt-4 rounded border border-sky/30 bg-sky/10 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                          <Gift className="h-4 w-4 text-sky" />
                          Открытка
                        </h4>
                        <p className="text-sm text-slate-300">{order.giftMessage || "Без текста"}</p>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <AdminShowcasePanel products={products} />
        )}
      </main>
    </div>
  );
}
