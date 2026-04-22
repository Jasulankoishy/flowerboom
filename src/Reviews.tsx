import { motion } from "motion/react";
import { X, Star, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

interface ReviewsProps {
  product: any;
  onClose: () => void;
}

export default function Reviews({ product, onClose }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Пожалуйста, поставьте оценку");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          userName: userName || "Аноним"
        })
      });

      if (response.ok) {
        setRating(0);
        setComment("");
        setUserName("");
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-slate-800 border-2 border-sky/30 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-white-alt mb-2">
              {product.title}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(Number(averageRating))
                        ? "fill-sky text-sky"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-sky">{averageRating}</span>
              <span className="text-slate-400 text-sm">({reviews.length} отзывов)</span>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="mb-8">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-64 object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="mb-8 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <h3 className="text-xl font-bold text-white-alt mb-4 uppercase tracking-tight">
            Оставить отзыв
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Аноним"
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Оценка
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-sky text-sky"
                          : "text-slate-600 hover:text-slate-500"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full bg-sky text-ink font-bold uppercase tracking-widest py-4 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Отправка..." : "Отправить отзыв"}
              {!loading && <Send className="w-5 h-5" />}
            </motion.button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white-alt uppercase tracking-tight">
            Отзывы ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Пока нет отзывов. Будьте первым!
            </p>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white-alt">{review.userName}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(review.date).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-sky text-sky"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
