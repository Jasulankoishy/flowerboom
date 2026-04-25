import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types";

interface CartItem {
  productId: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  availability?: Product["availability"];
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        if (product.availability === "out_of_stock") return;

        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, price: product.price, image: product.image, availability: product.availability, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
                availability: product.availability,
              },
            ],
          };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const safeQuantity = Math.min(99, Math.max(1, quantity));
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: safeQuantity } : item
          ),
        }));
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = Number.parseFloat(String(item.price || "0").replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, ""));
          return total + (Number.isFinite(price) ? price : 0) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
