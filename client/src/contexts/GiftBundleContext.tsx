import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { ProductResponse } from '../shared/routes';

export interface GiftBundleItem {
  id: string;
  product: ProductResponse;
  quantity: number;
  variant?: string;
  selectedVariant?: number;
}

interface GiftBundleContextType {
  giftBundleItems: GiftBundleItem[];
  giftBundleTotal: number;
  giftTotalItems: number;
  addToGiftBundle: (product: ProductResponse, quantity?: number, variant?: string, selectedVariant?: number) => void;
  removeFromGiftBundle: (itemId: string) => void;
  updateGiftQuantity: (itemId: string, newQuantity: number) => void;
  clearGiftBundle: () => void;
}

const GiftBundleContext = createContext<GiftBundleContextType | null>(null);

const GIFT_BUNDLE_STORAGE_KEY = 'giftBundle';

export function GiftBundleProvider({ children }: { children: ReactNode }) {
  const [giftBundleItems, setGiftBundleItems] = useState<GiftBundleItem[]>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GIFT_BUNDLE_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored gift bundle:', e);
          return [];
        }
      }
    }
    return [];
  });

  // Persist gift bundle to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(GIFT_BUNDLE_STORAGE_KEY, JSON.stringify(giftBundleItems));
  }, [giftBundleItems]);

  const addToGiftBundle = useCallback((product: ProductResponse, quantity: number = 1, variant?: string, selectedVariant?: number) => {
    console.log('GiftBundleContext addToGiftBundle called:', product);
    setGiftBundleItems(prevItems => {
      console.log('Previous giftBundleItems:', prevItems);
      // Check if product with same variant already exists
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.variant === variant
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        console.log('Updated existing gift item:', updatedItems);
        return updatedItems;
      } else {
        // Add new item
        const newItem: GiftBundleItem = {
          id: `${product.id}-${variant || 'default'}`,
          product,
          quantity,
          variant,
          selectedVariant
        };
        const newItems = [...prevItems, newItem];
        console.log('Added new gift item:', newItems);
        return newItems;
      }
    });
  }, []);

  const removeFromGiftBundle = useCallback((itemId: string) => {
    console.log('GiftBundleContext removeFromGiftBundle called:', itemId);
    setGiftBundleItems(prevItems => {
      console.log('Previous items before removal:', prevItems);
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('Items after removal:', newItems);
      return newItems;
    });
  }, []);

  const updateGiftQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromGiftBundle(itemId);
      return;
    }

    setGiftBundleItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromGiftBundle]);

  const clearGiftBundle = useCallback(() => {
    setGiftBundleItems([]);
  }, []);

  const giftBundleTotal = giftBundleItems.reduce((total, item) => {
    return total + (Number(item.product.sellingPrice || 0) * item.quantity);
  }, 0);

  const giftTotalItems = giftBundleItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <GiftBundleContext.Provider
      value={{
        giftBundleItems,
        addToGiftBundle,
        removeFromGiftBundle,
        updateGiftQuantity,
        clearGiftBundle,
        giftBundleTotal,
        giftTotalItems
      }}
    >
      {children}
    </GiftBundleContext.Provider>
  );
}

export function useGiftBundle() {
  const context = useContext(GiftBundleContext);
  if (!context) {
    throw new Error('useGiftBundle must be used within a GiftBundleProvider');
  }
  return context;
}
