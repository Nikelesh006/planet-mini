import { motion } from "framer-motion";

import { Link } from "wouter";

import { ShoppingCart, Star, Heart, Package, Plus, Minus } from "lucide-react";

import { useLikes } from "@/contexts/LikeContext";



interface Product {

  id: number;

  name: string;

  slug: string;

  description: string;

  price: number | string;

  originalPrice?: number | string;

  image: string;

  rating?: number;

  reviews?: number;

  inStock?: boolean;

  isNew?: boolean;

  category?: string;

  colors?: string[];

  sizes?: string[];

}



interface ProductGridProps {

  products: Product[];

  title?: string;

  showLoadMore?: boolean;

}



export default function ProductGrid({ products, title, showLoadMore = false }: ProductGridProps) {

  const { toggleLike, isLiked } = useLikes();

  const formatPrice = (price: number | string) => {

    const num = typeof price === 'string' ? parseFloat(price) : price;

    return `₹${num.toFixed(2)}`;

  };



  const getDiscountPercentage = (original: number | string | undefined, current: number | string) => {

    if (!original) return null;

    const orig = typeof original === 'string' ? parseFloat(original) : original;

    const curr = typeof current === 'string' ? parseFloat(current) : current;

    return Math.round(((orig - curr) / orig) * 100);

  };

  const navigateToProduct = (slug: string) => {
    window.location.href = `/products/${slug}`;
  };



  return (

    <div className="space-y-8">

      {title && (

        <div className="text-center">

          <h2 className="text-3xl font-bold text-primary mb-2">{title}</h2>

          <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>

        </div>

      )}

      

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {products.map((product, index) => (

          <motion.div

            key={product.id || `product-${index}`}

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            transition={{ delay: index * 0.1 }}

            className="group"

          >

            <div
              className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigateToProduct(product.slug)}
            >

              {/* Badges */}

              <div className="absolute top-3 left-3 z-10 flex gap-2">

                {product.isNew && (

                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">

                    New

                  </span>

                )}

                {!product.inStock && (

                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">

                    Out of Stock

                  </span>

                )}

              </div>

              

              {/* Discount Badge */}

              {product.originalPrice && (

                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">

                  -{getDiscountPercentage(product.originalPrice, product.price)}%

                </div>

              )}

              

              {/* Product Image */}

              <div className="aspect-square relative overflow-hidden bg-gray-50">

                <img 

                  src={product.image} 

                  alt={product.name} 

                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"

                />

                

                {/* Quick Actions */}

                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                  <button
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : undefined,
                        image: product.image,
                        category: product.category,
                        rating: product.rating,
                        reviews: product.reviews
                      });
                    }}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        isLiked(product.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
                  </button>

                  <button
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product.slug);
                    }}
                  >

                    <Plus className="w-4 h-4 text-gray-600" />

                  </button>

                </div>

              </div>

              

              {/* Product Info */}

              <div className="p-4">

                {/* Category */}

                <div className="mb-2">

                  <span className="text-xs text-gray-500 uppercase tracking-wide">

                    {product.category}

                  </span>

                </div>

                

                {/* Product Name */}

                <Link href={`/products/${product.slug}`}>

                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">

                    {product.name}

                  </h3>

                </Link>

                

                {/* Description */}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">

                  {product.description}

                </p>

                

                {/* Rating */}

                {product.rating && (

                  <div className="flex items-center gap-2 mb-3">

                    <div className="flex items-center">

                      {[...Array(5)].map((_, i) => (

                        <Star 

                          key={i} 

                          className={`w-4 h-4 ${

                            i < Math.floor(product.rating!) 

                              ? 'text-yellow-400 fill-current' 

                              : 'text-gray-300'

                          }`} 

                        />

                      ))}

                    </div>

                    <span className="text-xs text-gray-500">

                      ({product.reviews || 0})

                    </span>

                  </div>

                )}

                

                {/* Price and Add to Cart */}

                <div className="flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-lg font-bold text-gray-900">

                        {formatPrice(product.price)}

                      </span>

                      {product.originalPrice && (

                        <span className="text-sm text-gray-500 line-through">

                          {formatPrice(product.originalPrice)}

                        </span>

                      )}

                    </div>

                  </div>

                  

                  <button 

                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${

                      product.inStock 

                        ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg' 

                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'

                    }`}

                    disabled={!product.inStock}

                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product.slug);
                    }}

                  >

                    <ShoppingCart className="w-4 h-4" />

                  </button>

                </div>

              </div>

            </div>

          </motion.div>

        ))}

      </div>

      

      {showLoadMore && (

        <div className="text-center mt-12">

          <button className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">

            Load More Products

          </button>

        </div>

      )}

    </div>

  );

}

