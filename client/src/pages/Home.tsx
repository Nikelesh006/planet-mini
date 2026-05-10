import React from "react";
import { Link } from "wouter";

import { Button } from "@/components/Button";

import { ProductCard } from "@/components/ProductCard";
import { BabyCareCard } from "@/components/BabyCareCard";
import { MuslinCard } from "@/components/MuslinCard";
import { ComboCard } from "@/components/ComboCard";
import { GiftingCard } from "@/components/GiftingCard";

import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useMuslinProducts, useComboProducts, useSuperSaverProducts, useFeaturedProducts, useGiftingProducts } from "@/hooks/useProducts";

import { motion } from "framer-motion";

import Slider from "@/components/Slider";

import CategoryCard from "@/components/CategoryCard";

import ProductGrid from "@/components/ProductGrid";

import { Baby, Shirt, Moon, Package, Heart, Star, ShoppingBag, Sparkles, Gift, ChevronLeft, ChevronRight, Mail, Leaf, Shield } from "lucide-react";

import { useState, useEffect, useRef } from "react";



export default function Home() {

  // Handle anchor links and hash changes
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Small timeout to ensure content is rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            const navbarHeight = 128; // Standard navbar height (pt-32)
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: elementPosition - navbarHeight - 20, // Add extra padding
              behavior: "smooth"
            });
          }
        }, 300);
      }
    };

    // Run on mount
    handleHashScroll();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  // Combo info modal state
  const [showComboInfoModal, setShowComboInfoModal] = useState(false);

  // Discount modal state
  const [showDiscountModal, setShowDiscountModal] = useState(() => {
    // Check if user has already dismissed the discount modal
    const discountDismissed = localStorage.getItem('discountModalDismissed');
    return discountDismissed === null; // Show modal only if not dismissed
  });

  // Handle discount modal dismiss
  const handleDiscountDismiss = () => {
    localStorage.setItem('discountModalDismissed', 'true');
    localStorage.setItem('discountModalDismissedDate', new Date().toISOString());
    setShowDiscountModal(false);
  };

  // Cookie modal state
  const [showCookieModal, setShowCookieModal] = useState(() => {
    // Check if user has already made a cookie choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    return cookieChoice === null; // Show modal only if no choice has been made
  });

  // Handle cookie consent choices
  const handleCookieAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowCookieModal(false);
  };

  const handleCookieReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowCookieModal(false);
  };

  const handleCookieCustom = () => {
    const marketingCheckbox = document.getElementById('marketing') as HTMLInputElement;
    const choice = marketingCheckbox?.checked ? 'custom-accepted' : 'custom-rejected';
    localStorage.setItem('cookieConsent', choice);
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('marketingCookies', marketingCheckbox?.checked ? 'true' : 'false');
    setShowCookieModal(false);
  };

  const { data: products, isLoading } = useProducts();

  const { data: styleProducts, isLoading: styleLoading } = useStyleProducts();

  const { data: homeProducts, isLoading: homeLoading } = useHomeProducts();

  // Shop by Style filter state
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Helper function to filter products by search term
  const filterProducts = (products: any[] | undefined, filterTerm: string | null) => {
    if (!filterTerm || !products) return products;
    const searchTerm = filterTerm.toLowerCase();
    return products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchTerm);
      const descMatch = product.description?.toLowerCase().includes(searchTerm);
      const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
      const subcategoryMatch = product.subcategory?.toLowerCase().includes(searchTerm);
      return nameMatch || descMatch || categoryMatch || subcategoryMatch;
    });
  };

  // Specific hooks for each section

  const { data: shopByStyleProductsRaw, isLoading: shopByStyleLoading } = useShopByStyleProducts();
  const shopByStyleProducts = filterProducts(shopByStyleProductsRaw, activeFilter);

  const { data: latestStyleProductsRaw, isLoading: latestStyleLoading } = useLatestStyleProducts();
  const latestStyleProducts = filterProducts(latestStyleProductsRaw, activeFilter);

  const { data: babyCareProductsRaw, isLoading: babyCareLoading } = useBabyCareProducts();
  const babyCareProducts = filterProducts(babyCareProductsRaw, activeFilter);

  const { data: muslinProductsRaw, isLoading: muslinLoading } = useMuslinProducts();
  const muslinProducts = filterProducts(muslinProductsRaw, activeFilter);

  const { data: superSaverProductsRaw, isLoading: superSaverLoading } = useSuperSaverProducts();
  const superSaverProducts = filterProducts(superSaverProductsRaw, activeFilter);

  const { data: comboProductsRaw, isLoading: comboLoading } = useComboProducts();
  const comboProducts = filterProducts(comboProductsRaw, activeFilter);

  const { data: featuredProductsRaw, isLoading: featuredLoading } = useFeaturedProducts();
  const featuredProducts = filterProducts(featuredProductsRaw, activeFilter);

  const { data: giftingProductsRaw, isLoading: giftingLoading } = useGiftingProducts();
  const giftingProducts = filterProducts(giftingProductsRaw, activeFilter);



  // Slider state

  const [currentSlide, setCurrentSlide] = useState(0);

  // Mobile banner slider state
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);

  // Mobile banner images
  const mobileBannerImages = [
    "/mobile-banner1.png",
    "/mobile-banner2.png",
    "/mobile-banner3.png",
    "/mobile-banner4.png"
  ];

  // Mobile banner navigation functions
  const goToMobileSlide = (index: number) => {
    setCurrentMobileSlide(index);
  };

  const goToMobilePrevSlide = () => {
    setCurrentMobileSlide((prev) => (prev - 1 + mobileBannerImages.length) % mobileBannerImages.length);
  };

  const goToMobileNextSlide = () => {
    setCurrentMobileSlide((prev) => (prev + 1) % mobileBannerImages.length);
  };

  // Auto-advance mobile banner slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMobileSlide((prev) => (prev + 1) % mobileBannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Banners state
  const [banners, setBanners] = useState<string[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            // Sort by order and extract image URLs
            const sortedBanners = result.data
              .sort((a: any, b: any) => a.order - b.order)
              .map((banner: any) => banner.imageUrl);
            setBanners(sortedBanners);
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Use admin banners if available, otherwise use fallback images
  const sliderImages = banners.length > 0 ? banners : [
    "/banner-hero.jpg",
    "/banner-hero2.png",
    "/banner-hero3.png",
    "/banner-hero4.png"
  ];

  // Latest products scroll state

  const [latestScrollPosition, setLatestScrollPosition] = useState(0);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const [isAtEndLatest, setIsAtEndLatest] = useState(false);

  const latestProductsRef = useRef<HTMLDivElement>(null);

  // Baby Care Essentials scroll state

  const [babyCareScrollPosition, setBabyCareScrollPosition] = useState(0);

  const [canScrollLeftBabyCare, setCanScrollLeftBabyCare] = useState(false);
  const [canScrollRightBabyCare, setCanScrollRightBabyCare] = useState(false);
  const [isAtEndBabyCare, setIsAtEndBabyCare] = useState(false);

  const babyCareProductsRef = useRef<HTMLDivElement>(null);

  // Featured Products scroll state

  const [featuredScrollPosition, setFeaturedScrollPosition] = useState(0);

  const [canScrollRightFeatured, setCanScrollRightFeatured] = useState(false);

  const [isAtEndFeatured, setIsAtEndFeatured] = useState(false);

  const featuredProductsRef = useRef<HTMLDivElement>(null);



  // Auto-advance slider

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);

    }, 5000);

    return () => clearInterval(timer);

  }, [sliderImages.length]);



  // Check scroll position to update arrow visibility

  const checkScrollPosition = () => {

    const container = latestProductsRef.current;

    if (!container) return;
    
    const scrollLeft = container.scrollLeft;

    const scrollWidth = container.scrollWidth;

    const clientWidth = container.clientWidth;
    
    setLatestScrollPosition(scrollLeft);

    const canScroll = scrollLeft < scrollWidth - clientWidth - 10; // 10px buffer
    setCanScrollRight(canScroll);
    
    // Check if we've reached the end
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 20; // 20px buffer for end detection
    setIsAtEndLatest(atEnd);

  };

  // Check scroll position for Baby Care Essentials

  const checkBabyCareScrollPosition = () => {

    const container = babyCareProductsRef.current;

    if (!container) return;
    
    const scrollLeft = container.scrollLeft;

    const scrollWidth = container.scrollWidth;

    const clientWidth = container.clientWidth;
    
    setBabyCareScrollPosition(scrollLeft);

    // Check if there's overflow content to scroll
    const hasOverflow = scrollWidth > clientWidth;
    const canScroll = hasOverflow && scrollLeft < scrollWidth - clientWidth - 10; // 10px buffer
    setCanScrollRightBabyCare(canScroll);
    
    // Check if we've reached the end
    const atEnd = hasOverflow && scrollLeft >= scrollWidth - clientWidth - 20; // 20px buffer for end detection
    setIsAtEndBabyCare(atEnd);

  };

  // Check scroll position for Featured Products

  const checkFeaturedScrollPosition = () => {

    const container = featuredProductsRef.current;

    if (!container) return;
    
    const scrollLeft = container.scrollLeft;

    const scrollWidth = container.scrollWidth;

    const clientWidth = container.clientWidth;
    
    setFeaturedScrollPosition(scrollLeft);

    const canScroll = scrollLeft < scrollWidth - clientWidth - 10; // 10px buffer
    setCanScrollRightFeatured(canScroll);
    
    // Check if we've reached the end
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 20; // 20px buffer for end detection
    setIsAtEndFeatured(atEnd);

  };



  // Check scroll position on mount and when products change

  useEffect(() => {

    const container = latestProductsRef.current;

    if (!container) return;

    

    checkScrollPosition();

    

    const handleScroll = () => checkScrollPosition();

    container.addEventListener('scroll', handleScroll);

    

    return () => container.removeEventListener('scroll', handleScroll);

  }, [latestStyleProducts]);

  // Check scroll position for Baby Care Essentials on mount and when products change

  useEffect(() => {

    const container = babyCareProductsRef.current;

    if (!container) return;
    
    checkBabyCareScrollPosition();
    
    const handleScroll = () => checkBabyCareScrollPosition();

    container.addEventListener('scroll', handleScroll);
    
    return () => container.removeEventListener('scroll', handleScroll);

  }, [babyCareProducts]);

  // Check scroll position for Featured Products on mount and when products change

  useEffect(() => {

    const container = featuredProductsRef.current;

    if (!container) return;
    
    checkFeaturedScrollPosition();
    
    const handleScroll = () => checkFeaturedScrollPosition();

    container.addEventListener('scroll', handleScroll);
    
    return () => container.removeEventListener('scroll', handleScroll);

  }, [featuredProducts]);



  const scrollLatestProducts = (direction: 'left' | 'right') => {

    const container = latestProductsRef.current;

    if (!container) return;

    

    const scrollAmount = 288 * 3; // One full page (3 cards * 288px each)

    const currentScroll = container.scrollLeft;

    const newPosition = direction === 'left' 

      ? Math.max(0, currentScroll - scrollAmount)

      : Math.min(container.scrollWidth - container.clientWidth, currentScroll + scrollAmount);

    

    container.scrollTo({

      left: newPosition,

      behavior: 'smooth'

    });

    

    // Update scroll position immediately for better dot sync

    setLatestScrollPosition(newPosition);

    

    // Check scroll position after animation completes

    setTimeout(() => {

      checkScrollPosition();

    }, 300); // Match the smooth scroll duration

  };

  const scrollBabyCareProducts = (direction: 'left' | 'right') => {
    console.log('=== SCROLL BABY CARE CLICKED ===');
    console.log('Direction:', direction);
    
    const container = babyCareProductsRef.current;
    console.log('Container exists:', !!container);
    
    if (!container) {
      console.log('Container not found!');
      return;
    }
    
    console.log('Container element:', container);
    console.log('Container scrollLeft:', container.scrollLeft);
    console.log('Container scrollWidth:', container.scrollWidth);
    console.log('Container clientWidth:', container.clientWidth);
    console.log('Container offsetWidth:', container.offsetWidth);
    
    // Simple scroll test - just scroll by 100px
    const scrollAmount = 100;
    const currentScroll = container.scrollLeft;
    const newPosition = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    
    console.log('Scroll amount:', scrollAmount);
    console.log('Current scroll:', currentScroll);
    console.log('New position:', newPosition);
    
    try {
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      console.log('Scroll command executed successfully');
    } catch (error) {
      console.error('Scroll error:', error);
    }
    
    // Also try scrollLeft as fallback
    try {
      container.scrollLeft = newPosition;
      console.log('Direct scrollLeft assignment worked');
    } catch (error) {
      console.error('Direct scrollLeft error:', error);
    }
    
    console.log('=== END SCROLL DEBUG ===');
  };

  const scrollFeaturedProducts = (direction: 'left' | 'right') => {

    const container = featuredProductsRef.current;

    if (!container) return;
    
    const scrollAmount = 264 * 3; // One full page (3 cards * 264px each)

    const currentScroll = container.scrollLeft;

    const newPosition = direction === 'left' 

      ? Math.max(0, currentScroll - scrollAmount)

      : Math.min(container.scrollWidth - container.clientWidth, currentScroll + scrollAmount);
    
    container.scrollTo({

      left: newPosition,

      behavior: 'smooth'

    });
    
    // Update scroll position immediately for better dot sync

    setFeaturedScrollPosition(newPosition);
    
    // Check scroll position after animation completes

    setTimeout(() => {

      checkFeaturedScrollPosition();

    }, 300); // Match the smooth scroll duration

  };



  // Check if left arrow should be visible

  const canScrollLeft = latestScrollPosition > 0;

  const canScrollLeftFeatured = featuredScrollPosition > 0;



  // Manual navigation

  const goToSlide = (index: number) => {

    setCurrentSlide(index);

  };



  const goToPrevSlide = () => {

    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  };



  const goToNextSlide = () => {

    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);

  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen space-y-4"
    >

      {/* Hero Section with Image Slider */}
      <section className="relative w-full h-auto sm:h-[60vh] md:h-[70vh] sm:min-h-[300px] sm:max-h-[600px]">
        <div className="relative w-full h-full overflow-hidden">
          <div className="relative w-full h-full">
            {/* Mobile Banner - Only visible on small screens */}
            <div className="sm:hidden relative w-full h-auto select-none">
              {/* Mobile Banner Slider Images */}
              <div className="relative w-full h-auto">
                {mobileBannerImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Mobile Banner ${index + 1}`}
                    className={`w-full h-auto object-contain transition-opacity duration-1000 pointer-events-none ${
                      index === currentMobileSlide ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='16' font-family='Arial'%3EMobile Banner%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ))}
              </div>

              {/* Mobile Banner Navigation Arrows */}
              <button
                onClick={goToMobilePrevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToMobileNextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Mobile Banner Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {mobileBannerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToMobileSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentMobileSlide
                        ? 'bg-white opacity-100 w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Image Slider - Only visible on sm and larger screens */}
            <div className="hidden sm:block relative w-full h-full">
              {/* Slider Images */}
              <div className="relative w-full h-full">
                {sliderImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`Hero Slide ${index + 1}`} 
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                    draggable={false}
                  />
                ))}
              </div>
              
              {/* Slider Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {sliderImages.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white opacity-100 w-8' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={goToPrevSlide}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Style Section */}

      <section className="w-full pt-20">

        <div className="pt-0 pb-8 lg:pb-16 lg:pt-2 px-4 sm:px-6 lg:px-8">

          <motion.div 

            initial={{ opacity: 0, y: 30 }}

            whileInView={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.8, ease: "easeOut" }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-4 mb-4" id="shop-by-style">
              <h2 className="text-2xl sm:text-4xl font-bold text-black">Shop by Style</h2>
              <img 
                src="/babies.png" 
                alt="Babies" 
                className="w-8 h-8 sm:w-16 sm:h-16 object-contain"
                draggable={false}
              />
            </div>

            <p className="text-gray-600 text-lg">Discover our latest collection of stylish baby wear</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          {/* Active Filter Display */}
          {activeFilter && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-4 mb-6"
            >
              <div className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                <span className="font-semibold capitalize">Filter: {activeFilter}</span>
                <button 
                  onClick={() => setActiveFilter(null)}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm">
                Showing filtered results in all sections below
              </p>
            </motion.div>
          )}

          {/* Style Categories Grid */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 px-2 sm:px-4 lg:px-6 bg-red-50 py-6 rounded-3xl shadow-inner">

            {/* Jhablas */}

            <button 
              onClick={() => setActiveFilter(activeFilter === 'jhablas' ? null : 'jhablas')}
              className={`group flex flex-col items-center ${activeFilter === 'jhablas' ? 'ring-4 ring-primary scale-105' : ''}`}
            >

              <div className={`bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20 w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 ${activeFilter === 'jhablas' ? 'border-primary' : 'border-primary/20 hover:border-primary/40'}`}>

                <img 

                  src="/jhablas.jpg" 

                  alt="Jhablas" 

                  className="w-full h-full object-cover"
                  draggable={false}

                  onError={(e) => {

                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%233B82F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EJhablas%3C/text%3E%3C/svg%3E";

                  }}

                />

              </div>

              <h3 className={`text-sm sm:text-lg font-bold text-center mt-4 ${activeFilter === 'jhablas' ? 'text-primary' : 'text-black'}`}>Jhablas</h3>

            </button>



            {/* Towels & Blankets */}

            <button 
              onClick={() => setActiveFilter(activeFilter === 'towels' ? null : 'towels')}
              className={`group flex flex-col items-center ${activeFilter === 'towels' ? 'ring-4 ring-secondary scale-105' : ''}`}
            >

              <div className={`bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20 w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 ${activeFilter === 'towels' ? 'border-secondary' : 'border-secondary/20 hover:border-secondary/40'}`}>

                <img 

                  src="/set.jpg" 

                  alt="Baby Boy" 

                  className="w-full h-full object-cover"
                  draggable={false}

                  onError={(e) => {

                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23EC4899'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EJhablas Set%3C/text%3E%3C/svg%3E";

                  }}

                />

              </div>

              <h3 className={`text-sm sm:text-lg font-bold text-center mt-4 ${activeFilter === 'towels' ? 'text-secondary' : 'text-black'}`}>Towels & Blankets</h3>

            </button>



            {/* Nappies */}

            <button 
              onClick={() => setActiveFilter(activeFilter === 'nappies' ? null : 'nappies')}
              className={`group flex flex-col items-center ${activeFilter === 'nappies' ? 'ring-4 ring-primary scale-105' : ''}`}
            >

              <div className={`bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20 w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 ${activeFilter === 'nappies' ? 'border-primary' : 'border-primary/20 hover:border-primary/40'}`}>

                <img 

                  src="/coats.jpg" 

                  alt="Baby Girl" 

                  className="w-full h-full object-cover"
                  draggable={false}

                  onError={(e) => {

                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3ECoats%3C/text%3E%3C/svg%3E";

                  }}

                />

              </div>

              <h3 className={`text-sm sm:text-lg font-bold text-center mt-4 ${activeFilter === 'nappies' ? 'text-primary' : 'text-black'}`}>Nappies</h3>

            </button>



            {/* Wipes */}

            <button 
              onClick={() => setActiveFilter(activeFilter === 'wipes' ? null : 'wipes')}
              className={`group flex flex-col items-center ${activeFilter === 'wipes' ? 'ring-4 ring-secondary scale-105' : ''}`}
            >

              <div className={`bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20 w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 ${activeFilter === 'wipes' ? 'border-secondary' : 'border-secondary/20 hover:border-secondary/40'}`}>

                <img 

                  src="/nightwear.jpg" 

                  alt="Toys" 

                  className="w-full h-full object-cover"
                  draggable={false}

                  onError={(e) => {

                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23A855F7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3ENight Wear%3C/text%3E%3C/svg%3E";

                  }}

                />

              </div>

              <h3 className={`text-sm sm:text-lg font-bold text-center mt-4 ${activeFilter === 'wipes' ? 'text-secondary' : 'text-black'}`}>Wipes</h3>

            </button>



            {/* Beds */}

            <button 
              onClick={() => setActiveFilter(activeFilter === 'beds' ? null : 'beds')}
              className={`group flex flex-col items-center ${activeFilter === 'beds' ? 'ring-4 ring-primary scale-105' : ''}`}
            >

              <div className={`bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20 w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 ${activeFilter === 'beds' ? 'border-primary' : 'border-primary/20 hover:border-primary/40'}`}>

                <img 

                  src="/dress-girl.jpg" 

                  alt="Bath" 

                  className="w-full h-full object-cover"
                  draggable={false}

                  onError={(e) => {

                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23EAB308'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EBoys Wear%3C/text%3E%3C/svg%3E";

                  }}

                />

              </div>

              <h3 className={`text-sm sm:text-lg font-bold text-center mt-4 ${activeFilter === 'beds' ? 'text-primary' : 'text-black'}`}>Beds</h3>

            </button>

          </div>

        </div>

      </section>



      {/*New Arrivals Section */}

      <section className="w-full bg-red">

        <div className="px-4 sm:px-6 lg:px-8 py-8 pb-2">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-16 mb-4" id="new-arrivals">
              <div className="flex-1 h-px bg-black"></div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-4xl font-bold text-black">New Arrivals</h2>
                <img 
                  src="/playtime.png" 
                  alt="Playtime" 
                  className="w-8 h-8 sm:w-16 sm:h-16 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex-1 h-px bg-black"></div>
            </div>

            <p className="text-gray-600 text-lg">Everything you need for your baby's daily care routine</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          {/* 4-Card Grid Layout */}

          <div className="w-full px-0 sm:px-4 lg:px-8">

            {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8 lg:gap-10">

                  {babyCareProducts.slice(0, 4).map((product, index) => (

                    <BabyCareCard key={product.id || `baby-care-${index}`} product={product} index={index} />

                  ))}

                </div>

                {/* Explore More Button */}
                <div className="text-center mt-4">
                  <Link href="/shop/style">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg hover:bg-gray-800 transition-all duration-150 shadow-xl flex items-center gap-2 mx-auto group"
                    >
                      Explore More
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                  </Link>
                </div>
              </>
            )}

            {!babyCareLoading && (!babyCareProducts || babyCareProducts.length === 0) && (

              <div className="text-center py-12">

                <Baby className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                <h3 className="text-xl font-semibold text-black mb-2">No New Arrivals</h3>

                <p className="text-gray-500">Add new arrival products to showcase here!</p>

              </div>

            )}

            {babyCareLoading && (

              <div className="flex justify-center py-8">

                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

              </div>

            )}

          </div>

        </div>

      </section>



      {/*Trending Products Section */}

      <section className="w-full">

        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-4 mb-4 sm:gap-16" id="trending-products">
              <div className="hidden sm:block flex-1 h-px bg-black"></div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-4xl font-bold text-black">Trending Products</h2>
                <img 
                  src="/baby.png" 
                  alt="Baby" 
                  className="w-8 h-8 sm:w-16 sm:h-16 object-contain"
                  draggable={false}
                />
              </div>
              <div className="hidden sm:block flex-1 h-px bg-black"></div>
            </div>
            

            <p className="text-gray-600 text-lg">Breathable, lightweight cotton fabric perfect for comfortable everyday wear</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          {/* 4-Card Grid Layout */}

          <div className="w-full px-0 sm:px-4 lg:px-8">

            {!muslinLoading && muslinProducts && muslinProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8 lg:gap-10">

                  {muslinProducts.slice(0, 4).map((product, index) => (

                    <MuslinCard key={product.id || `muslin-${index}`} product={product} index={index} />

                  ))}

                </div>

                {/* Explore More Button */}
                <div className="text-center mt-8">
                  <Link href="/shop/style">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg hover:bg-gray-800 transition-all duration-150 shadow-xl flex items-center gap-2 mx-auto group"
                    >
                      Explore More
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                  </Link>
                </div>
              </>
            )}

            {!muslinLoading && (!muslinProducts || muslinProducts.length === 0) && (

              <div className="text-center py-12">

                <Shirt className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                <h3 className="text-xl font-semibold text-black mb-2">No Trending Products</h3>

                <p className="text-gray-500">Add trending products to showcase here!</p>

              </div>

            )}

            {muslinLoading && (

              <div className="flex justify-center py-8">

                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

              </div>

            )}

          </div>

        </div>

      </section>



      {/* Blockbuster Combo's Section */}

      <section className="w-full bg-red-50 py-12">

        <div className="px-4 sm:px-6 lg:px-8">

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center"

          >

            <div className="flex items-center justify-center gap-3 mb-4" id="blockbuster-combos">
              <h2 className="text-2xl sm:text-4xl font-bold ">Blockbuster Combo's</h2>
              <img
                src="/puzzle.png"
                alt="Combo"
                className="w-8 h-8 sm:w-16 sm:h-16 object-contain"
                draggable={false}
              />
            </div>

            <p className="text-gray-600 text-lg">Amazing deals and discounts on your favorite baby products</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

            </div>

            
          </motion.div>

          <div className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
              {/* Combo Offer Image 1 */}
              <Link href="/shopstyle">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/combo1.png"
                      alt="Combo Offer 1"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>
              {/* Combo Offer Image 2 */}
              <Link href="/shopstyle">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/combo2.png"
                      alt="Combo Offer 2"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>
              {/* Combo Offer Image 3 */}
              <Link href="/shopstyle">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/combo3.png"
                      alt="Combo Offer 3"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>

          {superSaverLoading && (

            <div className="flex justify-center py-8">

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

            </div>

          )}

        </div>

      </section>



      {/* Gifting Section */}

      <section className="w-full">

        <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-16 mb-4" id="gifting">
              <div className="flex-1 h-px bg-black"></div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-4xl font-bold text-black">Gifting</h2>
                <img 
                  src="/giftbox.png" 
                  alt="Gift Box" 
                  className="w-7 h-7 sm:w-14 sm:h-14 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex-1 h-px bg-black"></div>
            </div>

            <p className="text-gray-600 text-lg">Thoughtfully curated presents for every special occasion</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-primary rounded-full"></div>

              <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          {/* Gifting Products Grid - Mixed Layout */}
          <div className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
              {/* Combined Card 1 & 2 - Rectangle */}
              <Link href="/shop/gifting" className="md:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-[2/1] bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/gifting3.png"
                      alt="Gift Set Collection 1"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EGift Set Collection 1%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>

              {/* Gifting Card 3 - 1:1 Square with gifting1.png */}
              <Link href="/shop/gifting">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/gifting1.png"
                      alt="Gift Set 1"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EGift Set 1%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>

              {/* Gifting Card 4 - 1:1 Square */}
              <Link href="/shop/gifting">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/gifting2.png"
                      alt="Gift Set 4"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EGift Set 4%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>

              {/* Combined Card 5 & 6 - Rectangle */}
              <Link href="/shop/gifting" className="md:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] sm:aspect-[2/1] bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/gifting4.png"
                      alt="Gift Set Collection 2"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EGift Set Collection 2%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>

          {giftingLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>

      {/* Announcement Slider */}
      <section className="w-full bg-[#B4C49A] py-4 sm:py-6 md:py-8 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll whitespace-nowrap">
            {/* First set of announcements */}
            <div className="inline-flex items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8">
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Comfort Starts Here</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Dress Your Baby in Care</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Wrap Them in Wonder</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Elevate Every Cuddle</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
            </div>
            {/* Second set for seamless loop */}
            <div className="inline-flex items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8">
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Comfort Starts Here</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Dress Your Baby in Care</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Wrap Them in Wonder</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-black">Elevate Every Cuddle</span>
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black/80">·</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}

      <section className="w-full py-20 bg-gradient-to-b from-white via-red-50/50 to-red-100/30">

        <div className="px-4 sm:px-6 lg:px-8 max-w-[95%] mx-auto">

          {/* Header */}

          <motion.div

            initial={{ opacity: 0, y: 30 }}

            whileInView={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.8, ease: "easeOut" }}

            className="text-center mb-16"

          >

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-4">Our commitment to your baby</h2>

            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">We prioritize safety, comfort, and sustainability in every product we create</p>

            <div className="flex justify-center gap-2 mt-6">

              <div className="w-16 h-1 bg-primary rounded-full"></div>

              <div className="w-16 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-16 h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          {/* 4 Commitment Cards - IMAGE SIZE: 800x1067px (3:4 aspect ratio) recommended */}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">

            {/* 100% Organic Cotton */}

            <motion.div

              initial={{ opacity: 0, y: 40, scale: 0.95 }}

              whileInView={{ opacity: 1, y: 0, scale: 1 }}

              whileHover={{ y: -12, scale: 1.02 }}

              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}

              className="group flex flex-col items-center"

            >

              <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer w-full">

                <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden">

                  <img

                    src="/100%cotton.png"

                    alt="100% Organic Cotton"

                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

                    draggable={false}

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1067' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EOrganic Cotton%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                {/* Gradient Overlay - only on hover */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* Shine Effect on Hover */}

                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Hover Content - description only */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-black transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-4px]">
                  <p className="text-sm sm:text-xl text-center text-black/95 leading-relaxed font-bold">Pure, natural fabric that's gentle on your baby's delicate skin</p>
                </div>

              </div>

              {/* Heading - below image */}
              <h3 className="text-sm sm:text-2xl font-bold text-center mt-4 sm:mt-6 text-black">100% Organic Cotton</h3>

            </motion.div>

            {/* Chemical Free */}

            <motion.div

              initial={{ opacity: 0, y: 40, scale: 0.95 }}

              whileInView={{ opacity: 1, y: 0, scale: 1 }}

              whileHover={{ y: -12, scale: 1.02 }}

              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}

              className="group flex flex-col items-center"

            >

              <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer w-full">

                <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden">

                  <img

                    src="/chemicalfree.png"

                    alt="Chemical Free"

                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

                    draggable={false}

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1067' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3EChemical Free%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Hover Content - description only */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-black transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-4px]">
                  <p className="text-sm sm:text-xl text-center text-black/95 leading-relaxed font-bold">No harmful chemicals or dyes, ensuring complete safety</p>
                </div>

              </div>

              {/* Heading - below image */}
              <h3 className="text-sm sm:text-2xl font-bold text-center mt-4 sm:mt-6 text-black">Chemical Free</h3>

            </motion.div>

            {/* Skin Friendly */}

            <motion.div

              initial={{ opacity: 0, y: 40, scale: 0.95 }}

              whileInView={{ opacity: 1, y: 0, scale: 1 }}

              whileHover={{ y: -12, scale: 1.02 }}

              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}

              className="group flex flex-col items-center"

            >

              <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer w-full">

                <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden">

                  <img

                    src="/shield.png"

                    alt="Skin Friendly"

                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

                    draggable={false}

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1067' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3ESkin Friendly%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Hover Content - description only */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-black transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-4px]">
                  <p className="text-sm sm:text-xl text-center text-black/95 leading-relaxed font-bold">Soft, breathable materials that prevent irritation and rashes</p>
                </div>

              </div>

              {/* Heading - below image */}
              <h3 className="text-sm sm:text-2xl font-bold text-center mt-4 sm:mt-6 text-black">Skin Friendly</h3>

            </motion.div>

            {/* Sustainable */}

            <motion.div

              initial={{ opacity: 0, y: 40, scale: 0.95 }}

              whileInView={{ opacity: 1, y: 0, scale: 1 }}

              whileHover={{ y: -12, scale: 1.02 }}

              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}

              className="group flex flex-col items-center"

            >

              <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer w-full">

                <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden">

                  <img

                    src="/eco-friendly.png"

                    alt="Sustainable"

                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

                    draggable={false}

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1067' viewBox='0 0 24 24' fill='%23E5E7EB'%3E%3Crect width='24' height='24' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='16' font-family='Arial'%3ESustainable%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Hover Content - description only */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-black transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-4px]">
                  <p className="text-sm sm:text-xl text-center text-black/95 leading-relaxed font-bold">Eco-friendly production that protects our planet for future generations</p>
                </div>

              </div>

              {/* Heading - below image */}
              <h3 className="text-sm sm:text-2xl font-bold text-center mt-4 sm:mt-6 text-black">Sustainable</h3>

            </motion.div>

          </div>

        </div>

      </section>




      {/* Customer Reviews Gallery Section */}

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          whileInView={{ opacity: 1, y: 0 }}

          className="text-center mb-12"

        >

          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">

            <Heart className="w-10 h-10 text-black" />

          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-black mb-4">

            Happy Parents & Happy Babies

          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">

            See what our wonderful customers have to say about their Planet Mini experience

          </p>

          <div className="flex justify-center gap-2 mt-4">

            <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>

            <div className="w-8 h-1 sm:w-12 sm:h-1 bg-secondary rounded-full"></div>

            <div className="w-8 h-1 sm:w-12 sm:h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>

          </div>

        </motion.div>



        {/* Image Collage Gallery */}

        <div className="relative">

          {/* Main Grid Layout */}

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[150px] md:auto-rows-[200px]">

            {/* Large Featured Image - Top Left (2x2) */}
            <div className="relative group col-span-2 row-span-2 md:col-span-2 md:row-span-2">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review4.jpg" 
                  alt="Happy baby with Planet Mini products"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='12' font-family='Arial'%3EBaby Review 1%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-4 text-black">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold">Sarah M.</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      "Amazing quality! My baby loves the soft fabrics. Planet Mini has been a game-changer for us!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Image - Top Right */}
            <div className="relative group">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review5.jpg" 
                  alt="Baby in comfortable sleepwear"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23DBEAFE'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%231E40AF' font-size='12' font-family='Arial'%3EBaby Review 2%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-3 text-black">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold">Emily R.</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      "The cutest baby clothes! So soft and durable."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Image - Middle Right (1x2) */}
            <div className="relative group row-span-2 md:row-span-2">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review6.jpg" 
                  alt="Baby playing with toys"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23D1FAE5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23065F46' font-size='12' font-family='Arial'%3EBaby Review 3%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-4 text-black">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold">Mike T.</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      "Great quality products at reasonable prices! My baby looks adorable!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Image - Bottom Left */}
            <div className="relative group">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review1.jpg" 
                  alt="Twins in matching outfits"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEF3C7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2392400E' font-size='12' font-family='Arial'%3EBaby Review 4%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-3 text-black">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold">Jessica L.</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      "Perfect for my twins! Adorable matching outfits."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wide Image - Bottom Middle (2x1) */}
            <div className="relative group col-span-2">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review2.jpg" 
                  alt="Happy baby in organic clothing"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23E9D5FF'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236B21A8' font-size='12' font-family='Arial'%3EBaby Review 5%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-4 text-black">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold">David K.</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      "Love the eco-friendly options! Great quality and sustainability."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Image - Bottom Right */}
            <div className="relative group">
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/review3.jpg" 
                  alt="Baby sleeping peacefully"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FED7AA'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239A3412' font-size='12' font-family='Arial'%3EBaby Review 6%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                  <div className="p-3 text-black">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold">Lisa M.</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      "The sleepwear is incredibly soft! Highly recommend."
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>



        {/* Call to Action */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5 }}
          whileInView={{ opacity: 1, y: 0 }}

          className="text-center mt-12"

        >

          <p className="text-gray-600 mb-6">

            Join thousands of happy parents who trust Planet Mini for their little ones!

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link

              href="/contact"

              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 sm:px-8 sm:py-4 rounded-full sm:rounded-2xl text-base sm:text-base hover:bg-gray-800 transition-all duration-150 shadow-xl mx-auto group"

            >

              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />

              Share Your Story

              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

            </Link>

          </div>

        </motion.div>

      </section>



      {/* Combo Info Modal */}
      {showComboInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Blockbuster Combo's Info</h3>
              <button
                onClick={() => setShowComboInfoModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                The Blockbuster Combo's will be changed on a weekly basis. Make sure to check them out frequently to not miss the exciting combo deals!
              </p>
              <p>
                Each week, we curate special bundles with amazing discounts on your favorite baby products. These limited-time deals offer the best value for money, combining essential items at unbeatable prices.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-amber-800">
                  💡 <strong>Pro Tip:</strong> Bookmark this page and visit every Monday for new weekly combos!
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowComboInfoModal(false)}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed bottom-4 left-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xl max-w-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-base">10%</span>
                </div>
                <div>
                  <h3 className="text-black font-bold text-lg">Special Offer!</h3>
                  <p className="text-gray-700 text-base">Get 10% off your first order</p>
                </div>
              </div>
              <button
                onClick={handleDiscountDismiss}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-lg text-gray-600 mb-3">
                <span>Code - </span><span className="text-red-500 font-bold text-lg">PMSALE10</span>
            </div>
            <button
              onClick={handleDiscountDismiss}
              className="w-full bg-red-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              Shop Now
            </button>
          </motion.div>
        </div>
      )}

      {/* Cookie Accept Modal */}
      {showCookieModal && (
        <div className="fixed bottom-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xl max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">🍪</span>
                </div>
                <div>
                  <h3 className="text-black font-bold text-base">Cookie Notice</h3>
                  <p className="text-gray-700 text-sm">We use cookies to enhance your experience</p>
                </div>
              </div>
              <button
                onClick={handleCookieReject}
                className="text-gray-400 hover:text-black transition-colors"
                title="Reject cookies"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-3">By using our site, you agree to our use of cookies for analytics, personalization, and marketing purposes.</p>
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" id="necessary" className="w-4 h-4 text-red-500 rounded" defaultChecked />
                <label htmlFor="necessary" className="text-sm text-gray-700">Essential cookies (required)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="marketing" className="w-4 h-4 text-red-500 rounded" />
                <label htmlFor="marketing" className="text-sm text-gray-700">Marketing cookies</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCookieReject}
                className="flex-1 bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleCookieAccept}
                className="flex-1 bg-red-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Accept All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

}

