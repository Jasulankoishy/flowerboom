import { motion } from "motion/react";
import { useState } from "react";
import { X, Plus, Edit2, Trash2, Upload, LogOut } from "lucide-react";
import { useProducts } from "./hooks";
import { productsApi } from "./api";
import type { Product } from "./types";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { products, refetch } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append("imageUrl", formData.imageUrl);
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, formDataToSend);
      } else {
        await productsApi.create(formDataToSend);
      }

      await refetch();
      handleCloseForm();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      description: product.description,
      imageUrl: product.image
    });
    setImagePreview(product.image);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот товар?")) return;

    try {
      await productsApi.delete(id);
      await refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({ title: "", price: "", description: "", imageUrl: "" });
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div className="fixed inset-0 bg-[#0A0D0A] z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-serif text-[#F5F1E8] mb-2">Админ панель</h1>
              <p className="text-slate-400">Управление товарами</p>
            </div>
            <div className="flex gap-4">
              <motion.button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-sky text-ink font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Добавить товар
              </motion.button>
              <motion.button
                onClick={onLogout}
                className="flex items-center gap-2 px-6 py-3 border border-sky text-sky rounded hover:bg-sky hover:text-ink transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
                Выйти
              </motion.button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-[24px] p-6"
              >
                <div className="relative rounded-[100px_100px_24px_24px] overflow-hidden border border-slate-700/50 mb-4">
                  <div className="aspect-[3/4] bg-slate-800">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif text-xl text-[#F5F1E8] mb-1">{product.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{product.description}</p>
                    <p className="text-sky font-bold">{product.price} ₽</p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky/10 border border-sky/30 text-sky rounded hover:bg-sky hover:text-ink transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Изменить
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-800 border-2 border-sky/30 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {editingProduct ? "Изменить товар" : "Добавить товар"}
              </h2>
              <motion.button
                onClick={handleCloseForm}
                className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Изображение
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-600">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky/10 border border-sky/30 text-sky rounded cursor-pointer hover:bg-sky hover:text-ink transition-all">
                      <Upload className="w-5 h-5" />
                      Загрузить файл
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Или вставьте URL изображения"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Vintage Sahara"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="4500"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Элегантный букет в винтажном стиле"
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-sky text-ink font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all disabled:opacity-50"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Сохранение..." : editingProduct ? "Сохранить изменения" : "Добавить товар"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .glass-card {
          background: rgba(26, 29, 26, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </div>
  );
}
