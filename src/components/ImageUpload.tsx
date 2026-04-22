import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { API_URL, API_ENDPOINTS } from "../api/config";

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  adminToken: string;
}

export default function ImageUpload({
  currentImage,
  onUpload,
  adminToken,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Синхронизировать preview с currentImage
  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Проверка размера
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 5MB");
      return;
    }

    // Проверка формата
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Разрешены только JPG, PNG, WEBP");
      return;
    }

    // Показать локальное превью временно
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Загрузить на сервер
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}${API_ENDPOINTS.upload}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка загрузки");
      }

      const data = await res.json();
      // После успешной загрузки показываем URL с сервера
      setPreview(data.url);
      onUpload(data.url);
    } catch (err: any) {
      setError(err.message || "Не удалось загрузить фото. Попробуйте ещё раз");
      setPreview(currentImage || "");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onUpload("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Фото товара
      </label>

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-slate-600"
          />
          {loading && (
            <div className="absolute inset-0 bg-ink/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-sky border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white-alt font-bold">Загрузка...</p>
              </div>
            </div>
          )}
          {!loading && (
            <div className="absolute top-3 right-3 flex gap-2">
              <label className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white-alt font-bold rounded transition-all">
                Заменить фото
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRemove}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-slate-600 hover:border-sky rounded-lg p-12 text-center transition-all bg-slate-700/30 hover:bg-slate-700/50">
            <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-white-alt font-bold mb-2">
              Нажмите чтобы выбрать фото
            </p>
            <p className="text-slate-400 text-sm">
              JPG, PNG, WEBP • Максимум 5MB
            </p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
