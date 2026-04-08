import { useState } from "react";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, Star, Minus, Plus, Share2, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";
import type { ProductResponse } from "@shared/routes";

// Mock product data - replace with actual API call
const mockProducts: ProductResponse[] = [
  {
    id: 1,
    name: "Daisy Glow-Baby Spaghetti Romper",
    slug: "daisy-glow-baby-spaghetti-romper",
    price: 499.00,
    originalPrice: 799.00,
    image: "/romper1.jpg",
    description: "Adorable spaghetti romper with daisy print, perfect for your little one's summer wardrobe.",
    category: "clothing",
    subcategory: "rompers",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    isNew: false,
    colors: "Yellow",
    sizes: "0-3 Months, 3-6 Months"
  }
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("0-3 Months");
  
  // Find product by slug - replace with actual API call
  const product = mockProducts.find(p => p.slug === slug) || mockProducts[0];
  
  const isWishlisted = wishlist.includes(product.id);
  
  // Mock additional images
  const productImages = [
    product.image,
    "/romper1-back.jpg",
    "/romper1-detail.jpg",
    "/romper1-side.jpg"
  ];
  
  // Mock related products
  const relatedProducts = [
    { id: 2, name: "Floral Summer Dress", price: "599.00", image: "/dress1.jpg" },
    { id: 3, name: "Cotton Baby Set", price: "899.00", image: "/set1.jpg" },
    { id: 4, name: "Baby Sun Hat", price: "299.00", image: "/hat1.jpg" },
    { id: 5, name: "Soft Baby Shoes", price: "399.00", image: "/shoes1.jpg" }
  ];

  const handleAddToCart = () => {
    executeWithAuth(() => {
      addToCart({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity,
        color: product.colors || undefined,
        size: selectedSize,
      });
      
      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
        variant: "success"
      });
    });
  };

  const handleWishlist = () => {
    executeWithAuth(() => {
      toggleWishlist(product.id);
    });
  };

  const handleBuyNow = () => {
    executeWithAuth(() => {
      addToCart({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity,
        color: product.colors || undefined,
        size: selectedSize,
      });
      
      // Redirect to checkout
      window.location.href = "/checkout";
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
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B7280' font-size='12' font-family='Arial'%3EProduct Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
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
                    Rs. {Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      Rs. {Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Discount Code */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    Use code <span className="font-bold">'LB10'</span> for discount 10% on your first order.
                  </p>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                  <div className="flex gap-2">
                    {["0-3 Months", "3-6 Months"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

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
                    <Heart className="w-5 h-5" />
                    Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy It Now
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
