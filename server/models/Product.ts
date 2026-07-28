import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  sellingPrice: number;
  mrp?: number;
  category?: string;
  subcategory?: string;
  styleGroup?: string;
  styleVariant?: string;
  size?: string;
  color?: string;
  sizes?: string[];
  colors?: string[];
  sections?: string[];
  inStock?: boolean;
  status?: string;
  visibleInShopByStyle?: boolean;
  image?: string;
  images?: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sellingPrice: { type: Number, required: true },
    mrp: { type: Number },
    category: { type: String },
    subcategory: { type: String },
    styleGroup: { type: String, index: true },
    styleVariant: { type: String, index: true },
    size: { type: String, index: true },
    color: { type: String, index: true },
    sizes: { type: [String], default: [], index: true },
    colors: { type: [String], default: [], index: true },
    sections: { type: [String], default: ["Shop by Style"], index: true },
    inStock: { type: Boolean, default: true },
    status: { type: String, default: "Active" },
    visibleInShopByStyle: { type: Boolean, default: true },
    image: { type: String },
    images: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
