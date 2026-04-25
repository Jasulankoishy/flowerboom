import type { Product } from "../types";

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "В наличии" },
  { value: "out_of_stock", label: "Нет в наличии" },
  { value: "preorder", label: "Под заказ" },
] as const;

export const getAvailabilityLabel = (availability?: Product["availability"]) => {
  return AVAILABILITY_OPTIONS.find((option) => option.value === availability)?.label || "В наличии";
};

export const getAvailabilityClass = (availability?: Product["availability"]) => {
  if (availability === "out_of_stock") return "border-red-500/40 bg-red-500/10 text-red-300";
  if (availability === "preorder") return "border-orange-500/40 bg-orange-500/10 text-orange-300";
  return "border-green-500/40 bg-green-500/10 text-green-300";
};

export const canOrderProduct = (product: Product) => product.availability !== "out_of_stock";
