import { useState, useEffect } from "react";
import { reviewsApi } from "../api";
import type { Review } from "../types";

export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewsApi.getByProductId(productId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const addReview = async (data: { rating: number; comment: string; userName: string }) => {
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.create(productId, data);
      await fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add review");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return {
    reviews,
    loading,
    error,
    addReview,
    refetch: fetchReviews,
    averageRating,
  };
};
