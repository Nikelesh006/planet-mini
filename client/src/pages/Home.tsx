import React from "react";
import { Link } from "wouter";

import { Button } from "@/components/Button";

import { ProductCard } from "@/components/ProductCard";
import { BabyCareCard } from "@/components/BabyCareCard";
import { MuslinCard } from "@/components/MuslinCard";
import { ComboCard } from "@/components/ComboCard";
import { GiftingCard } from "@/components/GiftingCard";

import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useSuperSaverProducts, useFeaturedProducts, useGiftingProducts } from "@/hooks/useProducts";

import { motion } from "framer-motion";

import Slider from "@/components/Slider";

import CategoryCard from "@/components/CategoryCard";

import ProductGrid from "@/components/ProductGrid";

import { Baby, Shirt, Moon, Package, Heart, Star, ShoppingBag, Sparkles, Gift, ChevronLeft, ChevronRight, Mail } from "lucide-react";

import { useState, useEffect, useRef } from "react";



export default function Home() {

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Combo info modal state
  const [showComboInfoModal, setShowComboInfoModal] = useState(false);

  const { data: products, isLoading } = useProducts();

  const { data: styleProducts, isLoading: styleLoading } = useStyleProducts();

  const { data: homeProducts, isLoading: homeLoading } = useHomeProducts();

  

  // Specific hooks for each section

  const { data: shopByStyleProducts, isLoading: shopByStyleLoading } = useShopByStyleProducts();

  const { data: latestStyleProducts, isLoading: latestStyleLoading } = useLatestStyleProducts();

  const { data: babyCareProducts, isLoading: babyCareLoading } = useBabyCareProducts();

  const { data: superSaverProducts, isLoading: superSaverLoading } = useSuperSaverProducts();

  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();

  const { data: giftingProducts, isLoading: giftingLoading } = useGiftingProducts();



  // Slider state

  const [currentSlide, setCurrentSlide] = useState(0);

  

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



  // Slider images - easily change these URLs

  const sliderImages = [

    "/banner-hero.jpg",

    "/banner-hero2.png", 

    "/banner-hero3.png",

    "/banner-hero4.png"

  ];



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

    <div className="min-h-screen space-y-4">

      {/* Hero Section with Image Slider */}

      <section className="relative w-full h-[50vh] min-h-[300px] sm:h-[60vh] md:h-[70vh] max-h-[600px]">

        <div className="relative w-full h-full overflow-hidden">

          <div className="relative w-full h-full">

            {/* Image Slider */}

            <div className="relative w-full h-full">

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

            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-bold text-black">Shop by Style</h2>
              <img 
                src="/babies.png" 
                alt="Babies" 
                className="w-16 h-16 object-contain"
              />
            </div>

            <p className="text-gray-600 text-lg">Discover our latest collection of stylish baby wear</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          

          {/* Style Categories Grid */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-100/40 via-gray-50/50 to-gray-100/40 py-10 rounded-3xl shadow-inner">

            {/* Jhablas */}

            <Link href="/shop/jhablas" className="group">

              <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden p-3 shadow-xl shadow-gray-300/60 hover:shadow-black/20">

                <div className="aspect-square overflow-hidden">

                  <img 

                    src="/jhablas.jpg" 

                    alt="Jhablas" 

                    className="w-full h-full object-contain"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%233B82F6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EJhablas%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="p-3">

                  <h3 className="text-base font-bold text-black text-center group-hover:text-black transition-colors">Jhablas</h3>

                </div>

              </div>

            </Link>



            {/* Baby Boy */}

            <Link href="/shop/baby-boy" className="group">

              <div className="bg-white rounded-xl border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden p-3 shadow-xl shadow-gray-300/60 hover:shadow-black/20">

                <div className="aspect-square overflow-hidden">

                  <img 

                    src="/set.jpg" 

                    alt="Baby Boy" 

                    className="w-full h-full object-contain"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23EC4899'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EJhablas Set%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="p-3">

                  <h3 className="text-base font-bold text-black text-center group-hover:text-secondary transition-colors">Towels & Blankets</h3>

                </div>

              </div>

            </Link>



            {/* Baby Girl */}

            <Link href="/shop/baby-girl" className="group">

              <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden p-3 shadow-xl shadow-gray-300/60 hover:shadow-black/20">

                <div className="aspect-square overflow-hidden">

                  <img 

                    src="/coats.jpg" 

                    alt="Baby Girl" 

                    className="w-full h-full object-contain"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3ECoats%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="p-3">

                  <h3 className="text-base font-bold text-black text-center group-hover:text-black transition-colors">Nappies</h3>

                </div>

              </div>

            </Link>



            {/* Toys */}

            <Link href="/shop/toys" className="group">

              <div className="bg-white rounded-xl border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden p-3 shadow-xl shadow-gray-300/60 hover:shadow-black/20">

                <div className="aspect-square overflow-hidden">

                  <img 

                    src="/nightwear.jpg" 

                    alt="Toys" 

                    className="w-full h-full object-contain"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23A855F7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3ENight Wear%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="p-3">

                  <h3 className="text-base font-bold text-black text-center group-hover:text-secondary transition-colors">Wipes</h3>

                </div>

              </div>

            </Link>



            {/* Bath */}

            <Link href="/shop/bath" className="group">

              <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden p-3 shadow-xl shadow-gray-300/60 hover:shadow-black/20">

                <div className="aspect-square overflow-hidden">

                  <img 

                    src="/dress-boy.jpg" 

                    alt="Bath" 

                    className="w-full h-full object-contain"

                    onError={(e) => {

                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23EAB308'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3EBoys Wear%3C/text%3E%3C/svg%3E";

                    }}

                  />

                </div>

                <div className="p-3">

                  <h3 className="text-base font-bold text-black text-center group-hover:text-black transition-colors">Beds</h3>

                </div>

              </div>

            </Link>

          </div>

        </div>

      </section>



      {/* Baby Care Essentials Section */}

      <section className="w-full bg-red">

        <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-bold text-black">Baby Care Essentials</h2>
              <img 
                src="/playtime.png" 
                alt="Playtime" 
                className="w-16 h-16 object-contain"
              />
            </div>

            <p className="text-gray-600 text-lg">Everything you need for your baby's daily care routine</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          {/* 4-Card Grid Layout */}

          <div className="w-full px-4 sm:px-6 lg:px-8">

            {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-16">

                  {babyCareProducts.slice(0, 4).map((product, index) => (

                    <BabyCareCard key={product.id || `baby-care-${index}`} product={product} index={index} />

                  ))}

                </div>

                {/* Explore More Button */}
                <div className="text-center mt-8">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-5 py-2 rounded-full text-lg hover:bg-black/90 transition-all duration-300 shadow-xl"
                  >
                    Explore More
                  </motion.button>
                </div>
              </>
            )}

            {!babyCareLoading && (!babyCareProducts || babyCareProducts.length === 0) && (

              <div className="text-center py-12">

                <Baby className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                <h3 className="text-xl font-semibold text-black mb-2">No Baby Care Products</h3>

                <p className="text-gray-500">Add baby care essentials to showcase here!</p>

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



      {/* Muslin Cloths Section */}

      <section className="w-full">

        <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-bold text-black">Muslin Clothings</h2>
              <img 
                src="/baby.png" 
                alt="Baby" 
                className="w-16 h-16 object-contain"
              />
            </div>
            

            <p className="text-gray-600 text-lg">Breathable, lightweight cotton fabric perfect for comfortable everyday wear</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          {/* 4-Card Grid Layout */}

          <div className="w-full px-4 sm:px-6 lg:px-8">

            {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-16">

                  {babyCareProducts.slice(0, 4).map((product, index) => (

                    <MuslinCard key={product.id || `muslin-${index}`} product={product} index={index} />

                  ))}

                </div>

                {/* Explore More Button */}
                <div className="text-center mt-8">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-primary to-secondary text-black px-8 py-3 rounded-full font-bold text-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-xl"
                  >
                    Explore More
                  </motion.button>
                </div>
              </>
            )}

            {!babyCareLoading && (!babyCareProducts || babyCareProducts.length === 0) && (

              <div className="text-center py-12">

                <Baby className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                <h3 className="text-xl font-semibold text-black mb-2">No Muslin Products</h3>

                <p className="text-gray-500">Add muslin clothing products to showcase here!</p>

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



      {/* Combo Offers Section */}

      <section className="w-full bg-red-100 py-12">

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center"

          >

            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold animate-pulse bg-gradient-to-r from-black via-gray-600 to-gray-300 bg-clip-text text-transparent drop-shadow-lg" style={{ animationDuration: '1.5s' }}>Combo Offers</h2>
              <button
                onClick={() => setShowComboInfoModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                title="Combo Offers Info"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 text-lg">Amazing deals and discounts on your favorite baby products</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

            </div>

            {/* Decorative Discount Images */}
            <div className="flex justify-between items-center px-4 -mt-8">
              <div className="transform rotate-12 hover:rotate-6 transition-transform duration-300">
                <img 
                  src="/discount.png" 
                  alt="Discount" 
                  className="w-20 h-20 object-contain opacity-80 hover:opacity-100"
                />
              </div>
              <div className="transform -rotate-12 hover:rotate-6 transition-transform duration-300">
                <img 
                  src="/offer.png" 
                  alt="Offer" 
                  className="w-20 h-20 object-contain opacity-80 hover:opacity-100"
                />
              </div>
            </div>

          </motion.div>

          {!superSaverLoading && superSaverProducts && superSaverProducts.length > 0 && (

            <div className="mt-16">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 max-w-6xl mx-auto">
                {superSaverProducts.slice(0, 3).map((product, index) => (
                  <React.Fragment key={product.id || `combo-${index}`}>
                    {/* Product Image Only */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative transition-all duration-300 overflow-hidden flex-shrink-0"
                    >
                      {/* Discount Badge */}
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                        <div className="absolute top-4 left-4 z-20">
                          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                          </div>
                        </div>
                      )}

                      {/* Combo Badge - only show if no discount */}
                      {!(product.originalPrice && Number(product.originalPrice) > Number(product.price || 0)) && (
                        <div className="absolute top-4 left-4 z-20">
                          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                            3 PACK COMBO
                          </div>
                        </div>
                      )}

                      {/* Large Product Image */}
                      <div className="aspect-[4/5] w-56 lg:w-64 flex items-center justify-center relative bg-transparent">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-3xl transition-all duration-300"
                        />
                      </div>
                    </motion.div>

                    {/* Plus Sign between products */}
                    {index < 2 && (
                      <div className="flex items-center justify-center">
                        <div className="text-black font-bold text-3xl lg:text-4xl">
                          +
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Buy Now Button */}
              <div className="text-center mt-8">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary to-secondary text-black px-8 py-3 rounded-full font-bold text-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-xl"
                >
                  Buy Now
                </motion.button>
              </div>

              {/* Save 300 Highlight */}
              <div className="text-center mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
                >
                  💰 Save 300 on this combo!
                </motion.div>
              </div>
            </div>

          )}

          {!superSaverLoading && (!superSaverProducts || superSaverProducts.length === 0) && (

            <div className="text-center py-12">

              <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />

              <h3 className="text-xl font-semibold text-black mb-2">No Special Offers</h3>

              <p className="text-gray-500">Add special offers and deals to showcase here!</p>

            </div>

          )}

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

            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-bold text-black">Gifting</h2>
              <img 
                src="/giftbox.png" 
                alt="Gift Box" 
                className="w-14 h-14 object-contain"
              />
            </div>

            <p className="text-gray-600 text-lg">Thoughtfully curated presents for every special occasion</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          {/* Gifting Products Grid */}
          {!giftingLoading && giftingProducts && giftingProducts.length > 0 && (
            <div className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {giftingProducts.slice(0, 3).map((product, index) => (
                  <GiftingCard key={product.id || `gifting-${index}`} product={product} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Special Gifting Categories - Pricing Cards */}
          <div className="mt-16 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl font-bold text-black mb-2">Baby Gift Sets</h3>
              <p className="text-gray-600">Choose the perfect collection for your little one</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Basic Set - ₹1499 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-400 overflow-hidden border-2 border-gray-200"
              >
                {/* Header with gradient accent */}
                <div className="h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-t-3xl"></div>
                
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-black">Basic Set</h4>
                    <img 
                      src="/must-have.png" 
                      alt="Must Have" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-black">₹1499</span>
                  </div>
                  <p className="text-black text-base mb-8">Essential baby care starter kit</p>
                  
                  {/* Expandable Content */}
                  <details className="text-left mb-8">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200">
                      <span className="text-base font-semibold text-black flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        What's included?
                      </span>
                      <svg className="w-5 h-5 text-black transition-transform duration-300 details-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="max-h-40 overflow-y-auto mt-4 space-y-3 text-base text-black">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">2 x Soft Muslin Wraps</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Baby Towel Set</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">3 x Basic Bodysuits</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Diaper Bag</span>
                      </div>
                    </div>
                  </details>
                  
                  <button className="w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Get now
                  </button>
                </div>
              </motion.div>

              {/* Deluxe Set - ₹2299 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-400 border-2 border-primary transform scale-105"
              >
                {/* Enhanced Popular Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-primary to-secondary text-black text-sm font-bold px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border-2 border-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Most Popular
                  </div>
                </div>
                
                {/* Header with gradient accent */}
                <div className="h-2 bg-gradient-to-r from-primary to-secondary rounded-t-3xl"></div>
                
                <div className="p-10 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-black">Deluxe Set</h4>
                    <img 
                      src="/premium.png" 
                      alt="Premium" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-black">₹2299</span>
                  </div>
                  <p className="text-black text-base mb-8">Complete care package with premium items</p>
                  
                  {/* Expandable Content */}
                  <details className="text-left mb-8">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 border border-primary/30">
                      <span className="text-base font-semibold text-black flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        What's included?
                      </span>
                      <svg className="w-5 h-5 text-black transition-transform duration-300 details-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="max-h-40 overflow-y-auto mt-4 space-y-3 text-base text-black">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">4 x Premium Muslin Wraps</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">2 x Luxury Towel Sets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">5 x Designer Bodysuits</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Premium Diaper Bag</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">2 x Baby Blankets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Grooming Kit</span>
                      </div>
                    </div>
                  </details>
                  
                  <button className="w-full bg-gradient-to-r from-primary to-secondary text-black py-4 px-6 rounded-xl font-bold text-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Get now
                  </button>
                </div>
              </motion.div>

              {/* Premium Set - ₹3499 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative  rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-400 overflow-hidden border-3 border-amber-500 transform scale-105"
              >
                                
                {/* Header with gradient accent */}
                <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-t-3xl"></div>
                
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-black">Premium Set</h4>
                    <img 
                      src="/diamond.png" 
                      alt="Diamond" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-black">₹3499</span>
                  </div>
                  <p className="text-black text-base mb-8">Ultimate luxury collection for your baby</p>
                  
                  {/* Expandable Content */}
                  <details className="text-left mb-8">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl hover:from-amber-200 hover:to-orange-200 transition-all duration-300 border border-amber-300">
                      <span className="text-base font-semibold text-black flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        What's included?
                      </span>
                      <svg className="w-5 h-5 text-black transition-transform duration-300 details-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="max-h-40 overflow-y-auto mt-4 space-y-3 text-base text-black">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">6 x Organic Muslin Wraps</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">3 x Luxury Towel Sets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">8 x Designer Bodysuits</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Premium Diaper Backpack</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">3 x Baby Blankets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Complete Grooming Kit</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">2 x Baby Bed Sheets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Baby Sleep Sack</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></span>
                        <span className="font-medium">1 x Toy Set</span>
                      </div>
                    </div>
                  </details>
                  
                  <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Get now
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Customise Button */}
          <div className="text-center mt-12 pt-10 pb -10">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-full font-bold text-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-xl flex items-center gap-2 mx-auto group"
            >
              Customise
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </div>

          {giftingLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>

      {/* Announcement Slider */}
      <section className="w-full bg-gradient-to-r from-primary to-secondary py-8 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll whitespace-nowrap">
            {/* First set of announcements */}
            <div className="inline-flex items-center gap-8 px-8">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Comfort Starts Here</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Dress Your Baby in Care</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Wrap Them in Wonder</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Elevate Every Cuddle</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
            </div>
            {/* Second set for seamless loop */}
            <div className="inline-flex items-center gap-8 px-8">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Comfort Starts Here</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Dress Your Baby in Care</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Wrap Them in Wonder</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">Elevate Every Cuddle</span>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black/80">·</span>
            </div>
          </div>
        </div>
      </section>

      {/* Centre Banner Section */}

      <section className="w-full pb-8">

        <div className="relative w-full flex justify-center">

          <img

            src="/centre-banner.png"

            alt="Centre Banner"

            className="w-full h-auto object-cover transform scale-90"

            style={{ objectPosition: 'center' }}

          />

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

          <h2 className="text-4xl font-bold text-black mb-4">

            Happy Parents & Happy Babies

          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">

            See what our wonderful customers have to say about their Planet Mini experience

          </p>

          <div className="flex justify-center gap-2 mt-4">

            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>

            <div className="w-12 h-1 bg-secondary rounded-full"></div>

            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>

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

              href="/shop"

              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"

            >

              <ShoppingBag className="w-5 h-5" />

              Shop Now

            </Link>

            <Link 

              href="/contact"

              className="inline-flex items-center gap-2 bg-white border-2 border-primary text-black px-8 py-4 rounded-2xl font-bold hover:bg-primary hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"

            >

              <Mail className="w-5 h-5" />

              Share Your Story

            </Link>

          </div>

        </motion.div>

      </section>



      {/* About Us / Contact Us / Know Us Links */}

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary to-secondary p-8 lg:p-16">

          <div className="grid md:grid-cols-3 gap-12 mb-12">

            <Link href="/about" className="text-center group transform transition-transform duration-300 hover:scale-105">

              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">

                <Package className="w-8 h-8 text-black mx-auto mb-3" />

                <h3 className="text-xl font-semibold text-black mb-2">About Us</h3>

                <p className="text-sm text-black/80">Learn more about our story</p>

              </div>

            </Link>

            <Link href="/contact" className="text-center group transform transition-transform duration-300 hover:scale-105">

              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">

                <Heart className="w-8 h-8 text-black mx-auto mb-3" />

                <h3 className="text-xl font-semibold text-black mb-2">Contact Us</h3>

                <p className="text-sm text-black/80">Get in touch with us</p>

              </div>

            </Link>

            <Link href="/know-us" className="text-center group transform transition-transform duration-300 hover:scale-105">

              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">

                <Star className="w-8 h-8 text-black mx-auto mb-3" />

                <h3 className="text-xl font-semibold text-black mb-2">Know Us</h3>

                <p className="text-sm text-black/80">Discover our mission</p>

              </div>

            </Link>

          </div>

          

          <div className="grid md:grid-cols-3 gap-12">

            <div className="text-center">

              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">

                <Package className="w-6 h-6 text-black" />

              </div>

              <h4 className="font-semibold text-black mb-2">Soft & Safe Fabrics</h4>

              <p className="text-sm text-black/80">Gentle on baby's delicate skin</p>

            </div>

            <div className="text-center">

              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">

                <Heart className="w-6 h-6 text-black" />

              </div>

              <h4 className="font-semibold text-black mb-2">Eco-Friendly Materials</h4>

              <p className="text-sm text-black/80">Sustainable choices for our planet</p>

            </div>

            <div className="text-center">

              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">

                <Star className="w-6 h-6 text-black" />

              </div>

              <h4 className="font-semibold text-black mb-2">Loved by Parents</h4>

              <p className="text-sm text-black/80">Trusted by families worldwide</p>

            </div>

          </div>

        </div>

      </section>

      {/* Combo Info Modal */}
      {showComboInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Combo Offers Info</h3>
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
                The combo offers will be changed on a weekly basis. Make sure to check them out frequently to not miss the exciting combo offers!
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
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-medium hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}

