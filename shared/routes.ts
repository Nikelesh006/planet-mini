export type ProductResponse = {
  id: number | string;
  slug: string;
  sku?: string;
  name: string;
  description: string;
  sellingPrice: number;
  mrp?: number | null;
  category: string;
  ageGroup?: string | null;
  subcategory: string | null;
  subcategoryItem?: string | null;
  productClassification?: string | null;
  styleGroup?: string | null;
  styleVariant?: string | null;
  hospitalBagsPackSize?: string | null;
  image: string;
  images?: string | string[] | null;
  rating: number;
  reviews: number;
  inStock: boolean | null;
  stockQuantity?: number | null;
  lowStockAlert?: number | null;
  isNew: boolean | null;
  productType?: string | null;
  status?: string | null;
  showOnWebsite?: boolean | null;
  visibleInNewArrivals?: boolean | null;
  visibleInTrendingProducts?: boolean | null;
  visibleInShopByStyle?: boolean | null;
  isBoosted?: boolean | null;
  boostUpdatedAt?: string | number | null;
  boostSections?: string[] | null;
  featuredProduct?: boolean | null;
  bestSeller?: boolean | null;
  recommendedProduct?: boolean | null;
  collectionName?: string | null;
  collectionPrintName?: string | null;
  printName?: string | null;
  colors: string | null;
  sizes: string | null;
  gender?: string | null;
  occasion?: string | null;
  fabric?: string | null;
  colorTheme?: string | null;
  careInstructions?: string | null;
};

export type ProductListResponse = ProductResponse[];

export const api = {
  products: {
    list: {
      method: "GET" as const,
      path: "/api/products" as const,
    },
    get: {
      method: "GET" as const,
      path: "/api/products/:slug" as const,
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/products/:id" as const,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
