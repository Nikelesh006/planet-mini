import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../lib/api';

interface LikedProduct {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  mrp: number | null;
  image: string;
  category: string;
  subcategory: string | null;
  rating: number;
  reviews: number;
  inStock: boolean | null;
  isNew: boolean | null;
  colors: string | null;
  sizes: string | null;
}

interface LikeContextType {
  likedProducts: LikedProduct[];
  toggleLike: (product: LikedProduct) => void;
  isLiked: (productId: string | number) => boolean;
  loading: boolean;
  removeFromLikes: (productId: string | number) => void;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

const BRAND = "#b4c49a";

export const LikeProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1] || localStorage.getItem('jwtToken');
  };

  // Load liked products from Profile API on mount or when user changes
  useEffect(() => {
    console.log('🔐 LikeContext: User changed', { user: user?.email, hasUser: !!user });
    
    if (!user) {
      console.log('🗑️ LikeContext: Clearing liked products - user logged out');
      setLikedProducts([]);
      return;
    }

    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const wishlistIds = await response.json();
        if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
          setLikedProducts([]);
          return;
        }

        // Fetch products list to populate wishlist items efficiently without triggering individual 404s
        const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
        if (productsResponse.ok) {
          const allProducts = await productsResponse.json();
          const validProductsMap = new Map();
          if (Array.isArray(allProducts)) {
            allProducts.forEach((product: any) => {
              if (product) {
                if (product.id) validProductsMap.set(String(product.id), product);
                if (product._id) validProductsMap.set(String(product._id), product);
              }
            });
          }

          const validLikedProducts = wishlistIds
            .map((id: string) => validProductsMap.get(String(id)))
            .filter(Boolean);

          setLikedProducts(validLikedProducts);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (product: LikedProduct) => {
    if (!user) {
      toast.error('Please login to like products');
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Add product to local state immediately
          const isLiked = likedProducts.some(p => p.id === product.id);
          
          console.log('LikeContext toggleLike:', {
            productId: product.id,
            productName: product.name,
            isLikedBefore: isLiked,
            currentLikedProducts: likedProducts.map(p => ({ id: p.id, name: p.name }))
          });
          
          if (!isLiked) {
            setLikedProducts(prev => [...prev, product]);
            toast.success('Added to likes ');
            console.log('Product added to likes:', product.name);
          } else {
            setLikedProducts(prev => prev.filter(p => p.id !== product.id));
            toast.success('Removed from likes ');
            console.log('Product removed from likes:', product.name);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update likes');
    } finally {
      setLoading(false);
    }
  };

  const isLiked = (productId: string | number) => {
    return likedProducts.some(p => p.id === productId);
  };

  const removeFromLikes = async (productId: string | number) => {
    if (!user) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setLikedProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Removed from likes');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from likes');
    }
  };

  return (
    <LikeContext.Provider value={{ 
      likedProducts, 
      toggleLike, 
      isLiked, 
      loading,
      removeFromLikes
    }}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikeContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};

