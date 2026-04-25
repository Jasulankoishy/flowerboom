import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { productsApi } from "../api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Фото должно быть меньше 2MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Только JPG, PNG, WEBP");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const data = await productsApi.uploadImage(file);
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Фото товара
      </label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-pink-500 transition bg-gray-800">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-3" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
            )}
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">Нажмите для загрузки</span> или перетащите
            </p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP (макс. 2MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
