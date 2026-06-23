import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemDetails {
  id: string; // unique ID for cart row (productId + color + size)
  productId: number;
  slug: string;
  name: string;
  sellingPrice: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface AppState {
  cart: CartItemDetails[];
  wishlist: number[]; // Array of product IDs
  user: { name: string; email: string } | null;
  
  // Cart Actions
  addToCart: (item: Omit<CartItemDetails, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: number) => void;
  
  // User Actions
  login: (name: string, email: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      user: null,

      addToCart: (item) => set((state) => {
        const id = `${item.productId}-${item.color || 'none'}-${item.size || 'none'}`;
        const existing = state.cart.find((c) => c.id === id);
        
        if (existing) {
          return {
            cart: state.cart.map((c) =>
              c.id === id ? { ...c, quantity: c.quantity + item.quantity } : c
            ),
          };
        }
        return { cart: [...state.cart, { ...item, id }] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((c) =>
          c.id === id ? { ...c, quantity: Math.max(1, quantity) } : c
        ),
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
          ? state.wishlist.filter((id) => id !== productId)
          : [...state.wishlist, productId],
      })),

      login: (name, email) => set({ user: { name, email } }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'planet-mini-storage',
    }
  )
);
