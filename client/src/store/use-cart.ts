import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@shared/schema';

export interface EnrichedCartItem extends CartItem {
  product?: Product; // Stored alongside to avoid fetching waterfall in cart
}

interface CartState {
  items: EnrichedCartItem[];
  addItem: (item: EnrichedCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotolItems: () => number;
  getSubtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(
          (item) => item.productId === newItem.productId && item.color === newItem.color && item.size === newItem.size
        );
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          };
        }
        return { items: [...state.items, newItem] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      clearCart: () => set({ items: [] }),
      getTotolItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getSubtotal: () => get().items.reduce((total, item) => {
        const price = item.product ? Number(item.product.sellingPrice) : 0;
        return total + (price * item.quantity);
      }, 0),
    }),
    {
      name: 'planet-mini-cart',
    }
  )
);
