import { createContext } from "react";
import type { Product } from "../types/product";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => number;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

export const CartContext = createContext<CartContextValue | null>(null);
