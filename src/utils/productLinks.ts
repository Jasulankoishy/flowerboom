import type { Product } from "../types";

export const getProductPath = (product: Pick<Product, "id" | "slug">) => {
  return `/product/${product.slug || product.id}`;
};

export const getProductUrl = (product: Pick<Product, "id" | "slug">) => {
  return `${window.location.origin}${getProductPath(product)}`;
};
