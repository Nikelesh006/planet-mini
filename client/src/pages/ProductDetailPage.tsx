import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, Minus, Plus, Share2, ChevronLeft, ChevronRight, X, Copy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLikes } from "@/contexts/LikeContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useProduct, useProductById, useProducts } from "@/hooks/useProducts";
import { BabyCareCard } from "@/components/BabyCareCard";

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
          <Link href="/shop/style">
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

  // Fetch all products for related products section
  const { data: allProducts = [] } = useProducts();

  console.log('🔍 ProductDetail Product Data:', { product, isLoading, error });

  const { addToCart } = useCart();
  const { toggleLike, isLiked } = useLikes();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [openInfoSection, setOpenInfoSection] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  // Get related products for "Pairs well with" section
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];

    const currentProductId = product.id;
    const currentSubcategory = product.subcategory;
    const currentCategory = product.category;

    // Filter and sort related products
    const related = allProducts
      .filter((p: any) => p.id !== currentProductId) // Exclude current product
      .sort((a: any, b: any) => {
        // Priority 1: Same subcategory
        const aSameSub = a.subcategory === currentSubcategory;
        const bSameSub = b.subcategory === currentSubcategory;
        if (aSameSub && !bSameSub) return -1;
        if (!aSameSub && bSameSub) return 1;

        // Priority 2: Same category
        const aSameCat = a.category === currentCategory;
        const bSameCat = b.category === currentCategory;
        if (aSameCat && !bSameCat) return -1;
        if (!aSameCat && bSameCat) return 1;

        return 0;
      })
      .slice(0, 6); // Show max 6 related products

    return related;
  }, [product, allProducts]);

  // Get all product images (main image + additional images if available)
  // Deduplicate to prevent showing same image twice
  const mainImage = product?.image;
  const additionalImages = (product as any)?.images || [];
  const allImages = [mainImage, ...additionalImages].filter(Boolean);
  const productImages = Array.from(new Set(allImages));

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
          <Link href="/shop/style">
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
    });
  };

  const handleWishlist = () => {
    executeWithAuth(() => {
      toggleLike({
        id: product.id,
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

  const handleShare = async () => {
    setCopyStatus("idle");
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("copied");
    } catch (error: any) {
      setCopyStatus("error");
    }
  };

  const productInfoSections = [
    {
      id: "description",
      title: "Description",
      content: product.description || "Premium quality product thoughtfully made for your little one.",
    },
    {
      id: "shipping-returns",
      title: "Shipping and Returns",
      content:
        "Orders are carefully packed and shipped to your doorstep. Returns or exchanges are accepted as per store policy when the item is unused, unwashed, and returned in its original packaging.",
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content:
        "Product color may vary slightly due to lighting, screen settings, or photography. Size and print placement can have minor natural variations.",
    },
    {
      id: "care-instructions",
      title: "Care Instructions",
      content:
        "Wash gently with mild detergent. Avoid bleach and harsh chemicals. Dry in shade and iron on low heat if required.",
    },
    {
      id: "unboxing-video",
      title: "Unboxing Video Mandatory",
      content:
        "Please record a clear unboxing video before opening the package. This helps us verify any missing, damaged, or incorrect product claims quickly.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/shop/style" className="hover:text-black">Shop</Link>
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
              <div className="space-y-8">
                {/* Product Title */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-black">
                    {product.name}
                  </h1>
                  <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="hidden h-10 items-center gap-2 rounded-full border border-gray-300 px-4 font-medium text-gray-700 transition-colors hover:border-gray-500 hover:text-black sm:inline-flex"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    {product.inStock ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 font-medium text-green-700">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-700">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 flex items-center justify-between gap-4 sm:block">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-black sm:text-3xl">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through sm:text-lg">
                        ₹{Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-500 hover:text-black sm:hidden"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <p className="inline-block rounded-lg border border-[#B4C49A]/80 bg-[#B4C49A]/35 px-4 py-2 text-sm sm:text-base text-gray-800">
                  Use code <span className="font-semibold text-black">PM10</span> to get 10% off on your order.
                </p>

                {/* Product Information Accordion */}
                <div className="mt-8 border-y border-gray-200">
                  {productInfoSections.map((section) => {
                    const isOpen = openInfoSection === section.id;

                    return (
                      <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => setOpenInfoSection(isOpen ? null : section.id)}
                          className="w-full min-h-[50px] flex items-center justify-between gap-3 py-3 text-left"
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm sm:text-base font-semibold text-gray-950">
                            {section.title}
                          </span>
                          <Plus
                            className={`w-4 h-4 flex-shrink-0 text-gray-700 transition-transform duration-200 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="pb-4 pr-7 text-xs sm:text-sm leading-relaxed text-gray-700">
                            {section.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 sm:flex sm:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="h-11 min-w-0 bg-black text-white px-2 text-sm rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 whitespace-nowrap sm:h-auto sm:flex-1 sm:px-6 sm:py-3 sm:text-base sm:gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="h-11 min-w-0 bg-red-600 text-white px-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:h-auto sm:flex-1 sm:px-6 sm:py-3 sm:text-base"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors sm:w-12 sm:h-12"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors sm:w-5 sm:h-5 ${
                        isLiked(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600 hover:text-red-500 hover:fill-red-500'
                      }`} 
                    />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Pairs well with - Related Products */}
      {relatedProducts.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Pairs well with</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {relatedProducts.map((relatedProduct: any, index: number) => (
                <BabyCareCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-950">Copy link</h2>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#B4C49A]/20 hover:text-black"
                aria-label="Close copy link modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 bg-[#B4C49A]/20 px-6 py-7">
              <div className="flex items-center gap-3">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="min-w-0 flex-1 rounded-full border border-[#B4C49A]/70 bg-white/85 px-4 py-3 text-sm text-gray-700 outline-none"
                  aria-label="Product link"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#B4C49A] text-black shadow-sm transition-colors hover:bg-[#A6B889]"
                  aria-label="Copy product link"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>

              {copyStatus !== "idle" && (
                <p
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    copyStatus === "copied"
                      ? "border-[#B4C49A] bg-[#B4C49A]/45 text-gray-950"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {copyStatus === "copied"
                    ? "Copied link to clipboard."
                    : "Could not copy the link. Please try again."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </>
  );
}
