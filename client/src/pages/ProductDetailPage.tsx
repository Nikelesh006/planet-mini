import { motion, AnimatePresence } from "framer-motion";

import { useParams, Link } from "wouter";

import { Heart, ShoppingBag, Minus, Plus, Share2, ChevronLeft, ChevronRight, X, Copy, Trash2, Gift, Eye } from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";

import type { MouseEvent } from "react";

import { useCart } from "@/contexts/CartContext";

import { useLikes } from "@/contexts/LikeContext";

import { useAuthGuard } from "@/hooks/useAuthGuard";

import GoogleAuthModal from "@/components/auth/GoogleAuthModal";

import { useProduct, useProductById, useProducts } from "@/hooks/useProducts";

import { BabyCareCard } from "@/components/BabyCareCard";

import { getAvailableStock, isLowStock, isOutOfStock } from "@shared/stock";
import { useToast } from "@/hooks/use-toast";



const getCloudinaryImageUrl = (url: string, transformation: string) => {

  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {

    return url;

  }



  return url.replace("/image/upload/", `/image/upload/${transformation}/`);

};



export default function ProductDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const slug = params.slug as string;



  // Check for custom mode from URL

  const searchParams = new URLSearchParams(window.location.search);

  const customMode = searchParams.get("custom") === "true";



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



  console.log('🔍 ProductDetail Debug:', {

    slug

  });



  // Use the appropriate hook based on the identifier type

  const { data: product, isLoading, error } = useProduct(slug);



  // Fetch all products for related products section

  const { data: allProducts = [] } = useProducts();



  console.log('🔍 ProductDetail Product Data:', { product, isLoading, error });



  const { state, addToCart, removeFromCart } = useCart();

  const isProductInCart = product ? state.items.some(item => item.id === product.id.toString()) : false;

  const { toggleLike, isLiked } = useLikes();

  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();



  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const touchStartDistance = useRef(0);
  const touchStartScale = useRef(1);

  const [openInfoSection, setOpenInfoSection] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const [showStickyBar, setShowStickyBar] = useState(false);

  const [isStickyBarDismissed, setIsStickyBarDismissed] = useState(false);

  const [viewerCount, setViewerCount] = useState(() => Math.floor(Math.random() * 20) + 1);

  const availableStock = getAvailableStock(product);

  const outOfStock = isOutOfStock(product);

  const lowStock = isLowStock(product);



  useEffect(() => {

    const handleScroll = () => {

      // Show sticky bar almost immediately when scrolled down

      if (window.scrollY > 100) {

        setShowStickyBar(true);

      } else {

        setShowStickyBar(false);

      }

    };



    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [selectedImage]);



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

        const aBoosted = a.isBoosted === true;

        const bBoosted = b.isBoosted === true;

        if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;



        const aBoostTime = a.boostUpdatedAt ? new Date(String(a.boostUpdatedAt)).getTime() : 0;

        const bBoostTime = b.boostUpdatedAt ? new Date(String(b.boostUpdatedAt)).getTime() : 0;

        if (aBoostTime !== bBoostTime) return bBoostTime - aBoostTime;



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

  const rawImages = (product as any)?.images;

  const additionalImages: string[] = Array.isArray(rawImages)

    ? rawImages

    : typeof rawImages === "string"

      ? (() => { try { return JSON.parse(rawImages); } catch { return []; } })()

      : [];

  const allImages = [mainImage, ...additionalImages].filter(Boolean);

  const productImages = Array.from(new Set(allImages));

  const selectedProductImage = productImages[selectedImage] || "";

  const detailImage = getCloudinaryImageUrl(

    selectedProductImage,

    "f_auto,q_100,dpr_auto"

  );

  const zoomImage = getCloudinaryImageUrl(

    selectedProductImage,

    "f_auto,q_100,dpr_auto"

  );

  const sizeOptions = useMemo(() => {

    const sizeSource =

      product?.ageGroup && typeof product.ageGroup === "string" && product.ageGroup.trim() !== ""

        ? product.ageGroup

        : product?.sizes;



    if (!sizeSource || typeof sizeSource !== "string") return [];



    return sizeSource

      .split(",")

      .map((size) => size.trim())

      .filter(Boolean);

  }, [product?.ageGroup, product?.sizes]);

  const hasMultipleSizeOptions = sizeOptions.length > 1;



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



  const handleMainImageMouseMove = (event: MouseEvent<HTMLDivElement>) => {

    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;

    const y = ((event.clientY - rect.top) / rect.height) * 100;



    setZoomPosition({

      x: Math.min(Math.max(x, 0), 100),

      y: Math.min(Math.max(y, 0), 100),

    });

  };



  useEffect(() => {

    setSelectedSize(sizeOptions[0] || "");

  }, [sizeOptions]);



  useEffect(() => {

    if (!product) return;

    setQuantity(outOfStock ? 1 : Math.min(Math.max(1, quantity), availableStock));

  }, [availableStock, outOfStock, product?.id]);



  // Reset viewer count when product changes and swap randomly every 4s

  useEffect(() => {

    if (!product) return;

    setViewerCount(Math.floor(Math.random() * 20) + 1);

    const interval = setInterval(() => {

      // Rare case (~15% chance) bump up to 30, otherwise stay within 1-20

      const useExtendedRange = Math.random() < 0.15;

      const max = useExtendedRange ? 30 : 20;

      setViewerCount(Math.floor(Math.random() * max) + 1);

    }, 4000);

    return () => clearInterval(interval);

  }, [product?.id]);



  // Recently viewed products management

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);



  useEffect(() => {

    if (!product) return;



    // Load recently viewed from localStorage

    const stored = localStorage.getItem('recentlyViewed');

    const viewed: any[] = stored ? JSON.parse(stored) : [];



    // Add current product to recently viewed if not already present

    const updatedViewed = viewed.filter((p: any) => p.id !== product.id);

    updatedViewed.unshift({

      id: product.id,

      name: product.name,

      image: product.image,

      sellingPrice: product.sellingPrice,

      mrp: product.mrp,

      slug: product.slug,

      category: product.category,

      subcategory: product.subcategory,

      rating: product.rating,

      reviews: product.reviews,

      inStock: product.inStock,

      isNew: product.isNew,

      isBoosted: product.isBoosted,

      boostUpdatedAt: product.boostUpdatedAt

    });



    // Keep only the last 8 products (we'll display 4)

    const trimmedViewed = updatedViewed.slice(0, 8);

    localStorage.setItem('recentlyViewed', JSON.stringify(trimmedViewed));

    setRecentlyViewed(trimmedViewed.slice(0, 4)); // Display only 4

  }, [product?.id]);



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

    if (outOfStock) return;



    executeWithAuth(() => {

      addToCart({

        id: product.id.toString(),

        name: product.name,

        sellingPrice: Number(product.sellingPrice),

        mrp: product.mrp ? Number(product.mrp) : undefined,

        image: product.image,

        category: product.category,

        subcategory: product.subcategory || undefined,

        size: selectedSize || undefined,

        quantity,

        stockQuantity: product.stockQuantity,

      });

    });

  };



  const handleWishlist = () => {

    executeWithAuth(() => {

      const isCurrentlyLiked = isLiked(product.id);

      toggleLike({

        id: product.id,

        name: product.name,

        description: product.description || "",

        slug: product.slug,

        sellingPrice: Number(product.sellingPrice),

        mrp: product.mrp ? Number(product.mrp) : null,

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

      toast({
        title: isCurrentlyLiked ? "Removed from Likes" : "Added to Likes!",
        description: isCurrentlyLiked 
          ? `${product.name} has been removed from your liked products.` 
          : `${product.name} has been added to your liked products.`,
        variant: isCurrentlyLiked ? "default" : "success",
        hideIcon: isCurrentlyLiked
      });

    });

  };



  const handleBuyNow = () => {

    if (outOfStock) return;



    executeWithAuth(() => {

      addToCart({

        id: product.id.toString(),

        name: product.name,

        sellingPrice: Number(product.sellingPrice),

        mrp: product.mrp ? Number(product.mrp) : undefined,

        image: product.image,

        category: product.category,

        subcategory: product.subcategory || undefined,

        size: selectedSize || undefined,

        quantity,

        stockQuantity: product.stockQuantity,

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

      content: (

        <div className="space-y-4">

          <p className="whitespace-pre-wrap">{product.description || "Premium quality product thoughtfully made for your little one."}</p>

          {(product as any).fabric || (product as any).colorTheme || (product as any).gender || (product as any).occasion || (product as any).collectionName || (product as any).printName ? (

            <div>

              <h4 className="font-semibold text-gray-900 mb-2">Thoughtful Details You'll Love</h4>

              <ul className="list-disc pl-5 space-y-1">

                {(product as any).fabric && <li><span className="font-medium text-gray-900">Fabric :</span> {(product as any).fabric}</li>}

                {(product as any).colorTheme && <li><span className="font-medium text-gray-900">Color :</span> {(product as any).colorTheme}</li>}

                {(product as any).gender && <li><span className="font-medium text-gray-900">Gender :</span> {(product as any).gender}</li>}

                {(product as any).occasion && <li><span className="font-medium text-gray-900">Occasion :</span> {(product as any).occasion}</li>}

                {(product as any).productType === 'combo' && (product as any).collectionName && <li><span className="font-medium text-gray-900">Collection :</span> {(product as any).collectionName}</li>}

                {(product as any).productType === 'single' && (product as any).printName && <li><span className="font-medium text-gray-900">Print :</span> {(product as any).printName}</li>}

              </ul>

            </div>

          ) : null}

        </div>

      ),

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

                <div

                  className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative cursor-zoom-in"

                  onMouseEnter={() => setIsImageZoomed(true)}

                  onMouseMove={handleMainImageMouseMove}

                  onMouseLeave={() => setIsImageZoomed(false)}

                >

                  <img

                    src={detailImage}

                    alt={product.name}

                    className="w-full h-full object-contain pointer-events-none select-none"

                    loading="eager"

                    decoding="async"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B7280' font-size='12' font-family='Arial'%3EProduct Image%3C/text%3E%3C/svg%3E";

                    }}

                  />



                  {/* Hover Magnifier */}

                  {isImageZoomed && zoomImage && (

                    <div

                      aria-hidden="true"

                      className="pointer-events-none absolute hidden h-44 w-44 rounded-full bg-white shadow-2xl ring-1 ring-black/10 md:block"

                      style={{

                        left: `${zoomPosition.x}%`,

                        top: `${zoomPosition.y}%`,

                        transform: "translate(-50%, -50%)",

                        backgroundImage: `url(${zoomImage})`,

                        backgroundRepeat: "no-repeat",

                        backgroundSize: "700% 700%",

                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,

                      }}

                    />

                  )}



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

                          src={image ? getCloudinaryImageUrl(image, "f_auto,q_100,dpr_auto,c_fill,w_240,h_240") : ""}

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



                    {!outOfStock ? (

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

                  <div>

                    <div className="flex items-center gap-4">

                      <span className="text-xl font-bold text-black sm:text-3xl">

                        ₹{Number(product.sellingPrice).toFixed(0)}

                      </span>

                      {product.mrp && (

                        <span className="text-sm text-gray-500 line-through sm:text-lg">

                          ₹{Number(product.mrp).toFixed(0)}

                        </span>

                      )}

                    </div>

                    {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (

                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600">

                        <Gift className="w-4 h-4" />

                        You save ₹{(Number(product.mrp) - Number(product.sellingPrice)).toFixed(0)}

                      </p>

                    )}

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">

                      <Eye className="w-4 h-4 font-bold text-black" strokeWidth={2.5} />

                      <span>{viewerCount} people are viewing this right now</span>

                    </div>

                    {!outOfStock && lowStock && (

                      <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">

                        Low stock: only {availableStock} left

                      </p>

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



                {outOfStock && (

                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                    This product is currently unavailable.

                  </p>

                )}



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

                {sizeOptions.length > 0 && (

                  <div>

                    <h3 className="text-sm font-medium text-gray-900 mb-3">

                      Size: <span className="font-semibold">{selectedSize || "Select size"}</span>

                    </h3>

                    {hasMultipleSizeOptions ? (

                      <div className="flex flex-wrap gap-2">

                        {sizeOptions.map((size, index) => (

                          <button

                            key={index}

                            type="button"

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

                    ) : (

                      <div className="inline-flex rounded-lg border border-black bg-black px-4 py-2 text-sm font-medium text-white">

                        {selectedSize}

                      </div>

                    )}

                  </div>

                )}



                {/* Quantity Selector */}

                <div>

                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>

                  <div className="flex items-center gap-3">

                    <button

                      onClick={() => setQuantity(Math.max(1, quantity - 1))}

                      disabled={outOfStock}

                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                    >

                      <Minus className="w-4 h-4" />

                    </button>

                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>

                    <button

                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}

                      disabled={outOfStock || quantity >= availableStock}

                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                    >

                      <Plus className="w-4 h-4" />

                    </button>

                  </div>

                </div>



                {/* Action Buttons */}

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 sm:flex sm:gap-4">

                  <button

                    onClick={handleAddToCart}

                    disabled={outOfStock}

                    className="h-11 min-w-0 bg-black text-white px-2 text-sm rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 whitespace-nowrap sm:h-auto sm:flex-1 sm:px-6 sm:py-3 sm:text-base sm:gap-2"

                  >

                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />

                    {outOfStock ? "Out of Stock" : (customMode ? "Add to Bag" : "Add To Cart")}

                  </button>

                  <button

                    onClick={handleBuyNow}

                    disabled={outOfStock}

                    className="h-11 min-w-0 bg-red-600 text-white px-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:h-auto sm:flex-1 sm:px-6 sm:py-3 sm:text-base"

                  >

                    {outOfStock ? "Unavailable" : "Buy Now"}

                  </button>

                  <button

                    onClick={handleWishlist}

                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors sm:w-12 sm:h-12"

                  >

                    <motion.div
                      whileTap={{ scale: 1.4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Heart 

                        className={`w-4 h-4 transition-colors sm:w-5 sm:h-5 ${

                          isLiked(product.id) 

                            ? 'fill-red-500 text-red-500' 

                            : 'text-gray-600 hover:text-red-500 hover:fill-red-500'

                        }`} 

                      />
                    </motion.div>

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Recently Viewed Products */}

      {recentlyViewed.length > 0 && (

        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-white">

          <div className="max-w-7xl mx-auto">

            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Viewed</h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">

              {recentlyViewed.map((viewedProduct: any, index: number) => (

                <BabyCareCard

                  key={viewedProduct.id}

                  product={viewedProduct}

                  index={index}

                />

              ))}

            </div>

          </div>

        </div>

      )}



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



      {/* Sticky Bottom Bar */}

      <AnimatePresence>

        {showStickyBar && !isStickyBarDismissed && (

          <motion.div

            initial={{ y: "100%" }}

            animate={{ y: 0 }}

            exit={{ y: "100%" }}

            transition={{ type: "spring", stiffness: 300, damping: 30 }}

            className="fixed bottom-0 left-0 right-0 z-[100] bg-[#FBFDF9] border-t-[3px] border-[#B4C49A] shadow-[0_-10px_40px_rgba(180,196,154,0.25)] py-4 px-4 sm:px-6 lg:px-8 hidden md:block"

          >

            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

              {/* Product Info */}

              <div className="flex items-center gap-5 flex-1 min-w-0">

                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#B4C49A]/40 shrink-0 bg-white flex items-center justify-center shadow-md relative -mt-8">

                  <img 

                    src={getCloudinaryImageUrl(mainImage || "", "f_auto,q_100,w_150,h_150,c_fill")} 

                    alt={product.name} 

                    className="w-full h-full object-cover scale-[1.6] origin-center"

                  />

                </div>

                <div className="flex flex-col min-w-0">

                  <h3 className="font-bold text-[#1D3557] truncate text-base lg:text-lg leading-tight">

                    {product.name}

                  </h3>

                  <div className="flex items-baseline gap-2 mt-1">

                    <span className="font-extrabold text-[#1D3557]">₹{Number(product.sellingPrice).toFixed(0)}</span>

                  </div>

                </div>

              </div>



              {/* Controls */}

              <div className="flex items-center gap-4 shrink-0">

                {sizeOptions.length > 0 && (

                  <div className="relative min-w-[200px]">

                    {hasMultipleSizeOptions ? (

                      <>

                        <select

                          value={selectedSize}

                          onChange={(e) => setSelectedSize(e.target.value)}

                          className="appearance-none w-full bg-white border border-[#B4C49A]/40 rounded-full px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-[#B4C49A] focus:outline-none focus:ring-2 focus:ring-[#B4C49A]/30 shadow-sm transition-all cursor-pointer"

                        >

                          {sizeOptions.map((size, index) => (

                            <option key={index} value={size.trim()}>

                              {size.trim()} - Rs. {Number(product.sellingPrice).toFixed(0)}

                            </option>

                          ))}

                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#B4C49A]">

                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                        </div>

                      </>

                    ) : (

                      <div className="rounded-full border border-[#B4C49A]/40 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">

                        Size: {selectedSize}

                      </div>

                    )}

                  </div>

                )}



                <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 border border-[#B4C49A]/40 shadow-sm">

                  <button

                    onClick={() => setQuantity(Math.max(1, quantity - 1))}

                    disabled={outOfStock}

                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#B4C49A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

                  >

                    <Minus className="w-3.5 h-3.5" />

                  </button>

                  <span className="w-6 text-center font-medium text-sm text-[#1D3557]">{quantity}</span>

                  <button

                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}

                    disabled={outOfStock || quantity >= availableStock}

                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#B4C49A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

                  >

                    <Plus className="w-3.5 h-3.5" />

                  </button>

                </div>



                {isProductInCart && (

                  <button

                    onClick={() => removeFromCart(product.id.toString())}

                    className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors ml-2 cursor-pointer shrink-0 bg-white shadow-sm"

                    aria-label="Remove from cart"

                  >

                    <Trash2 className="w-4 h-4" />

                  </button>

                )}

                <button

                  onClick={isProductInCart ? () => window.location.href = '/cart' : handleAddToCart}

                  disabled={outOfStock}

                  className="bg-[#B4C49A] text-black px-8 py-2.5 rounded-full text-sm font-bold hover:bg-[#97A97D] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md ml-2 cursor-pointer transform hover:-translate-y-0.5"

                >

                  {isProductInCart ? (

                    state.totalItems > 1

                      ? `Checkout (${state.totalItems} items • ₹${state.totalPrice.toFixed(0)})`

                      : "Checkout"

                  ) : outOfStock ? "Out of Stock" : (customMode ? "Add to Bag" : "Add To Cart")}

                </button>

                <button 

                  onClick={() => setIsStickyBarDismissed(true)}

                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1 cursor-pointer shrink-0"

                  aria-label="Dismiss bar"

                >

                  <X className="w-5 h-5" />

                </button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>



      {/* Google Auth Modal */}

      <GoogleAuthModal

        isOpen={showAuthModal}

        onClose={handleAuthCancel}

        initialMode="signin"

      />

    </>

  );

}

