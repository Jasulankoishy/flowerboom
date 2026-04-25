export interface Product {
  id: string;
  index: string;
  slug?: string | null;
  title: string;
  image: string;
  price: string; // Строка в API ("4500"), не number!
  description: string;
  occasions: string[];
  isPublished: boolean;
  availability: "in_stock" | "out_of_stock" | "preorder";
}

export interface ShowcaseSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  productId: string;
  product: Product;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  availability?: Product["availability"];
}

export interface User {
  email: string;
  token: string;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  icon: "home" | "work" | "gift";
}

export interface ImportantDate {
  id: string;
  name: string;
  date: string;
  type: string;
}

export interface Order {
  id: string;
  userId: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  status: "pending" | "accepted" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
  totalPrice: string;
  originalTotalPrice?: string;
  discountAmount?: string;
  promoCode?: string;
  giftCardEnabled: boolean;
  giftMessage?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: string;
  createdAt: string;
}

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  city: string;
  street: string;
  house: string;
  apartment?: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  totalPrice?: string;
  giftCardEnabled?: boolean;
  giftMessage?: string;
  promoCode?: string;
  idempotencyKey?: string;
}
