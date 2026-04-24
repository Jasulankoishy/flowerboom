import { useState } from "react";
import { useAuthStore } from "../stores";
import { useProducts } from "../hooks";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, LogOut, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import ImageUpload from "../components/ImageUpload";

export default function AdminPanelPage() {
  const { logout } = useAuthStore();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      title: formData.get("title") as string,
      price: formData.get("price") as string,
      image: imageUrl,
      description: formData.get("description") as string,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }

    setShowForm(false);
    setEditingProduct(null);
    setImageUrl("");
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageUrl(product.image);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить товар?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="bg-slate-800 border-b-2 border-slate-700/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-sky" />
            <h1 className="text-2xl font-bold text-white-alt">Админ панель</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white-alt">Товары ({products.length})</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setImageUrl("");
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
                className="bg-slate-800 border-2 border-slate-700/50 rounded-lg p-4 flex items-center gap-4"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white-alt">{product.title}</h3>
                  <p className="text-sky font-bold">{product.price}</p>
                  <p className="text-sm text-slate-400 line-clamp-1">{product.description}</p>
                </div>
                <div className="flex gap-2">
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
      </main>
    </div>
  );
}
