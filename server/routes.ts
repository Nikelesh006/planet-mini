import type { Express } from "express";

import { createServer, type Server } from "http";

import { storage } from "./storage";

import { api } from "@shared/routes";

import { z } from "zod";

import profileRoutes from "./routes/profile-simple";



const mockProducts = [

  {

    slug: "classic-cotton-bodysuit",

    name: "Classic Cotton Bodysuit",

    description: "Soft, breathable 100% organic cotton bodysuit perfect for everyday wear.",

    price: "15.00",

    originalPrice: "20.00",

    category: "style",

    subcategory: "bodysuits",

    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",

    rating: "4.8",

    reviews: 124,

    inStock: true,

    isNew: true,

    colors: ["white", "pink", "blue"],

    sizes: ["0-3m", "3-6m", "6-9m", "9-12m"]

  },

  {

    slug: "knit-bunny-romper",

    name: "Knit Bunny Romper",

    description: "Adorable knit romper with bunny ears on the hood. Warm and cozy.",

    price: "28.50",

    originalPrice: "35.00",

    category: "style",

    subcategory: "rompers",

    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",

    rating: "4.9",

    reviews: 89,

    inStock: true,

    isNew: false,

    colors: ["pink", "grey"],

    sizes: ["3-6m", "6-9m", "9-12m"]

  },

  {

    slug: "denim-overalls-set",

    name: "Mini Denim Overalls Set",

    description: "Durable and stylish soft denim overalls with matching striped tee.",

    price: "32.00",

    originalPrice: null,

    category: "style",

    subcategory: "overalls",

    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",

    rating: "4.7",

    reviews: 56,

    inStock: true,

    isNew: false,

    colors: ["blue"],

    sizes: ["6-9m", "9-12m", "12-18m", "18-24m"]

  },

  {

    slug: "muslin-swaddle-blanket-3pack",

    name: "Muslin Swaddle Blanket 3-Pack",

    description: "Lightweight, breathable muslin swaddles in neutral earthy tones.",

    price: "24.00",

    originalPrice: "30.00",

    category: "care",

    subcategory: "blankets",

    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=600&auto=format&fit=crop",

    rating: "5.0",

    reviews: 210,

    inStock: true,

    isNew: false,

    colors: ["neutral"],

    sizes: ["one-size"]

  },

  {

    slug: "sleep-and-play-footie",

    name: "Sleep and Play Footie",

    description: "Zip-up footie pajamas for easy late-night changes. Super soft.",

    price: "18.00",

    originalPrice: null,

    category: "age",

    subcategory: "newborn",

    image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=600&auto=format&fit=crop",

    rating: "4.6",

    reviews: 145,

    inStock: true,

    isNew: true,

    colors: ["mint", "peach", "lavender"],

    sizes: ["nb", "0-3m", "3-6m"]

  },

  {

    slug: "plush-bear-lovey",

    name: "Plush Bear Lovey",

    description: "The perfect first companion for your little one. Soft plush bear head with attached blanket.",

    price: "16.00",

    originalPrice: null,

    category: "care",

    subcategory: "toys",

    image: "https://images.unsplash.com/photo-1559418306-036f0072cfa1?q=80&w=600&auto=format&fit=crop",

    rating: "4.9",

    reviews: 300,

    inStock: true,

    isNew: false,

    colors: ["beige", "brown"],

    sizes: ["one-size"]

  },

  {

    slug: "silicone-teething-ring",

    name: "Silicone Teething Ring",

    description: "BPA-free silicone teething ring. Easy for tiny hands to grasp and soothing on gums.",

    price: "12.00",

    originalPrice: "15.00",

    category: "care",

    subcategory: "teethers",

    image: "https://images.unsplash.com/photo-1628148782352-8705a67978d3?q=80&w=600&auto=format&fit=crop",

    rating: "4.8",

    reviews: 88,

    inStock: true,

    isNew: false,

    colors: ["sage", "rose", "slate"],

    sizes: ["one-size"]

  },

  {

    slug: "organic-cotton-beanie",

    name: "Organic Cotton Beanie",

    description: "Keep little heads warm with this stretchy, snug organic cotton beanie.",

    price: "10.00",

    originalPrice: null,

    category: "style",

    subcategory: "accessories",

    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",

    rating: "4.5",

    reviews: 67,

    inStock: true,

    isNew: true,

    colors: ["white", "grey", "mustard"],

    sizes: ["nb-3m", "3-6m"]

  },

  {

    slug: "ribbed-knit-sweater",

    name: "Ribbed Knit Sweater",

    description: "Chunky ribbed sweater for chilly days. Made with a soft cotton blend.",

    price: "26.00",

    originalPrice: "32.00",

    category: "style",

    subcategory: "sweaters",

    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",

    rating: "4.7",

    reviews: 42,

    inStock: true,

    isNew: false,

    colors: ["cream", "dusty-pink"],

    sizes: ["6-9m", "9-12m", "12-18m"]

  },

  {

    slug: "waterproof-bib-set",

    name: "Waterproof Bib Set (2-Pack)",

    description: "Catch all the spills with these easy-to-clean waterproof bibs featuring deep pockets.",

    price: "14.50",

    originalPrice: null,

    category: "care",

    subcategory: "feeding",

    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",

    rating: "4.9",

    reviews: 176,

    inStock: true,

    isNew: false,

    colors: ["blue-pattern", "pink-pattern"],

    sizes: ["one-size"]

  },

  {

    slug: "fleece-lined-booties",

    name: "Fleece-Lined Booties",

    description: "Keep tiny toes toasty with these ultra-soft fleece-lined booties with velcro closure.",

    price: "18.00",

    originalPrice: "22.00",

    category: "style",

    subcategory: "shoes",

    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=600&auto=format&fit=crop",

    rating: "4.8",

    reviews: 95,

    inStock: true,

    isNew: true,

    colors: ["tan", "charcoal"],

    sizes: ["0-6m", "6-12m", "12-18m"]

  },

  {

    slug: "bamboo-pacifier-clip",

    name: "Bamboo Pacifier Clip",

    description: "Never lose a pacifier again. Stylish bamboo beads with a sturdy wooden clip.",

    price: "9.50",

    originalPrice: null,

    category: "care",

    subcategory: "accessories",

    image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=600&auto=format&fit=crop",

    rating: "4.6",

    reviews: 112,

    inStock: true,

    isNew: false,

    colors: ["natural"],

    sizes: ["one-size"]

  },

  {

    slug: "hooded-bear-towel",

    name: "Hooded Bear Towel",

    description: "Make bath time fun with this highly absorbent, 100% cotton terry hooded towel.",

    price: "22.00",

    originalPrice: "28.00",

    category: "care",

    subcategory: "bath",

    image: "https://images.unsplash.com/photo-1559418306-036f0072cfa1?q=80&w=600&auto=format&fit=crop",

    rating: "5.0",

    reviews: 205,

    inStock: true,

    isNew: false,

    colors: ["white", "brown"],

    sizes: ["one-size"]

  },

  {

    slug: "portable-changing-mat",

    name: "Portable Changing Mat",

    description: "Wipeable, compact changing mat that folds up perfectly for your diaper bag.",

    price: "15.00",

    originalPrice: null,

    category: "care",

    subcategory: "gear",

    image: "https://images.unsplash.com/photo-1628148782352-8705a67978d3?q=80&w=600&auto=format&fit=crop",

    rating: "4.7",

    reviews: 84,

    inStock: true,

    isNew: true,

    colors: ["grey-chevron"],

    sizes: ["one-size"]

  },

  {

    slug: "scratch-mittens-3pack",

    name: "Scratch Mittens 3-Pack",

    description: "Soft cotton mittens to protect newborn skin from accidental scratches.",

    price: "8.00",

    originalPrice: "10.00",

    category: "style",

    subcategory: "accessories",

    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop",

    rating: "4.5",

    reviews: 62,

    inStock: true,

    isNew: false,

    colors: ["white", "multi"],

    sizes: ["nb"]

  },

  {

    slug: "wooden-milestone-cards",

    name: "Wooden Milestone Cards",

    description: "Beautifully engraved wooden discs to capture every month of your baby's first year.",

    price: "25.00",

    originalPrice: null,

    category: "care",

    subcategory: "gifts",

    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",

    rating: "4.9",

    reviews: 133,

    inStock: true,

    isNew: false,

    colors: ["wood"],

    sizes: ["one-size"]

  },

  {

    slug: "canvas-diaper-caddy",

    name: "Canvas Diaper Caddy",

    description: "Keep all your diapering essentials organized in this sturdy, multi-compartment caddy.",

    price: "20.00",

    originalPrice: "25.00",

    category: "care",

    subcategory: "organization",

    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",

    rating: "4.8",

    reviews: 97,

    inStock: true,

    isNew: true,

    colors: ["cream/grey"],

    sizes: ["one-size"]

  },

  {

    slug: "ruffle-sleeve-onesie",

    name: "Ruffle Sleeve Onesie",

    description: "Sweet everyday onesie with delicate ruffle details on the shoulders.",

    price: "16.00",

    originalPrice: null,

    category: "style",

    subcategory: "bodysuits",

    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=600&auto=format&fit=crop",

    rating: "4.7",

    reviews: 74,

    inStock: true,

    isNew: false,

    colors: ["blush", "ivory"],

    sizes: ["0-3m", "3-6m", "6-9m", "9-12m"]

  },

  {

    slug: "striped-jogger-pants",

    name: "Striped Jogger Pants",

    description: "Comfortable, relaxed-fit joggers with an elastic waistband and drawstring.",

    price: "18.00",

    originalPrice: "22.00",

    category: "style",

    subcategory: "bottoms",

    image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=600&auto=format&fit=crop",

    rating: "4.6",

    reviews: 58,

    inStock: true,

    isNew: true,

    colors: ["navy/white", "grey/white"],

    sizes: ["3-6m", "6-9m", "9-12m", "12-18m", "18-24m"]

  },

  {

    slug: "cable-knit-cardigan",

    name: "Cable Knit Cardigan",

    description: "Classic button-down cable knit cardigan for layering over any outfit.",

    price: "28.00",

    originalPrice: "34.00",

    category: "style",

    subcategory: "sweaters",

    image: "https://images.unsplash.com/photo-1559418306-036f0072cfa1?q=80&w=600&auto=format&fit=crop",

    rating: "4.9",

    reviews: 110,

    inStock: false,

    isNew: false,

    colors: ["navy", "maroon"],

    sizes: ["12-18m", "18-24m", "2T", "3T"]

  }

];



async function seedDatabase() {

  const existing = await storage.getProducts();

  if (existing.length === 0) {

    for (const p of mockProducts) {

      // Convert data types to match expected schema
      const productToCreate = {
        ...p,
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        rating: parseFloat(p.rating),
        inStock: p.inStock,
        isNew: p.isNew,
        colors: p.colors.join(','), // Convert array to comma-separated string
        sizes: p.sizes.join(',')    // Convert array to comma-separated string
      };

      await storage.createProduct(productToCreate);

    }

  }

}



export async function registerRoutes(

  httpServer: Server,

  app: Express

): Promise<Server> {

  

  await seedDatabase();



  app.get(api.products.list.path, async (req, res) => {

    try {

      // Define proper types for input
      interface ProductQueryInput {
        category?: string;
        search?: string;
      }

      // Safe input parsing with error handling
      let input: ProductQueryInput = {};
      try {
        const parsedInput = api.products.list.input ? api.products.list.input.parse(req.query) : undefined;
        input = parsedInput || {};
      } catch (parseError) {
        console.warn('Input parsing error:', parseError);
        input = {};
      }

      const allProducts = await storage.getProducts();

      

      let filtered = allProducts;

      if (input.category) {
        const categoryLower = input.category.toLowerCase();
        filtered = filtered.filter(p => 
          p.category?.toLowerCase() === categoryLower || 
          p.subcategory?.toLowerCase() === categoryLower
        );
      }

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(searchLower) || 
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      

      res.json(filtered);

    } catch (err) {

      res.status(400).json({ message: "Invalid query parameters" });

    }

  });



  app.get(api.products.get.path, async (req, res) => {

    const product = await storage.getProductBySlug(req.params.slug);

    if (!product) {

      return res.status(404).json({ message: "Product not found" });

    }

    res.json(product);

  });

  // Profile routes
  app.use('/api/profile', profileRoutes);



  return httpServer;

}

