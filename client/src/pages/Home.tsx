import { Link } from "wouter";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useStyleProducts, useHomeProducts, useShopByStyleProducts, useLatestStyleProducts, useBabyCareProducts, useSuperSaverProducts, useFeaturedProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import Slider from "@/components/Slider";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import { Baby, Shirt, Moon, Package, Heart, Star, ShoppingBag, Sparkles, Gift } from "lucide-react";

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

  const sliderSlides = [
    {
      id: 1,
      title: "Welcome to\nPlanet Mini",
      subtitle: "Adorable & Comfortable Baby Wear",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600",
      buttonText: "Shop Now",
      buttonLink: "/shop"
    },
    {
      id: 2,
      title: "Soft & Safe\nFabrics",
      subtitle: "Gentle on your baby's delicate skin",
      image: "https://images.unsplash.com/photo-1541697960113-1ca22342bd6d?auto=format&fit=crop&q=80&w=600",
      buttonText: "Explore Collection",
      buttonLink: "/shop/style"
    },
    {
      id: 3,
      title: "Adorable\nDesigns",
      subtitle: "Cute patterns your baby will love",
      image: "https://images.unsplash.com/photo-1606334012513-947a0c0259e1?auto=format&fit=crop&q=80&w=600",
      buttonText: "View Designs",
      buttonLink: "/shop/age"
    }
  ];

  const shopByStyle = [
    { 
      name: "Onesies", 
      description: "Comfortable and adorable onesies for everyday wear",
      icon: "👶", 
      href: "/shop/style?val=onesies",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400",
      productCount: 24
    },
    { 
      name: "Sleepwear", 
      description: "Cozy sleepwear for peaceful nights",
      icon: "🌙", 
      href: "/shop/style?val=sleepwear",
      image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400",
      productCount: 18
    },
    { 
      name: "Cute Outfits", 
      description: "Stylish outfits for special occasions",
      icon: "👗", 
      href: "/shop/style?val=outfits",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=400",
      productCount: 32
    }
  ];

  const babyCareEssentials = [
    { 
      name: "Bath Towels & Robes", 
      description: "Soft and absorbent bath essentials",
      icon: "🛁", 
      href: "/shop/care?val=bath",
      image: "https://images.unsplash.com/photo-1559418306-036f0072cfa1?auto=format&fit=crop&q=80&w=400",
      productCount: 15
    },
    { 
      name: "Bath Toys", 
      description: "Fun toys for bath time",
      icon: "🦆", 
      href: "/shop/care?val=toys",
      image: "https://images.unsplash.com/photo-1628148782352-8705a67978d3?auto=format&fit=crop&q=80&w=400",
      productCount: 22
    },
    { 
      name: "Skincare Products", 
      description: "Gentle care for delicate skin",
      icon: "🧴", 
      href: "/shop/care?val=skincare",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400",
      productCount: 18
    },
    { 
      name: "Bibs & Burp Cloths", 
      description: "Essential feeding accessories",
      icon: "🧷", 
      href: "/shop/care?val=bibs",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400",
      productCount: 25
    }
  ];

  const superSaverOffers = [
    { 
      name: "3-Pack Onesies", 
      description: "Essential onesies pack for everyday comfort",
      icon: "👕", 
      href: "/shop/offers?val=onesies-pack",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400",
      productCount: 12,
      badge: "33% OFF"
    },
    { 
      name: "3-Pack Jablas", 
      description: "Traditional baby wear set",
      icon: "🧥", 
      href: "/shop/offers?val=jablas-pack",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=400",
      productCount: 8,
      badge: "27% OFF"
    },
    { 
      name: "3-Pack Diapers", 
      description: "Ultra-absorbent diapers for all-day protection",
      icon: "🚀", 
      href: "/shop/offers?val=diapers-pack",
      image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400",
      productCount: 15,
      badge: "BEST OFFER"
    },
    { 
      name: "5-Pack Nappies", 
      description: "Soft and gentle nappies for sensitive skin",
      icon: "📦", 
      href: "/shop/offers?val=nappies-pack",
      image: "https://images.unsplash.com/photo-1541697960113-1ca22342bd6d?auto=format&fit=crop&q=80&w=400",
      productCount: 10,
      badge: "38% OFF"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50 space-y-16">
      {/* Hero Section with 8:3 Banner */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-pink-100/70 via-blue-100/60 to-pink-100/50 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="relative w-full" style={{ paddingBottom: '37.5%' }}>
            <img 
              src="/banner-hero.jpg" 
              alt="Hero Banner" 
              className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 rounded-[2.5rem]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 sm:px-6 lg:px-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6"
              >
                Welcome to Planet Mini
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-8"
              >
                Adorable & Comfortable Baby Wear
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-gray-900 px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Style Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
          </motion.div>
          
          {/* Category Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {shopByStyle.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
          
          {/* Dynamic Products */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">Shop by Style Products</h2>
            <p className="text-center text-gray-600 mb-8">Discover our latest collection of stylish baby wear</p>
          </div>
          
          {!shopByStyleLoading && shopByStyleProducts && shopByStyleProducts.length > 0 && (
            <ProductGrid 
              products={shopByStyleProducts.slice(0, 6)} 
              title=""
            />
          )}
          {!shopByStyleLoading && (!shopByStyleProducts || shopByStyleProducts.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
              <p className="text-gray-500 mb-6">Start by adding some products to showcase here!</p>
              <Link 
                href="/admin/add-product"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span>Add First Product</span>
              </Link>
            </div>
          )}
          {shopByStyleLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Style Products Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
          </motion.div>
          
          {/* Dynamic Products */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">Latest Style Products</h2>
            <p className="text-center text-gray-600 mb-8">Check out our newest arrivals and trending styles</p>
          </div>
          
          {!latestStyleLoading && latestStyleProducts && latestStyleProducts.length > 0 && (
            <ProductGrid 
              products={latestStyleProducts.slice(0, 8)} 
              title=""
            />
          )}
          {!latestStyleLoading && (!latestStyleProducts || latestStyleProducts.length === 0) && (
            <div className="text-center py-12">
              <Shirt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Latest Styles</h3>
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
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
          </motion.div>
          
          {/* Category Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {babyCareEssentials.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
          
          {/* Dynamic Products */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">Baby Care Essentials</h2>
            <p className="text-center text-gray-600 mb-8">Everything you need for your baby's daily care routine</p>
          </div>
          
          {!babyCareLoading && babyCareProducts && babyCareProducts.length > 0 && (
            <ProductGrid 
              products={babyCareProducts.slice(0, 4)} 
              title=""
            />
          )}
          {!babyCareLoading && (!babyCareProducts || babyCareProducts.length === 0) && (
            <div className="text-center py-12">
              <Baby className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Baby Care Products</h3>
              <p className="text-gray-500">Add baby care essentials to showcase here!</p>
            </div>
          )}
          {babyCareLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>

      {/* Super Saver Offers Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-yellow-100/50 to-orange-100/50 backdrop-blur-sm border border-white/20 p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
          </motion.div>
          
          {/* Category Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {superSaverOffers.map((offer) => (
              <CategoryCard key={offer.name} {...offer} />
            ))}
          </div>
          
          {/* Dynamic Products */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">Super Saver Offers</h2>
            <p className="text-center text-gray-600 mb-8">Amazing deals and discounts on your favorite baby products</p>
          </div>
          
          {!superSaverLoading && superSaverProducts && superSaverProducts.length > 0 && (
            <ProductGrid 
              products={superSaverProducts.slice(0, 6)} 
              title=""
            />
          )}
          {!superSaverLoading && (!superSaverProducts || superSaverProducts.length === 0) && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Special Offers</h3>
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
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">Featured Products</h2>
            <p className="text-center text-gray-600 mb-8">Handpicked favorites and customer top-rated items</p>
          </div>
          
          {!featuredLoading && featuredProducts && featuredProducts.length > 0 && (
            <ProductGrid 
              products={featuredProducts.slice(0, 8)} 
              title=""
            />
          )}
          {!featuredLoading && (!featuredProducts || featuredProducts.length === 0) && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Products</h3>
              <p className="text-gray-500">Add featured products to showcase here!</p>
            </div>
          )}
          {featuredLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>

      {/* About Us / Contact Us / Know Us Links */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Link href="/about" className="text-center group">
              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">
                <Package className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-primary mb-2">About Us</h3>
                <p className="text-sm text-muted-foreground">Learn more about our story</p>
              </div>
            </Link>
            <Link href="/contact" className="text-center group">
              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-primary mb-2">Contact Us</h3>
                <p className="text-sm text-muted-foreground">Get in touch with us</p>
              </div>
            </Link>
            <Link href="/know-us" className="text-center group">
              <div className="rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-6 group-hover:bg-white/40 transition-all duration-300">
                <Star className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-primary mb-2">Know Us</h3>
                <p className="text-sm text-muted-foreground">Discover our mission</p>
              </div>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Soft & Safe Fabrics</h4>
              <p className="text-sm text-muted-foreground">Gentle on baby's delicate skin</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Eco-Friendly Materials</h4>
              <p className="text-sm text-muted-foreground">Sustainable choices for our planet</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Loved by Parents</h4>
              <p className="text-sm text-muted-foreground">Trusted by families worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Growing Family Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-blue-100/50 backdrop-blur-sm border border-white/20 p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Join the Growing Family!
              <Sparkles className="w-8 h-8 text-primary" />
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300"
                alt="Happy family 1" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=300&h=300"
                alt="Happy family 2" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300&h=300"
                alt="Happy family 3" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-primary">Happy Parents, Happy Babies!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
