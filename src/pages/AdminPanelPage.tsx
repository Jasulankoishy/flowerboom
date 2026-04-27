import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Banknote, BarChart3, Calendar, Circle, ClipboardList, Copy, Download, Edit2, ExternalLink, Gift, LineChart, LogOut, MapPin, Package, Phone, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Tag, Timer, Trash2, User } from "lucide-react";
import { adminExportApi, type ExportFormat, type ExportKind } from "../api";
import { ordersApi, type AdminAnalytics, type AdminStats, type Order } from "../api/orders";
import AdminPromoCodesPanel from "../components/AdminPromoCodesPanel";
import AdminShowcasePanel from "../components/AdminShowcasePanel";
import ImageUpload from "../components/ImageUpload";
import { OCCASIONS, getOccasionLabel } from "../constants/occasions";
import { AVAILABILITY_OPTIONS, getAvailabilityClass, getAvailabilityLabel } from "../constants/products";
import { useProducts } from "../hooks";
import { useAuthStore } from "../stores";
import type { Product } from "../types";
import { getProductPath, getProductShareUrl } from "../utils/productLinks";

const STATUS_LABELS: Record<string, string> = {
  pending: "Новый",
  accepted: "Принят",
  confirmed: "Принят",
  preparing: "Собираем",
  delivering: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  accepted: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  confirmed: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  preparing: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  delivering: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  delivered: "border-green-500/40 bg-green-500/10 text-green-300",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
};

const STATUS_OPTIONS = ["all", "pending", "accepted", "preparing", "delivering", "delivered", "cancelled"];
const EDITABLE_STATUS_OPTIONS = ["accepted", "preparing", "delivering", "delivered", "cancelled"];
const PRODUCT_FILTERS = [
  { value: "all", label: "Все" },
  { value: "published", label: "Опубликованные" },
  { value: "drafts", label: "Черновики" },
  { value: "in_stock", label: "В наличии" },
  { value: "out_of_stock", label: "Нет в наличии" },
  { value: "preorder", label: "Под заказ" },
] as const;

type ProductFilter = typeof PRODUCT_FILTERS[number]["value"];
type ProductSort = "newest" | "oldest" | "titleAsc" | "titleDesc" | "priceHigh" | "priceLow";

const parseMoney = (value: string) => Number.parseFloat(value.replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "")) || 0;

const getStatusHex = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#facc15",
    accepted: "#60a5fa",
    confirmed: "#60a5fa",
    preparing: "#c084fc",
    delivering: "#fb923c",
    delivered: "#4ade80",
    cancelled: "#f87171",
  };
  return colors[status] || "#94a3b8";
};

const formatChartDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
};

function OrdersLineChart({ data }: { data: AdminAnalytics["ordersByDay"] }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  const points = data.map((item, index) => {
    const x = 24 + index * (472 / Math.max(1, data.length - 1));
    const y = 130 - (item.count / max) * 96;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
      <div className="mb-4 flex items-center gap-2">
        <LineChart className="h-5 w-5 text-sky" />
        <h3 className="font-black text-white-alt">Заказы за 14 дней</h3>
      </div>
      <svg viewBox="0 0 520 160" className="h-40 w-full">
        <line x1="24" y1="130" x2="496" y2="130" stroke="#334155" strokeWidth="2" />
        <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const x = 24 + index * (472 / Math.max(1, data.length - 1));
          const y = 130 - (item.count / max) * 96;
          return <circle key={item.date} cx={x} cy={y} r="5" fill="#d4af37" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{data[0] ? formatChartDate(data[0].date) : "—"}</span>
        <span>Макс: {max}</span>
        <span>{data[data.length - 1] ? formatChartDate(data[data.length - 1].date) : "—"}</span>
      </div>
    </div>
  );
}

function OrdersStatusBars({ data }: { data: AdminAnalytics["ordersByStatus"] }) {
  const visible = data.filter((item) => item.count > 0);
  const items = visible.length ? visible : data;
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-sky" />
        <h3 className="font-black text-white-alt">Заказы по статусам</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.status}>
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-300">
              <span>{STATUS_LABELS[item.status] || item.status}</span>
              <span>{item.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: getStatusHex(item.status) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenuePieChart({ data }: { data: AdminAnalytics["revenueByStatus"] }) {
  const items = data.filter((item) => item.total > 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  let start = 0;
  const gradient = total > 0
    ? items.map((item) => {
      const percent = (item.total / total) * 100;
      const segment = `${getStatusHex(item.status)} ${start}% ${start + percent}%`;
      start += percent;
      return segment;
    }).join(", ")
    : "#334155 0% 100%";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Circle className="h-5 w-5 text-sky" />
        <h3 className="font-black text-white-alt">Выручка по статусам</h3>
      </div>
      <div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
        <div className="mx-auto h-36 w-36 rounded-full border border-slate-700" style={{ background: `conic-gradient(${gradient})` }} />
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">Пока нет выручки для графика</p>
          ) : items.map((item) => (
            <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getStatusHex(item.status) }} />
                {STATUS_LABELS[item.status] || item.status}
              </span>
              <span className="font-bold text-white-alt">{item.total.toFixed(0)}₽</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAnalyticsPanel({ analytics, loading, error }: { analytics: AdminAnalytics | null; loading: boolean; error: string }) {
  if (loading) {
    return <div className="rounded-lg border border-slate-700 bg-slate-800 p-5 text-slate-400">Загрузка аналитики...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-5 text-red-300">{error}</div>;
  }

  if (!analytics) return null;

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-sky" />
        <h2 className="text-xl font-black text-white-alt">Аналитика заказов</h2>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <OrdersLineChart data={analytics.ordersByDay} />
        <OrdersStatusBars data={analytics.ordersByStatus} />
        <RevenuePieChart data={analytics.revenueByStatus} />
      </div>
    </section>
  );
}

export default function AdminPanelPage() {
  const { logout } = useAuthStore();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "showcase" | "promo">("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [productSort, setProductSort] = useState<ProductSort>("newest");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [orderSort, setOrderSort] = useState<"newest" | "oldest" | "deliveryDate" | "totalHigh" | "totalLow">("newest");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    loadStats();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab, statusFilter, orderSearch, orderDateFrom, orderDateTo, orderSort]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await ordersApi.getAllOrders({
        status: statusFilter,
        q: orderSearch.trim(),
        dateFrom: orderDateFrom,
        dateTo: orderDateTo,
        sortBy: orderSort,
      });
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

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const data = await ordersApi.getAdminAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setAnalyticsError(err.message || "Ошибка загрузки аналитики");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await ordersApi.updateStatus(id, status);
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
      await loadStats();
      await loadAnalytics();
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
      isPublished: formData.get("isPublished") === "on",
      availability: formData.get("availability") as Product["availability"],
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

  const handleCopyProductLink = async (product: Product) => {
    const url = getProductShareUrl(product);

    try {
      await navigator.clipboard.writeText(url);
      alert("Ссылка на товар скопирована");
    } catch {
      window.prompt("Скопируйте ссылку на товар", url);
    }
  };

  const handleExport = async (kind: ExportKind, format: ExportFormat) => {
    const key = `${kind}-${format}`;
    setExporting(key);
    setExportError("");

    try {
      await adminExportApi.download(kind, format);
    } catch (err: any) {
      setExportError(err.message || "Ошибка экспорта");
    } finally {
      setExporting("");
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredProducts = products
    .filter((product) => {
      const query = productSearch.trim().toLowerCase();
      const matchesSearch = !query
        || product.title.toLowerCase().includes(query)
        || product.description.toLowerCase().includes(query)
        || product.price.toLowerCase().includes(query);

      const matchesFilter = productFilter === "all"
        || (productFilter === "published" && product.isPublished)
        || (productFilter === "drafts" && !product.isPublished)
        || product.availability === productFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((left, right) => {
      if (productSort === "titleAsc") return left.title.localeCompare(right.title, "ru");
      if (productSort === "titleDesc") return right.title.localeCompare(left.title, "ru");
      if (productSort === "priceHigh") return parseMoney(right.price) - parseMoney(left.price);
      if (productSort === "priceLow") return parseMoney(left.price) - parseMoney(right.price);

      const leftDate = new Date(left.createdAt || "1970-01-01").getTime();
      const rightDate = new Date(right.createdAt || "1970-01-01").getTime();
      return productSort === "oldest" ? leftDate - rightDate : rightDate - leftDate;
    });

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
              onClick={() => setActiveTab("promo")}
              className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-bold transition-all sm:px-4 ${
                activeTab === "promo"
                  ? "border-sky bg-sky text-ink"
                  : "border-slate-600 text-white-alt hover:border-sky"
              }`}
            >
              <Tag className="w-4 h-4" />
              Промокоды
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
          {exportError && (
            <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
              {exportError}
            </div>
          )}
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
          <AdminAnalyticsPanel analytics={analytics} loading={analyticsLoading} error={analyticsError} />
        </section>

        {activeTab === "products" ? (
          <>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-white-alt">Товары ({filteredProducts.length}/{products.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExport("products", "json")}
                  disabled={exporting === "products-json"}
                  className="flex items-center gap-2 rounded border border-slate-600 px-4 py-2 text-sm font-bold text-white-alt transition-all hover:border-sky disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </button>
                <button
                  onClick={() => handleExport("products", "csv")}
                  disabled={exporting === "products-csv"}
                  className="flex items-center gap-2 rounded border border-slate-600 px-4 py-2 text-sm font-bold text-white-alt transition-all hover:border-sky disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
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
            </div>

            <div className="mb-6 grid gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4 xl:grid-cols-[1.4fr_1fr_0.8fr]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky" />
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Поиск товара: название, описание, цена"
                  className="w-full rounded border border-slate-600 bg-slate-700 py-3 pl-10 pr-4 text-white-alt outline-none focus:border-sky"
                />
              </label>
              <select
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value as ProductFilter)}
                className="rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
              >
                {PRODUCT_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
              <select
                value={productSort}
                onChange={(event) => setProductSort(event.target.value as ProductSort)}
                className="rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="titleAsc">Название A-Z</option>
                <option value="titleDesc">Название Z-A</option>
                <option value="priceHigh">Цена выше</option>
                <option value="priceLow">Цена ниже</option>
              </select>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 xl:col-span-3">
                <SlidersHorizontal className="h-4 w-4 text-sky" />
                Фильтры работают по всем товарам админки, включая черновики.
              </div>
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt">
                      <input
                        name="isPublished"
                        type="checkbox"
                        defaultChecked={editingProduct?.isPublished ?? true}
                        className="h-5 w-5 accent-sky"
                      />
                      <span>
                        <span className="block font-bold">Опубликован</span>
                        <span className="text-xs text-slate-400">Если выключить, клиент товар не увидит.</span>
                      </span>
                    </label>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Наличие
                      </label>
                      <select
                        name="availability"
                        defaultValue={editingProduct?.availability || "in_stock"}
                        className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                      >
                        {AVAILABILITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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
            ) : filteredProducts.length === 0 ? (
              <p className="rounded border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                По этим фильтрам товаров не найдено
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${getAvailabilityClass(product.availability)}`}>
                          {getAvailabilityLabel(product.availability)}
                        </span>
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${
                          product.isPublished
                            ? "border-green-500/40 bg-green-500/10 text-green-300"
                            : "border-slate-500/40 bg-slate-500/10 text-slate-300"
                        }`}>
                          {product.isPublished ? "Опубликован" : "Черновик"}
                        </span>
                      </div>
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
                      <a
                        href={getProductPath(product)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-sky/10 border border-sky/30 text-sky rounded hover:bg-sky/20"
                        title="Открыть страницу товара"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleCopyProductLink(product)}
                        className="p-2 bg-green-500/10 border border-green-500/30 text-green-300 rounded hover:bg-green-500/20"
                        title="Скопировать ссылку"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
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
                <button
                  onClick={() => handleExport("orders", "json")}
                  disabled={exporting === "orders-json"}
                  className="rounded border border-slate-600 px-3 py-2 text-sm font-bold text-slate-300 transition-all hover:border-sky disabled:opacity-50"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport("orders", "csv")}
                  disabled={exporting === "orders-csv"}
                  className="rounded border border-slate-600 px-3 py-2 text-sm font-bold text-slate-300 transition-all hover:border-sky disabled:opacity-50"
                >
                  CSV
                </button>
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

            <div className="mb-6 grid gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky" />
                <input
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Поиск: телефон, имя, email, адрес, номер заказа"
                  className="w-full rounded border border-slate-600 bg-slate-700 py-3 pl-10 pr-4 text-white-alt outline-none focus:border-sky"
                />
              </label>
              <input
                type="date"
                value={orderDateFrom}
                onChange={(event) => setOrderDateFrom(event.target.value)}
                className="rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                title="Дата доставки с"
              />
              <input
                type="date"
                value={orderDateTo}
                onChange={(event) => setOrderDateTo(event.target.value)}
                className="rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
                title="Дата доставки по"
              />
              <select
                value={orderSort}
                onChange={(event) => setOrderSort(event.target.value as typeof orderSort)}
                className="rounded border border-slate-600 bg-slate-700 px-4 py-3 text-white-alt outline-none focus:border-sky"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="deliveryDate">По дате доставки</option>
                <option value="totalHigh">Сначала дорогие</option>
                <option value="totalLow">Сначала дешёвые</option>
              </select>
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
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                          <div className="rounded border border-slate-700 bg-slate-900/40 p-3">
                            <p className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                              <User className="h-4 w-4 text-sky" />
                              Кто заказал
                            </p>
                            <p>{order.user?.name || "Имя не указано"}</p>
                            <p className="break-all text-slate-400">{order.user?.email || "Email не указан"}</p>
                          </div>
                          <div className="rounded border border-slate-700 bg-slate-900/40 p-3">
                            <p className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                              <Phone className="h-4 w-4 text-sky" />
                              Номер клиента
                            </p>
                            <p>{order.phone}</p>
                            <p className="text-slate-500">Заказ от {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="rounded border border-slate-700 bg-slate-900/40 p-3">
                            <p className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                              <MapPin className="h-4 w-4 text-sky" />
                              Адрес
                            </p>
                            <p>
                              {order.city}, {order.street}, д. {order.house}
                              {order.apartment ? `, кв. ${order.apartment}` : ""}
                            </p>
                          </div>
                          <div className="rounded border border-slate-700 bg-slate-900/40 p-3">
                            <p className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                              <Calendar className="h-4 w-4 text-sky" />
                              Доставка
                            </p>
                            <p>{order.deliveryDate}, {order.deliveryTime}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:items-end">
                        <select
                          value={order.status === "confirmed" ? "accepted" : order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          className="rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white-alt outline-none focus:border-sky"
                        >
                          {EDITABLE_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                        <p className="text-2xl font-black text-sky">{order.totalPrice}₽</p>
                      </div>
                    </div>

                    {(order.promoCode || Number(order.discountAmount || 0) > 0) && (
                      <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-white-alt">
                          <Tag className="h-4 w-4 text-green-300" />
                          Промокод
                        </h4>
                        <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                          <p>Код: <span className="font-bold text-green-300">{order.promoCode || "—"}</span></p>
                          <p>До скидки: {order.originalTotalPrice || order.totalPrice}₽</p>
                          <p>Скидка: −{order.discountAmount || "0.00"}₽</p>
                        </div>
                      </div>
                    )}

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
        ) : activeTab === "showcase" ? (
          <AdminShowcasePanel products={products} />
        ) : (
          <AdminPromoCodesPanel />
        )}
      </main>
    </div>
  );
}
