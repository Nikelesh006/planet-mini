import { Link } from "wouter";

import { Button } from "@/components/Button";

import { ProductCard } from "@/components/ProductCard";

import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useSuperSaverProducts, useFeaturedProducts } from "@/hooks/useProducts";

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

  const { data: products, isLoading } = useProducts();

  const { data: styleProducts, isLoading: styleLoading } = useStyleProducts();

  const { data: homeProducts, isLoading: homeLoading } = useHomeProducts();

  

  // Specific hooks for each section

  const { data: shopByStyleProducts, isLoading: shopByStyleLoading } = useShopByStyleProducts();

  const { data: latestStyleProducts, isLoading: latestStyleLoading } = useLatestStyleProducts();

  const { data: babyCareProducts, isLoading: babyCareLoading } = useBabyCareProducts();

  const { data: superSaverProducts, isLoading: superSaverLoading } = useSuperSaverProducts();

  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();



  // Slider state

  const [currentSlide, setCurrentSlide] = useState(0);

  

  // Latest products scroll state

  const [latestScrollPosition, setLatestScrollPosition] = useState(0);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const [isAtEndLatest, setIsAtEndLatest] = useState(false);

  const latestProductsRef = useRef<HTMLDivElement>(null);

  // Baby Care Essentials scroll state

  const [babyCareScrollPosition, setBabyCareScrollPosition] = useState(0);

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

    const canScroll = scrollLeft < scrollWidth - clientWidth - 10; // 10px buffer
    setCanScrollRightBabyCare(canScroll);
    
    // Check if we've reached the end
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 20; // 20px buffer for end detection
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

    

    const scrollAmount = 256 * 3; // One full page (3 cards * 256px each)

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

    const container = babyCareProductsRef.current;

    if (!container) return;
    
    const scrollAmount = 256 * 3; // One full page (3 cards * 256px each)

    const currentScroll = container.scrollLeft;

    const newPosition = direction === 'left' 

      ? Math.max(0, currentScroll - scrollAmount)

      : Math.min(container.scrollWidth - container.clientWidth, currentScroll + scrollAmount);
    
    container.scrollTo({

      left: newPosition,

      behavior: 'smooth'

    });
    
    // Update scroll position immediately for better dot sync

    setBabyCareScrollPosition(newPosition);
    
    // Check scroll position after animation completes

    setTimeout(() => {

      checkBabyCareScrollPosition();

    }, 300); // Match the smooth scroll duration

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

  const canScrollLeftBabyCare = babyCareScrollPosition > 0;

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

      <section className="relative w-full h-[70vh] min-h-[400px] max-h-[600px]">

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-secondary transition-colors">Jhablas Set</h3>

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-black transition-colors">Coats</h3>

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-secondary transition-colors">Night Wear</h3>

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-black transition-colors">Boys Wear</h3>

                </div>

              </div>

            </Link>

          </div>

        </div>

      </section>



      {/* Baby Care Essentials Section */}

      <section className="w-full bg-yellow-50">

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

          {/* Image and Content Layout */}

          <div className="flex flex-col lg:flex-row items-start gap-12">

            {/* Left Side Image - Increased Size */}

            <div className="lg:w-1/4 flex-shrink-0">

              <img 

                src="/essentials.png" 

                alt="Latest Products" 

                className="w-full h-auto object-contain mx-auto lg:mx-0"

              />

            </div>

            

            {/* Right Side Content */}

            <div className="lg:w-2/3 flex-1">

              {!latestStyleLoading && latestStyleProducts && latestStyleProducts.length > 0 && (

                <div className="relative">

                  {/* Horizontal Scroll Container */}

                  <div className="relative">

                    <div 

                      ref={latestProductsRef}

                      className="flex gap-12 overflow-hidden scroll-smooth pb-4"

                      style={{ 

                        scrollbarWidth: 'none', 

                        msOverflowStyle: 'none'

                      }}

                    >

                      {latestStyleProducts.slice(0, 3).map((product, index) => (

                        <div key={product.id || `latest-${index}`} className="flex-shrink-0 w-64">

                          <ProductCard product={product} index={index} />

                        </div>

                      ))}

                    </div>

                    

                    {/* Arrow Buttons - Only show if more than 3 products */}

                    {latestStyleProducts.length >= 3 && (

                      <>

                        {/* Left Arrow - Only show when scrolled right */}

                        {canScrollLeft && (

                          <button

                            onClick={() => scrollLatestProducts('left')}

                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"

                          >

                            <ChevronLeft className="w-6 h-6" />

                          </button>

                        )}

                        

                        {/* Right Arrow - Show when can scroll right or when at end */}

                        {(canScrollRight || isAtEndLatest) && (
                          <button
                            onClick={() => isAtEndLatest ? window.location.href = '/shop/style' : scrollLatestProducts('right')}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 ${
                              isAtEndLatest 
                                ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 font-bold text-sm' 
                                : 'bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10'
                            }`}
                          >
                            {isAtEndLatest ? 'Explore More →' : <ChevronRight className="w-6 h-6" />}
                          </button>
                        )}

                      </>

                    )}

                  </div>

                  

                </div>

              )}

              {!latestStyleLoading && (!latestStyleProducts || latestStyleProducts.length === 0) && (

                <div className="text-center py-12">

                  <Shirt className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                  <h3 className="text-xl font-semibold text-black mb-2">No Latest Styles</h3>

                  <p className="text-gray-500">Add your latest products to showcase here!</p>

                </div>

              )}

              {latestStyleLoading && (

                <div className="flex justify-center py-8">

                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

                </div>

              )}

            </div>

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

          {/* Image and Content Layout */}

          <div className="flex flex-col lg:flex-row items-start gap-12">

            {/* Left Side Content */}

            <div className="lg:w-2/3 flex-1">

              {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (

                <div className="relative">

                  {/* Horizontal Scroll Container */}

                  <div className="relative">

                    <div 

                      ref={babyCareProductsRef}

                      className="flex gap-12 overflow-hidden scroll-smooth pb-4"

                      style={{ 

                        scrollbarWidth: 'none', 

                        msOverflowStyle: 'none'

                      }}

                    >

                      {babyCareProducts.slice(0, 3).map((product, index) => (

                        <div key={product.id || `baby-care-${index}`} className="flex-shrink-0 w-64">

                          <ProductCard product={product} index={index} />

                        </div>

                      ))}

                    </div>

                    

                    {/* Arrow Buttons - Only show if more than 3 products */}

                    {babyCareProducts.length > 3 && (

                      <>

                        {/* Left Arrow - Only show when scrolled right */}

                        {canScrollLeftBabyCare && (

                          <button

                            onClick={() => scrollBabyCareProducts('left')}

                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"

                          >

                            <ChevronLeft className="w-6 h-6" />

                          </button>

                        )}

                        

                        {/* Right Arrow - Show when can scroll right or when at end */}

                        {(canScrollRightBabyCare || isAtEndBabyCare) && (
                          <button
                            onClick={() => isAtEndBabyCare ? window.location.href = '/shop/style' : scrollBabyCareProducts('right')}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 ${
                              isAtEndBabyCare 
                                ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 font-bold text-sm' 
                                : 'bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10'
                            }`}
                          >
                            {isAtEndBabyCare ? 'Explore More →' : <ChevronRight className="w-6 h-6" />}
                          </button>
                        )}

                      </>

                    )}

                  </div>

                  

                </div>

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

            {/* Right Side Image - Increased Size */}

            <div className="lg:w-1/4 flex-shrink-0">

              <img 

                src="/latest-products.png" 

                alt="Muslin Clothing" 

                className="w-full h-auto object-contain mx-auto lg:mx-0"

              />

            </div>

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

            <h2 className="text-4xl font-bold mb-4 animate-pulse bg-gradient-to-r from-black via-gray-600 to-gray-300 bg-clip-text text-transparent drop-shadow-lg" style={{ animationDuration: '1.5s' }}>Combo Offers</h2>

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

              <ProductGrid 

                products={superSaverProducts.slice(0, 3)} 

                title=""

                layout="boxed"

              />

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



      {/* Announcement Slider */}

      <section className="w-full bg-gradient-to-r from-primary to-secondary py-6 overflow-hidden">

        <div className="relative">

          <div className="flex animate-scroll whitespace-nowrap">

            {/* First set of announcements */}

            <div className="inline-flex items-center gap-8 px-8">

              <span className="text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Comfort Starts Here</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Dress Your Baby in Care</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Wrap Them in Wonder</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Elevate Every Cuddle</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

            </div>

            {/* Second set for seamless loop */}

            <div className="inline-flex items-center gap-8 px-8">

              <span className="text-2xl font-bold text-black">Happy Babies , Happy Parents !</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Comfort Starts Here</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Pure Comfort for Tiny Hugs</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Dress Your Baby in Care</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Wrap Them in Wonder</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

              <span className="text-2xl font-bold text-black">Elevate Every Cuddle</span>

              <span className="text-2xl font-semibold text-black/80">•</span>

            </div>

          </div>

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

          

          {/* Image and Content Layout */}

          <div className="flex flex-col lg:flex-row items-start gap-12">

            {/* Left Side Image */}

            <div className="lg:w-1/4 flex-shrink-0 pb-8">

              <img 

                src="/featured-products.png" 

                alt="Featured Products" 

                className="w-full h-auto object-contain mx-auto lg:mx-0 max-h-[80%] object-top"

              />

            </div>

            

            {/* Right Side Content */}

            <div className="lg:w-2/3 flex-1">

              {!featuredLoading && featuredProducts && featuredProducts.length > 0 && (

                <div className="relative">

                  {/* Horizontal Scroll Container */}

                  <div className="relative">

                    <div 

                      ref={featuredProductsRef}

                      className="flex gap-4 overflow-hidden scroll-smooth pb-4"

                      style={{ 

                        scrollbarWidth: 'none', 

                        msOverflowStyle: 'none'

                      }}

                    >

                      {featuredProducts.map((product, index) => (

                        <div key={product.id || `featured-${index}`} className="flex-shrink-0 w-60">

                          <ProductCard product={product} index={index} />

                        </div>

                      ))}

                    </div>

                    

                    {/* Arrow Buttons - Only show if more than 3 products */}

                    {featuredProducts.length > 3 && (

                      <>

                        {/* Left Arrow - Only show when scrolled right */}

                        {canScrollLeftFeatured && (

                          <button

                            onClick={() => scrollFeaturedProducts('left')}

                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"

                          >

                            <ChevronLeft className="w-6 h-6" />

                          </button>

                        )}

                        

                        {/* Right Arrow - Show when can scroll right or when at end */}

                        {(canScrollRightFeatured || isAtEndFeatured) && (
                          <button
                            onClick={() => isAtEndFeatured ? window.location.href = '/shop/style' : scrollFeaturedProducts('right')}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 ${
                              isAtEndFeatured 
                                ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 font-bold text-sm' 
                                : 'bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10'
                            }`}
                          >
                            {isAtEndFeatured ? 'Explore More' : <ChevronRight className="w-6 h-6" />}
                          </button>
                        )}

                      </>

                    )}

                  </div>

                  

                  {/* Explore More Button - Only show when at end */}

                  {isAtEndFeatured && (
                    <div className="text-center mt-6">

                      <Link 

                        href="/shop/style"

                        className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"

                      >

                        Explore More

                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />

                        </svg>

                      </Link>

                    </div>
                  )}

                </div>

              )}

              {!featuredLoading && (!featuredProducts || featuredProducts.length === 0) && (

                <div className="text-center py-12">

                  <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />

                  <h3 className="text-xl font-semibold text-black mb-2">No Featured Products</h3>

                  <p className="text-gray-500">Add featured products to showcase here!</p>

                </div>

              )}

              {featuredLoading && (

                <div className="flex justify-center py-8">

                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

                </div>

              )}

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

    </div>

  );

}

