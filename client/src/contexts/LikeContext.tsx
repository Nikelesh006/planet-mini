import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface LikedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

interface LikeContextType {
  likedProducts: LikedProduct[];
  toggleLike: (product: LikedProduct) => void;
  isLiked: (productId: number) => boolean;
  loading: boolean;
  removeFromLikes: (productId: number) => void;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Load liked products from localStorage on mount
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('likedProducts');
      if (savedLikes) {
        setLikedProducts(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error('Error loading liked products:', error);
    }
  }, []);

  // Save liked products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
  }, [likedProducts]);

  const toggleLike = (product: LikedProduct) => {
    setLoading(true);
    try {
      const isLiked = likedProducts.some(p => p.id === product.id);
      
      if (isLiked) {
        // Remove from likes
        const updated = likedProducts.filter(p => p.id !== product.id);
        setLikedProducts(updated);
        toast.success('Removed from likes ❤️');
      } else {
        // Add to likes
        setLikedProducts(prev => [...prev, product]);
        toast.success('Added to likes ❤️');
      }
    } catch (error) {
      toast.error('Failed to update likes');
    } finally {
      setLoading(false);
    }
  };

  const isLiked = (productId: number) => {
    return likedProducts.some(p => p.id === productId);
  };

  const removeFromLikes = (productId: number) => {
    const updated = likedProducts.filter(p => p.id !== productId);
    setLikedProducts(updated);
    toast.success('Removed from likes');
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
