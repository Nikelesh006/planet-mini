import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { ProductResponse } from '@shared/routes';

export interface BundleItem {
  id: string;
  product: ProductResponse;
  quantity: number;
  variant?: string;
  selectedVariant?: number;
}

interface CustomBagBundleContextType {
  bundleItems: BundleItem[];
  bundleTotal: number;
  totalItems: number;
  addToBundle: (product: ProductResponse, quantity?: number, variant?: string, selectedVariant?: number) => void;
  removeFromBundle: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearBundle: () => void;
}

const CustomBagBundleContext = createContext<CustomBagBundleContextType | null>(null);

const BUNDLE_STORAGE_KEY = 'customBagBundle';

export function CustomBagBundleProvider({ children }: { children: ReactNode }) {
  const [bundleItems, setBundleItems] = useState<BundleItem[]>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(BUNDLE_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored bundle:', e);
          return [];
        }
      }
    }
    return [];
  });

  // Persist bundle to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(bundleItems));
  }, [bundleItems]);

  const addToBundle = useCallback((product: ProductResponse, quantity: number = 1, variant?: string, selectedVariant?: number) => {
    console.log('CustomBagBundleContext addToBundle called:', product);
    setBundleItems(prevItems => {
      console.log('Previous bundleItems:', prevItems);
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
        console.log('Updated existing item:', updatedItems);
        return updatedItems;
      } else {
        // Add new item
        const newItem: BundleItem = {
          id: `${product.id}-${variant || 'default'}`,
          product,
          quantity,
          variant,
          selectedVariant
        };
        const newItems = [...prevItems, newItem];
        console.log('Added new item:', newItems);
        return newItems;
      }
    });
  }, []);

  const removeFromBundle = useCallback((itemId: string) => {
    console.log('CustomBagBundleContext removeFromBundle called:', itemId);
    setBundleItems(prevItems => {
      console.log('Previous items before removal:', prevItems);
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('Items after removal:', newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromBundle(itemId);
      return;
    }

    setBundleItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromBundle]);

  const clearBundle = useCallback(() => {
    setBundleItems([]);
  }, []);

  const bundleTotal = bundleItems.reduce((total, item) => {
    return total + (Number(item.product.sellingPrice || 0) * item.quantity);
  }, 0);

  const totalItems = bundleItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CustomBagBundleContext.Provider
      value={{
        bundleItems,
        addToBundle,
        removeFromBundle,
        updateQuantity,
        clearBundle,
        bundleTotal,
        totalItems
      }}
    >
      {children}
    </CustomBagBundleContext.Provider>
  );
}

export function useCustomBagBundle() {
  const context = useContext(CustomBagBundleContext);
  if (!context) {
    throw new Error('useCustomBagBundle must be used within a CustomBagBundleProvider');
  }
  return context;
}
