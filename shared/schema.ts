import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sku: text("sku").notNull().unique(),
  sellingPrice: real("selling_price").notNull(),
  mrp: real("mrp"),
  category: text("category").notNull(), // style, age, care
  ageGroup: text("age_group"),
  subcategory: text("subcategory"),
  image: text("image").notNull(),
  rating: real("rating").notNull(),
  reviews: integer("reviews").notNull(),
  inStock: integer("in_stock", { mode: "boolean" }).default(true),
  stockQuantity: integer("stock_quantity").default(0),
  lowStockAlert: integer("low_stock_alert").default(0),
  isNew: integer("is_new", { mode: "boolean" }).default(false),
  isBoosted: integer("is_boosted", { mode: "boolean" }).default(false),
  boostUpdatedAt: text("boost_updated_at"),
  colors: text("colors"), // JSON string for SQLite
  sizes: text("sizes"), // JSON string for SQLite
  gender: text("gender"),
  occasion: text("occasion"),
  fabric: text("fabric"),
  colorTheme: text("color_theme"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// We'll handle Cart, Wishlist, and Orders purely in local storage on the frontend 
// as requested, or via simple mock endpoints if needed. To keep it strictly frontend-persisted,
// we don't strictly need DB tables for them, but we define the types here for consistency.

export const cartItemSchema = z.object({
  id: z.string(),
  productId: z.number(),
  quantity: z.number(),
  color: z.string().optional(),
  size: z.string().optional(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
  sellingPrice: z.number(),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const orderSchema = z.object({
  id: z.string(),
  items: z.array(orderItemSchema),
  total: z.number(),
  status: z.string(),
  date: z.string(),
  shippingDetails: z.object({
    name: z.string(),
    address: z.string(),
  }),
});
export type Order = z.infer<typeof orderSchema>;
