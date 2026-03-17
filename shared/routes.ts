import { z } from 'zod';
import { products, insertProductSchema } from './schema';

// Create product schema for API responses
const productSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().nullable(),
  category: z.string(),
  subcategory: z.string().nullable(),
  image: z.string(),
  rating: z.number(),
  reviews: z.number(),
  inStock: z.boolean().nullable(),
  isNew: z.boolean().nullable(),
  colors: z.string().nullable(),
  sizes: z.string().nullable(),
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
