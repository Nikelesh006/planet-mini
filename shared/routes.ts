import { z } from 'zod';
import { products, insertProductSchema } from './schema';

// Create product schema for API responses
const productSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  sku: z.string().optional(),
  name: z.string(),
  description: z.string(),
  sellingPrice: z.number(),
  mrp: z.number().nullable().optional(),
  category: z.string(),
  ageGroup: z.string().nullable().optional(),
  subcategory: z.string().nullable(),
  subcategoryItem: z.string().nullable().optional(),
  productClassification: z.string().nullable().optional(),
  styleGroup: z.string().nullable().optional(),
  styleVariant: z.string().nullable().optional(),
  hospitalBagsPackSize: z.string().nullable().optional(),
  image: z.string(),
  images: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  rating: z.number(),
  reviews: z.number(),
  inStock: z.boolean().nullable(),
  stockQuantity: z.number().nullable().optional(),
  lowStockAlert: z.number().nullable().optional(),
  isNew: z.boolean().nullable(),
  productType: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  showOnWebsite: z.boolean().nullable().optional(),
  visibleInNewArrivals: z.boolean().nullable().optional(),
  visibleInTrendingProducts: z.boolean().nullable().optional(),
  visibleInShopByStyle: z.boolean().nullable().optional(),
  isBoosted: z.boolean().nullable().optional(),
  boostUpdatedAt: z.union([z.string(), z.number()]).nullable().optional(),
  boostSections: z.array(z.string()).nullable().optional(),
  featuredProduct: z.boolean().nullable().optional(),
  bestSeller: z.boolean().nullable().optional(),
  recommendedProduct: z.boolean().nullable().optional(),
  collectionName: z.string().nullable().optional(),
  collectionPrintName: z.string().nullable().optional(),
  printName: z.string().nullable().optional(),
  colors: z.string().nullable(),
  sizes: z.string().nullable(),
  gender: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  fabric: z.string().nullable().optional(),
  colorTheme: z.string().nullable().optional(),
  careInstructions: z.string().nullable().optional(),
});

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: {
        200: z.array(productSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:slug' as const,
      responses: {
        200: productSchema,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
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

export type ProductListResponse = z.infer<typeof api.products.list.responses[200]>;
export type ProductResponse = z.infer<typeof api.products.get.responses[200]>;
