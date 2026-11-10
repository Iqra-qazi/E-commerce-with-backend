import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "../types/product";
import { CartContext, type CartItem } from "./cart-context";

const CART_STORAGE_KEY = "atelier_cart";

function readCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            "product" in item &&
            "quantity" in item &&
            item.product &&
            typeof item.product === "object" &&
            typeof item.product._id === "string" &&
            typeof item.quantity === "number" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        ),
    );
  } catch (error) {
    console.error("Unable to read the saved cart:", error);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const itemsRef = useRef(items);

  const commitItems = useCallback((nextItems: CartItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save the cart:", error);
      toast.error("Your cart could not be saved on this device.");
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return 0;
    }

    const currentItems = itemsRef.current;
    const currentItem = currentItems.find((item) => item.product._id === product._id);
    const currentQuantity = currentItem?.quantity ?? 0;
    const quantityToAdd = Math.min(
      Math.max(1, Math.floor(quantity)),
      Math.max(0, product.stock - currentQuantity),
    );

    if (quantityToAdd === 0) {
      toast.error("You have already added all available stock.");
      return 0;
    }

    const nextItems = currentItem
      ? currentItems.map((item) =>
          item.product._id === product._id
            ? { product, quantity: item.quantity + quantityToAdd }
            : item,
        )
      : [...currentItems, { product, quantity: quantityToAdd }];
    commitItems(nextItems);
    toast.success(`${product.name} added to cart.`);
    return quantityToAdd;
  }, [commitItems]);

  const updateQty = useCallback((productId: string, quantity: number) => {
    commitItems(
      itemsRef.current.map((item) => {
        if (item.product._id !== productId) return item;
        const maxQuantity = Math.max(1, item.product.stock);
        return { ...item, quantity: Math.min(maxQuantity, Math.max(1, Math.floor(quantity))) };
      }),
    );
  }, [commitItems]);

  const removeItem = useCallback((productId: string) => {
    commitItems(itemsRef.current.filter((item) => item.product._id !== productId));
  }, [commitItems]);

  const clearCart = useCallback(() => commitItems([]), [commitItems]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    }),
    [items, addToCart, updateQty, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
