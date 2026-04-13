import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, Star, Minus, Plus, Share2, HelpCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLikes } from "@/contexts/LikeContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useProduct, useProductById } from "@/hooks/useProducts";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Handle case where slug is undefined
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/shop">
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if the slug is actually an ID (starts with "id/")
  const isProductId = slug.startsWith('id/');
  const actualSlug = isProductId ? slug.replace('id/', '') : slug;
  const productId = isProductId ? actualSlug : '';
  const productSlug = isProductId ? '' : actualSlug;

  console.log('🔍 ProductDetail Debug:', {
    originalSlug: slug,
    isProductId,
    actualSlug,
    productId,
    productSlug
  });

  // Use the appropriate hook based on the identifier type
  const { data: product, isLoading, error } = productId
    ? useProductById(productId)
    : useProduct(productSlug);

  console.log('🔍 ProductDetail Product Data:', { product, isLoading, error });

  const { addToCart } = useCart();
  const { toggleLike, isLiked } = useLikes();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  // Get all product images (main image + additional images if available)
  const productImages = [
    product?.image,
    ...((product as any)?.images || [])
  ].filter(Boolean);

  // Mock related products (keep this from original)
  const relatedProducts = [
    { id: 2, name: "Floral Summer Dress", price: "599.00", image: "/dress1.jpg" },
    { id: 3, name: "Cotton Baby Set", price: "899.00", image: "/set1.jpg" },
    { id: 4, name: "Baby Sun Hat", price: "299.00", image: "/hat1.jpg" },
    { id: 5, name: "Soft Baby Shoes", price: "399.00", image: "/shoes1.jpg" }
  ];

  // Image navigation functions
  const goToPreviousImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setSelectedImage((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (product?.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '') {
      const firstSize = product.sizes.split(',')[0]?.trim() || "";
      setSelectedSize(firstSize);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    console.error('ProductDetail Error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error ? `Error: ${error.message}` : 'The product you\'re looking for doesn\'t exist.'}
          </p>
          <Link href="/shop">
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    executeWithAuth(() => {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || undefined,
      });
      window.location.href = '/cart';
    });
  };

  const handleWishlist = () => {
    executeWithAuth(() => {
      toggleLike({
        id: Number(product.id),
        name: product.name,
        description: product.description || "",
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || null,
        rating: Number(product.rating),
        reviews: Number(product.reviews),
        inStock: product.inStock || null,
        isNew: product.isNew || null,
        colors: (product as any).colors || null,
        sizes: product.sizes || null,
      });
    });
  };

  const handleBuyNow = () => {
    executeWithAuth(() => {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || undefined,
      });
      window.location.href = '/cart';
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Shop</Link>
            <span>/</span>
            <span className="text-black font-medium">{product.name}</span>
          </nav>
        </div>

        {/* Product Details */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B7280' font-size='12' font-family='Arial'%3EProduct Image%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  {/* Image Navigation Arrows - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group"
                      >
                        <ChevronLeft className="w-6 h-6 text-black group-hover:text-primary transition-colors" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group"
                      >
                        <ChevronRight className="w-6 h-6 text-black group-hover:text-primary transition-colors" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? "border-black shadow-lg" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B7280' font-size='8' font-family='Arial'%3EView ${index + 1}%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                {/* Product Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-black">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-black">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Discount Code */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    Use code <span className="font-bold">'LB10'</span> for discount 10% on your first order.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Size Selection */}
                {product.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                    <div className="flex gap-2">
                      {product.sizes.split(',').map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size.trim())}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                            selectedSize === size.trim()
                              ? "border-black bg-black text-white"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {size.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy It Now
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        isLiked(Number(product.id)) 
                          ? 'fill-current text-red-500' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
                  </button>
                </div>

                {/* Social Links */}
                <div className="flex gap-6 text-sm text-gray-600">
                  <button className="flex items-center gap-2 hover:text-black transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    Ask a question
                  </button>
                  <button className="flex items-center gap-2 hover:text-black transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Stock Status */}
                <div className="text-sm">
                  {product.inStock ? (
                    <p className="text-green-600 font-medium">✓ In Stock</p>
                  ) : (
                    <p className="text-red-600 font-medium">✗ Out of Stock</p>
                  )}
                </div>
              </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-black mb-8">Pairs well with</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B7280' font-size='8' font-family='Arial'%3ERelated%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <h3 className="text-sm font-medium text-black group-hover:text-gray-700 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600">Rs. {relatedProduct.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </>
  );
}
