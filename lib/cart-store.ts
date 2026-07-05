import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartSupplement {
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  productId: number;
  name: string;
  basePrice: number;
  image?: string;
  quantity: number;
  supplements: CartSupplement[];
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "cartId" | "quantity">) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, qty: number) => void;
  clearCart: () => void;
}

function makeCartId(productId: number, supplements: CartSupplement[]): string {
  const key = supplements
    .map((s) => s.name)
    .sort()
    .join(",");
  return `${productId}-${key}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (newItem) => {
        const cartId = makeCartId(newItem.productId, newItem.supplements);
        set((s) => {
          const existing = s.items.find((i) => i.cartId === cartId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { ...newItem, cartId, quantity: 1 }] };
        });
      },
      removeItem: (cartId) =>
        set((s) => ({ items: s.items.filter((i) => i.cartId !== cartId) })),
      updateQuantity: (cartId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.cartId !== cartId)
              : s.items.map((i) =>
                  i.cartId === cartId ? { ...i, quantity: qty } : i
                ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "casa-dulce-cart" }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const itemPrice =
      item.basePrice +
      item.supplements.reduce((s, sup) => s + sup.price, 0);
    return sum + itemPrice * item.quantity;
  }, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
