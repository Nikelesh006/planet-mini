import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ProductResponse } from "@shared/routes";
import { apiFetch } from '../lib/api';



// API types

interface ProductQueryParams {

  category?: string;

  subcategory?: string;

  search?: string;

  includeDrafts?: boolean;

}

const sortProductsForDisplay = (products: ProductResponse[]) => {
  return [...products].sort((a, b) => {
    const aBoosted = a.isBoosted === true;
    const bBoosted = b.isBoosted === true;

    if (aBoosted !== bBoosted) {
      return aBoosted ? -1 : 1;
    }

    const aBoostTime = a.boostUpdatedAt ? new Date(String(a.boostUpdatedAt)).getTime() : 0;
    const bBoostTime = b.boostUpdatedAt ? new Date(String(b.boostUpdatedAt)).getTime() : 0;

    if (aBoostTime !== bBoostTime) {
      return bBoostTime - aBoostTime;
    }

    const aDraft = (a.status || "").toLowerCase() === "draft";
    const bDraft = (b.status || "").toLowerCase() === "draft";
    if (aDraft !== bDraft) {
      return aDraft ? 1 : -1;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
};



// Fetch products from API

const fetchProducts = async (params?: ProductQueryParams): Promise<ProductResponse[]> => {

  const queryParams = new URLSearchParams();

  

  if (params?.category) queryParams.append('category', params.category);

  if (params?.subcategory) queryParams.append('subcategory', params.subcategory);

  if (params?.search) queryParams.append('search', params.search);

  if (params?.includeDrafts) queryParams.append('includeDrafts', 'true');

  

  const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  

  const response = await apiFetch(url);

  if (!response.ok) {

    throw new Error('Failed to fetch products');

  }

  

  return response.json();

};



// Fetch single product by slug

const fetchProduct = async (slug: string): Promise<ProductResponse> => {

  const response = await apiFetch(`/api/products/${slug}`);

  if (!response.ok) {

    throw new Error('Failed to fetch product');

  }

  

  return response.json();

};



// Fetch single product by ID (for edit functionality)

const fetchProductById = async (id: string): Promise<ProductResponse> => {

  const response = await apiFetch(`/api/products/id/${id}`);

  if (!response.ok) {

    throw new Error('Failed to fetch product');

  }

  

  return response.json();

};



// Fetch single product by slug

const fetchProductBySlug = async (slug: string): Promise<ProductResponse | undefined> => {

  const response = await apiFetch(`/api/products/${slug}`);

  if (!response.ok) {

    if (response.status === 404) return undefined;

    throw new Error('Failed to fetch product');

  }

  

  return response.json();

};



// React Query hooks

export const useProducts = (params?: ProductQueryParams) => {
  const query = useQuery({

    queryKey: ['products', params],

    queryFn: () => fetchProducts(params),

    staleTime: 0,

    gcTime: 10 * 60 * 1000, // 10 minutes

    refetchOnMount: true,

  });

  const filteredData = params?.includeDrafts
    ? query.data
    : (query.data || []).filter(isVisibleInStorefront);

  return {
    ...query,
    data: filteredData ? sortProductsForDisplay(filteredData) : filteredData,
  };

};



export const useProductBySlug = (slug: string) => {

  return useQuery({

    queryKey: ['product', slug],

    queryFn: async () => {
      const product = await fetchProductBySlug(slug);
      return product && product.inStock === true ? product : null;
    },

    enabled: !!slug,

    staleTime: 0,

    gcTime: 15 * 60 * 1000, // 15 minutes

    refetchOnMount: true,

  });

};



export const useProduct = (slug: string) => {

  return useQuery({

    queryKey: ['product', slug],

    queryFn: async () => {
      const product = await fetchProduct(slug);
      return product && product.inStock === true ? product : null;
    },

    enabled: !!slug,

    staleTime: 0,

    gcTime: 15 * 60 * 1000, // 15 minutes

    refetchOnMount: true,

  });

};



export const useProductById = (id: string) => {

  return useQuery({

    queryKey: ['product', 'id', id],

    queryFn: () => fetchProductById(id),

    enabled: !!id,

    staleTime: 0,

    gcTime: 15 * 60 * 1000,

    refetchOnMount: true,

  });

};

export const useToggleBoostProduct = () => {
  const queryClient = useQueryClient();

  return async (productId: string, isBoosted: boolean) => {
    const response = await apiFetch(`/api/products/${productId}/boost`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isBoosted,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update boost status');
    }

    await response.json();
    queryClient.invalidateQueries({ queryKey: ['products'] });
    return true;
  };
};

const isVisibleInStorefront = (product: any) => product?.inStock === true;



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

// Shop by Style shows all home category products plus style category products
export const useShopByStyleProducts = () => {
  const { data: homeProducts, isLoading: homeLoading } = useHomeProducts();
  const { data: styleProducts, isLoading: styleLoading } = useStyleProducts();

  const combinedProducts = [
    ...(homeProducts || []),
    ...(styleProducts || [])
  ];

  return {
    data: combinedProducts,
    isLoading: homeLoading || styleLoading
  };
};



export const useLatestStyleProducts = () => {

  return useProducts({

    category: 'home', 

    subcategory: 'Latest Style Products'

  });

};



export const useBabyCareProducts = () => {
  const { data: homeProducts, isLoading } = useHomeProducts();
  const filteredProducts = (homeProducts || []).filter((product: any) =>
    product.visibleInNewArrivals === true
  );

  return {
    data: filteredProducts,
    isLoading
  };

};



export const useMuslinProducts = () => {
  const { data: homeProducts, isLoading } = useHomeProducts();
  const filteredProducts = (homeProducts || []).filter((product: any) =>
    product.visibleInTrendingProducts === true
  );

  return {
    data: filteredProducts,
    isLoading
  };

};



export const useComboProducts = () => {

  return useProducts({

    category: 'home',

    subcategory: "Blockbuster Combos"

  });

};

export const useBlockbusterProducts = () => {

  return useProducts({

    category: 'home',

    subcategory: "Blockbuster Combos"

  });

};



export const useGiftingProducts = () => {

  return useProducts({

    category: 'home',

    subcategory: 'Gifting'

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



// Delete product mutation hook

export const useDeleteProduct = () => {

  const queryClient = useQueryClient();



  return async (productId: string) => {

    const response = await apiFetch(`/api/products/${productId}`, {

      method: 'DELETE',

    });



    if (!response.ok) {

      throw new Error('Failed to delete product');

    }



    // Invalidate and refetch products query to update UI immediately

    queryClient.invalidateQueries({ queryKey: ['products'] });

    

    return response.json();

  };

};

