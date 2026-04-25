import type { Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export const getProductPath = (product: Pick<Product, "id" | "slug">) => {
  return `/product/${product.slug || product.id}`;
};

export const getProductUrl = (product: Pick<Product, "id" | "slug">) => {
  return `${window.location.origin}${getProductPath(product)}`;
};

export const getProductShareUrl = (product: Pick<Product, "id" | "slug">) => {
  return `${API_URL.replace(/\/$/, "")}/share/product/${encodeURIComponent(product.slug || product.id)}`;
};
