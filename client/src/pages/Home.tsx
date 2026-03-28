import { Link } from "wouter";

import { Button } from "@/components/Button";

import { ProductCard } from "@/components/ProductCard";

import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useSuperSaverProducts, useFeaturedProducts } from "@/hooks/useProducts";

import { motion } from "framer-motion";

import Slider from "@/components/Slider";

import CategoryCard from "@/components/CategoryCard";

import ProductGrid from "@/components/ProductGrid";

import { Baby, Shirt, Moon, Package, Heart, Star, ShoppingBag, Sparkles, Gift, ChevronLeft, ChevronRight } from "lucide-react";

import { useState, useEffect, useRef } from "react";



export default function Home() {

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

  const latestProductsRef = useRef<HTMLDivElement>(null);

  // Baby Care Essentials scroll state

  const [babyCareScrollPosition, setBabyCareScrollPosition] = useState(0);

  const [canScrollRightBabyCare, setCanScrollRightBabyCare] = useState(false);

  const babyCareProductsRef = useRef<HTMLDivElement>(null);



  // Slider images - easily change these URLs

  const sliderImages = [

    "/banner-hero.jpg",

    "/banner-hero.jpg", 

    "/banner-hero.jpg",

    "/banner-hero.jpg"

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

    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer

  };

  // Check scroll position for Baby Care Essentials

  const checkBabyCareScrollPosition = () => {

    const container = babyCareProductsRef.current;

    if (!container) return;
    
    const scrollLeft = container.scrollLeft;

    const scrollWidth = container.scrollWidth;

    const clientWidth = container.clientWidth;
    
    setBabyCareScrollPosition(scrollLeft);

    setCanScrollRightBabyCare(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer

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



  const scrollLatestProducts = (direction: 'left' | 'right') => {

    const container = latestProductsRef.current;

    if (!container) return;

    

    const scrollAmount = 264 * 4; // One full page (4 cards * 264px each)

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
    
    const scrollAmount = 264 * 4; // One full page (4 cards * 264px each)

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



  // Check if left arrow should be visible

  const canScrollLeft = latestScrollPosition > 0;

  const canScrollLeftBabyCare = babyCareScrollPosition > 0;



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

      <section className="w-full">

        <div className="pt-0 pb-8 lg:pb-16 lg:pt-2 px-4 sm:px-6 lg:px-8">

          <motion.div 

            initial={{ opacity: 0, y: 30 }}

            whileInView={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.8, ease: "easeOut" }}

            className="text-center mb-12"

          >

            <h2 className="text-4xl font-bold text-black mb-4">Shop by Style</h2>

            <p className="text-gray-600 text-lg">Discover our latest collection of stylish baby wear</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>

          

          {/* Style Categories Grid */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-100/40 via-gray-50/50 to-gray-100/40 py-10 rounded-3xl shadow-inner">

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-primary transition-colors">Jhablas</h3>

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-primary transition-colors">Coats</h3>

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

                  <h3 className="text-base font-bold text-black text-center group-hover:text-primary transition-colors">Boys Wear</h3>

                </div>

              </div>

            </Link>

          </div>

        </div>

      </section>



      {/* Latest Style Products Section */}

      <section className="w-full">

        <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <h2 className="text-4xl font-bold text-black mb-4">Latest Style Products</h2>

            <p className="text-gray-600 text-lg">Check out our newest arrivals and trending styles</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

            </div>

          </motion.div>



          {/* Image and Content Layout */}

          <div className="flex flex-col lg:flex-row items-start gap-8">

            {/* Left Side Image - Increased Size */}

            <div className="lg:w-1/4 flex-shrink-0">

              <img 

                src="/latest-products.png" 

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

                      className="flex gap-4 overflow-hidden scroll-smooth pb-4"

                      style={{ 

                        scrollbarWidth: 'none', 

                        msOverflowStyle: 'none'

                      }}

                    >

                      {latestStyleProducts.map((product, index) => (

                        <div key={product.id || `latest-${index}`} className="flex-shrink-0 w-60">

                          <ProductCard product={product} index={index} />

                        </div>

                      ))}

                    </div>

                    

                    {/* Arrow Buttons - Only show if more than 4 products */}

                    {latestStyleProducts.length > 4 && (

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

                        

                        {/* Right Arrow - Show only when can scroll right */}

                        {canScrollRight && (

                          <button

                            onClick={() => scrollLatestProducts('right')}

                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"

                          >

                            <ChevronRight className="w-6 h-6" />

                          </button>

                        )}

                      </>

                    )}

                  </div>

                  

                  {/* Explore More Button */}

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



      {/* Baby Care Essentials Section */}

      <section className="w-full">

        <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <h2 className="text-4xl font-bold text-black mb-4">Baby Care Essentials</h2>

            <p className="text-gray-600 text-lg">Everything you need for your baby's daily care routine</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          {/* Image and Content Layout */}

          <div className="flex flex-col lg:flex-row items-start gap-8">

            {/* Left Side Content */}

            <div className="lg:w-2/3 flex-1">

              {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (

                <div className="relative">

                  {/* Horizontal Scroll Container */}

                  <div className="relative">

                    <div 

                      ref={babyCareProductsRef}

                      className="flex gap-4 overflow-hidden scroll-smooth pb-4"

                      style={{ 

                        scrollbarWidth: 'none', 

                        msOverflowStyle: 'none'

                      }}

                    >

                      {babyCareProducts.map((product, index) => (

                        <div key={product.id || `baby-care-${index}`} className="flex-shrink-0 w-60">

                          <ProductCard product={product} index={index} />

                        </div>

                      ))}

                    </div>

                    

                    {/* Arrow Buttons - Only show if more than 4 products */}

                    {babyCareProducts.length > 4 && (

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

                        

                        {/* Right Arrow - Show only when can scroll right */}

                        {canScrollRightBabyCare && (

                          <button

                            onClick={() => scrollBabyCareProducts('right')}

                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"

                          >

                            <ChevronRight className="w-6 h-6" />

                          </button>

                        )}

                      </>

                    )}

                  </div>

                  

                  {/* Explore More Button */}

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

                src="/essentials.png" 

                alt="Baby Care Essentials" 

                className="w-full h-auto object-contain mx-auto lg:mx-0"

              />

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



      {/* Super Saver Offers Section */}

      <section className="w-full bg-red-100 py-12">

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-8"

          >

            <h2 className="text-4xl font-bold mb-4 animate-pulse bg-gradient-to-r from-black via-gray-600 to-gray-300 bg-clip-text text-transparent drop-shadow-lg" style={{ animationDuration: '1.5s' }}>Super Saver Offers</h2>

            <p className="text-gray-600 text-lg">Amazing deals and discounts on your favorite baby products</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

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



      {/* Featured Products Section */}

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <div className="relative rounded-[2.5rem] overflow-hidden bg-white p-8 lg:p-16">

          <motion.div 

            initial={{ opacity: 0, y: 20 }}

            whileInView={{ opacity: 1, y: 0 }}

            className="text-center mb-12"

          >

            <h2 className="text-4xl font-bold text-black mb-4">Featured Products</h2>

            <p className="text-gray-600 text-lg">Handpicked favorites and customer top-rated items</p>

            <div className="flex justify-center gap-2 mt-4">

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

              <div className="w-12 h-1 bg-primary rounded-full"></div>

              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>

            </div>

          </motion.div>

          

          {!featuredLoading && featuredProducts && featuredProducts.length > 0 && (

            <ProductGrid 

              products={featuredProducts.slice(0, 8)} 

              title=""

            />

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

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-secondary to-secondary/80"></div>

            </div>

          )}

        </div>

      </section>



      {/* About Us / Contact Us / Know Us Links */}

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary to-secondary p-8 lg:p-16">

          <div className="grid md:grid-cols-3 gap-8 mb-12">

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

          

          <div className="grid md:grid-cols-3 gap-8">

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

