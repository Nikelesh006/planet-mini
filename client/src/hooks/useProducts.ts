import { useQuery } from '@tanstack/react-query';
import type { ProductResponse } from "@shared/routes";

// API types
interface ProductQueryParams {
  category?: string;
  subcategory?: string;
  search?: string;
}

// Fetch products from API
const fetchProducts = async (params?: ProductQueryParams): Promise<ProductResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.category) queryParams.append('category', params.category);
  if (params?.subcategory) queryParams.append('subcategory', params.subcategory);
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
};

// Fetch single product by slug
const fetchProduct = async (slug: string): Promise<ProductResponse> => {
  const response = await fetch(`/api/products/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
};

// Fetch single product by ID (for edit functionality)
const fetchProductById = async (id: string): Promise<ProductResponse> => {
  const response = await fetch(`/api/products/id/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
};

// Fetch single product by slug
const fetchProductBySlug = async (slug: string): Promise<ProductResponse | undefined> => {
  const response = await fetch(`/api/products/${slug}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
};

// React Query hooks
export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// Specialized hooks for common use cases
export const useStyleProducts = (subcategory?: string) => {
  return useProducts({
    category: 'style',
    ...(subcategory && { subcategory })
  });
};

export const useHomeProducts = (subcategory?: string) => {
  return useProducts({
    category: 'home',
    ...(subcategory && { subcategory })
  });
};

export const useSearchProducts = (searchTerm: string) => {
  return useProducts({
    search: searchTerm
  });
};

// Specific hooks for Home page sections
export const useShopByStyleProducts = () => {
  return useProducts({
    category: 'home',
    subcategory: 'Shop by Style'
  });
};

export const useLatestStyleProducts = () => {
  return useProducts({
    category: 'home', 
    subcategory: 'Latest Style Products'
  });
};

export const useBabyCareProducts = () => {
  return useProducts({
    category: 'home',
    subcategory: 'Baby Care Essentials'
  });
};

export const useSuperSaverProducts = () => {
  return useProducts({
    category: 'home',
    subcategory: 'Super Saver Offers'
  });
};

export const useFeaturedProducts = () => {
  return useProducts({
    category: 'home',
    subcategory: 'Featured Products'
  });
};
