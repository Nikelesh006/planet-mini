import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { BabyCareCard } from "@/components/BabyCareCard";
import { Sparkles, Filter, X } from "lucide-react";
import { useShopByStyleProducts } from "@/hooks/useProducts";
import { Slider } from "@/components/ui/slider";

interface FilterSection {
  id: string;
  title: string;
  icon: any;
  items?: { id: string; name: string; count: number }[];
  isSlider?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export default function ShopStyle() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all home products (same as Home page sections)
  const { data: products, isLoading } = useShopByStyleProducts();
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);

  // Filter categories for baby dresses
  const filterCategories = [
    { id: 'bodysuits', name: 'Bodysuits & Onesies', count: 24 },
    { id: 'dresses', name: 'Dresses & Skirts', count: 18 },
    { id: 'sets', name: 'Outfits & Sets', count: 32 },
    { id: 'sleepwear', name: 'Sleepwear & Pajamas', count: 15 },
    { id: 'rompers', name: 'Rompers & Jumpsuits', count: 21 },
    { id: 'swimwear', name: 'Swimwear', count: 8 },
    { id: 'accessories', name: 'Accessories', count: 12 },
    { id: 'seasonal', name: 'Seasonal Wear', count: 16 },
  ];

  // Filter sections with expandable categories
  const filterSections: FilterSection[] = [
    {
      id: 'categories',
      title: 'Categories',
      icon: Filter,
      items: filterCategories
    },
    {
      id: 'size',
      title: 'Size',
      icon: Filter,
      items: [
        { id: 'newborn', name: 'Newborn (0-3M)', count: 15 },
        { id: 'infant', name: 'Infant (3-6M)', count: 22 },
        { id: 'baby', name: 'Baby (6-12M)', count: 28 },
        { id: 'toddler', name: 'Toddler (1-2Y)', count: 19 },
        { id: 'kids', name: 'Kids (2-3Y)', count: 14 },
      ]
    },
    {
      id: 'color',
      title: 'Color',
      icon: Filter,
      items: [
        { id: 'white', name: 'White', count: 31 },
        { id: 'pink', name: 'Pink', count: 28 },
        { id: 'blue', name: 'Blue', count: 24 },
        { id: 'yellow', name: 'Yellow', count: 18 },
        { id: 'green', name: 'Green', count: 12 },
        { id: 'gray', name: 'Gray & Neutral', count: 21 },
      ]
    },
    {
      id: 'price',
      title: 'Price Range',
      icon: Filter,
      isSlider: true,
      min: 0,
      max: 5000,
      step: 100
    }
  ];

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setMaxPrice(5000);
  };

  // Filter products by max price (show products with price <= maxPrice)
  const filteredProducts = products
    ? products.filter(product => Number(product.price) <= maxPrice)
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section className="relative w-full h-auto sm:h-[70vh] sm:min-h-[400px] sm:max-h-[600px] mb-8">
        <div className="relative w-full h-full overflow-hidden">
          {/* Mobile Banner - Only visible on small screens */}
          <div className="sm:hidden relative w-full h-auto select-none">
            <img 
              src="/mobile-shopstyle-banner.png"
              alt="Shop by Style - Planet Mini Baby Wear"
              className="w-full h-auto object-contain pointer-events-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='16' font-family='Arial'%3EMobile Shop Style Banner%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* Desktop Banner - Only visible on sm and larger screens */}
          <div className="hidden sm:block relative w-full h-full select-none">
            <img 
              src="/shopbystyle-banner.png"
              alt="Shop by Style - Planet Mini Baby Wear"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='600' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='16' font-family='Arial'%3EShop by Style Banner%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </section>

      {/* Category Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 py-6">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-8 md:gap-10">
          {[
            { id: 'jhlablas', name: 'Jhlablas', icon: '👶' },
            { id: 'hooded-towels', name: 'Hooded Towels', icon: '🧸' },
            { id: 'beds', name: 'Beds', icon: '🛏️' },
            { id: 'muslin', name: 'Muslin', icon: '🧣' },
            { id: 'napkins', name: 'Napkins', icon: '👕' },
            { id: 'rompers', name: 'Rompers', icon: '👗' },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterToggle(category.id)}
              className={`
                flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-8 rounded-2xl transition-all duration-300 border-2
                ${selectedFilters.includes(category.id)
                  ? 'bg-red-100 border-red-500 shadow-xl scale-110'
                  : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg hover:scale-110'
                }
              `}
            >
              <div className={`
                text-3xl sm:text-6xl transition-transform duration-300
                ${selectedFilters.includes(category.id) ? 'scale-125' : 'hover:scale-125'}
              `}>
                {category.icon}
              </div>
              <span className={`
                text-xs sm:text-lg font-semibold transition-colors
                ${selectedFilters.includes(category.id) ? 'text-red-600' : 'text-gray-700'}
              `}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Centered Text Section Below Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 pt-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-16 mb-4">
              <div className="hidden sm:block flex-1 h-0.5 bg-gray-400"></div>
              <div className="flex items-center gap-2 sm:gap-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                  Shop by Style
                </h2>
                <img
                  src="/baby-cloth.png"
                  alt="Baby Cloth"
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='12' font-family='Arial'%3EBaby%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="hidden sm:block flex-1 h-0.5 bg-gray-400"></div>
            </div>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect style for your little one with our curated collection of adorable baby wear
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {selectedFilters.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {selectedFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Products Section with Full Width Layout */}
      <section className="w-full">
        <div className="flex flex-col lg:flex-row">
          
          {/* Filter Sidebar - Fixed to Left Corner */}
          <aside className={`
            ${isMobileFilterOpen ? 'block' : 'hidden'}
            lg:block w-64 flex-shrink-0 fixed lg:relative left-0 top-16 lg:top-0 h-[calc(100vh-4rem)] lg:h-screen lg:h-auto z-50 lg:z-0
          `}>
            <div className="bg-white lg:rounded-xl lg:border-2 lg:border-t-4 lg:border-t-primary lg:border-r-secondary lg:border-b-primary lg:border-l-secondary lg:shadow-xl h-full lg:h-auto lg:sticky lg:top-4 flex flex-col">

              {/* Mobile Close Button - Sticky */}
              <div className="lg:hidden sticky top-0 z-50 mb-4 flex justify-between items-center p-3 sm:p-4 bg-white/95 backdrop-blur-sm border-b border-primary/20 shadow-sm">
                <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Desktop Filter Header */}
              <div className="hidden lg:flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border-b border-primary/30">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Filter className="w-5 h-5 text-red-500" />
                  Filters
                </h2>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Filter Categories - Expandable Sections */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-2 space-y-2 sm:space-y-3">
                {filterSections.map((section, index) => (
                  <div key={section.id} className="border-2 border-black rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                    {/* Section Header - Clickable to Expand/Collapse */}
                    <button
                      onClick={() => toggleCategory(section.id)}
                      className={`
                        w-full flex items-center justify-between p-2 sm:p-3 transition-all duration-200
                        ${index % 2 === 0
                          ? 'bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-l-4 border-red-500'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-l-4 border-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <section.icon className={`
                          w-3 h-3 sm:w-4 sm:h-4 transition-colors
                          ${index % 2 === 0 ? 'text-red-500' : 'text-gray-700'}
                        `} />
                        <span className="text-sm sm:font-bold text-black">{section.title}</span>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`
                          w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 text-black
                          ${expandedCategories.includes(section.id) ? 'rotate-180' : ''}
                        `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expandable Content */}
                    <div className={`
                      transition-all duration-300 ease-in-out overflow-hidden
                      ${expandedCategories.includes(section.id) ? (section.isSlider ? 'max-h-none' : 'max-h-screen') : 'max-h-0'}
                    `}>
                      <div className={`
                        p-2 sm:p-3 space-y-2 sm:space-y-4
                        ${index % 2 === 0 ? 'bg-red-50' : 'bg-gray-50'}
                      `}>
                        {section.isSlider ? (
                          // Price Range Slider
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-black">
                              <span>₹0</span>
                              <span>₹{maxPrice}</span>
                            </div>
                            <Slider
                              value={[maxPrice]}
                              onValueChange={(val) => setMaxPrice(val[0])}
                              max={section.max || 5000}
                              min={section.min || 0}
                              step={section.step || 100}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-600 text-center">
                              Drag to adjust price range
                            </div>
                          </div>
                        ) : (
                          // Regular checkbox items
                          section.items?.map((item) => (
                            <label
                              key={item.id}
                              className={`
                                flex items-center justify-between p-2 sm:p-2 rounded-md cursor-pointer transition-all duration-200 border
                                ${selectedFilters.includes(item.id)
                                  ? index % 2 === 0
                                    ? 'bg-red-100 border-red-500 shadow-sm'
                                    : 'bg-gray-100 border-gray-700 shadow-sm'
                                  : 'bg-white/80 border-gray-200 hover:bg-gray-100'
                                }
                              `}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                {/* Custom Checkbox */}
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.includes(item.id)}
                                    onChange={() => handleFilterToggle(item.id)}
                                    className="sr-only"
                                  />
                                  <div className={`
                                    w-3 h-3 sm:w-4 sm:h-4 rounded border-2 transition-all duration-200 flex items-center justify-center
                                    ${selectedFilters.includes(item.id)
                                      ? index % 2 === 0
                                        ? 'bg-red-500 border-red-500 shadow-md'
                                        : 'bg-gray-700 border-gray-700 shadow-md'
                                      : 'border-gray-400 hover:border-gray-500 bg-white'
                                    }
                                  `}>
                                    {selectedFilters.includes(item.id) && (
                                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>

                                <span className="text-xs sm:text-sm font-semibold text-black select-none">
                                  {item.name}
                                </span>
                              </div>

                              <span className={`
                                text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border
                                ${expandedCategories.includes(section.id)
                                  ? 'bg-red-500 text-white border-red-500'
                                  : index % 2 === 0
                                    ? 'bg-gray-200 text-gray-700 border-gray-400'
                                    : 'bg-gray-200 text-gray-700 border-gray-400'
                                }
                              `}>
                                {item.count}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {isMobileFilterOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Products Content */}
          <div className="flex-1">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pb-8 lg:pb-16">
              
              {/* Active Filters Display */}
              {selectedFilters.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedFilters.map(filterId => {
                    const section = filterSections.find(sec => sec.id === filterId);
                    const category = section?.items?.find(item => item.id === filterId);
                    return (
                      <span
                        key={filterId}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      >
                        {category?.name}
                        <button
                          onClick={() => handleFilterToggle(filterId)}
                          className="hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Products */}
              {!isLoading && filteredProducts && filteredProducts.length > 0 && (
                <div className="w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                    {filteredProducts.map((product, index) => (
                      <BabyCareCard key={product.id || `style-${index}`} product={product} index={index} />
                    ))}
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              )}
              {!isLoading && (!filteredProducts || filteredProducts.length === 0) && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products match the selected price range.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

