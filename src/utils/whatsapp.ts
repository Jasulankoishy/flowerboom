import type { Product } from "../types";

const DEFAULT_WHATSAPP_PHONE = "77064297949";

export const getWhatsappPhone = () => {
  return String(import.meta.env.VITE_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE).replace(/\D/g, "");
};

export const getWhatsappUrl = (message: string) => {
  const phone = getWhatsappPhone();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const getGeneralWhatsappUrl = () => {
  return getWhatsappUrl("Здравствуйте! Хочу заказать букет в Flowerboom.");
};

export const getProductWhatsappUrl = (product: Product) => {
  const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
  return getWhatsappUrl(`Здравствуйте! Хочу узнать про букет "${product.title}" (${product.price}). ${productUrl}`);
};
