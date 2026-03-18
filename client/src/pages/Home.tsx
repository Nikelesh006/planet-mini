import { Link } from "wouter";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useSuperSaverProducts, useFeaturedProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import Slider from "@/components/Slider";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import { Baby, Shirt, Moon, Package, Heart, Star, ShoppingBag, Sparkles, Gift } from "lucide-react";
import { useState, useEffect } from "react";

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
  
  // Slider images - easily change these URLs
  const sliderImages = [
    "/banner-hero.jpg",
    "/banner-hero.jpg", 
    "/banner-hero.jpg",
    "/banner-hero.jpg"
  ];

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [sliderImages.length]);

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
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pb-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white">
          <div className="relative h-[30vw] max-h-[320px] md:max-h-[400px] lg:max-h-[480px]">
            {/* Image Slider */}
            <div className="relative w-full h-full">
              {/* Slider Images */}
              <div className="relative w-full h-full">
                {sliderImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`Hero Slide ${index + 1}`} 
                    className={`w-full h-full object-cover rounded-[2.5rem] transition-opacity duration-1000 ${
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
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white opacity-100' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={goToPrevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Style Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pt-0 pb-8 lg:pb-16 lg:px-16 lg:pt-2">
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
          
          {!shopByStyleLoading && shopByStyleProducts && shopByStyleProducts.length > 0 && (
            <ProductGrid 
              products={shopByStyleProducts.slice(0, 6)} 
              title=""
            />
          )}
          {!shopByStyleLoading && (!shopByStyleProducts || shopByStyleProducts.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No Products Available</h3>
              <p className="text-gray-500 mb-6">Start by adding some products to showcase here!</p>
              <Link 
                href="/admin/add-product"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Add First Product</span>
              </Link>
            </div>
          )}
          {shopByStyleLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-secondary to-secondary/80"></div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Style Products Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white p-8 lg:p-16">
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
          
          {!latestStyleLoading && latestStyleProducts && latestStyleProducts.length > 0 && (
            <ProductGrid 
              products={latestStyleProducts.slice(0, 8)} 
              title=""
            />
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
      </section>

      {/* Baby Care Essentials Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white p-8 lg:p-16">
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
          
          {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (
            <ProductGrid 
              products={babyCareProducts.slice(0, 4)} 
              title=""
            />
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-secondary to-secondary/80"></div>
            </div>
          )}
        </div>
      </section>

      {/* Super Saver Offers Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-black mb-4">Super Saver Offers</h2>
            <p className="text-gray-600 text-lg">Amazing deals and discounts on your favorite baby products</p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-12 h-1 bg-primary rounded-full"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"></div>
              <div className="w-12 h-1 bg-primary rounded-full"></div>
            </div>
          </motion.div>
          
          {!superSaverLoading && superSaverProducts && superSaverProducts.length > 0 && (
            <ProductGrid 
              products={superSaverProducts.slice(0, 6)} 
              title=""
            />
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
