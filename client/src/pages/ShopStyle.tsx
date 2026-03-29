import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { Sparkles, Filter, X } from "lucide-react";
import { useStyleProducts } from "@/hooks/useProducts";

export default function ShopStyle() {
  // Fetch all style products (no subcategory filter)
  const { data: products, isLoading } = useStyleProducts();
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['categories']);

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
  const filterSections = [
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
      items: [
        { id: 'under-500', name: 'Under ₹500', count: 25 },
        { id: '500-1000', name: '₹500 - ₹1000', count: 42 },
        { id: '1000-1500', name: '₹1000 - ₹1500', count: 31 },
        { id: 'over-1500', name: 'Over ₹1500', count: 16 },
      ]
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
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[70vh] min-h-[400px] max-h-[600px] mb-8">
        <div className="relative w-full h-full overflow-hidden">
          <div className="relative w-full h-full">
            <img 
              src="/shopbystyle-banner.png"
              alt="Shop by Style - Planet Mini Baby Wear"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='600' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23FEE2E2'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23DC2626' font-size='16' font-family='Arial'%3EShop by Style Banner%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </section>

      {/* Centered Text Section Below Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Shop by Style
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
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
            <span className="bg-primary text-black text-xs px-2 py-1 rounded-full">
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
            lg:block w-64 flex-shrink-0 fixed lg:relative left-0 top-0 h-screen lg:h-auto z-40 lg:z-0
          `}>
            <div className="bg-white lg:rounded-xl lg:border-2 lg:border-t-4 lg:border-t-primary lg:border-r-secondary lg:border-b-primary lg:border-l-secondary lg:shadow-xl h-full lg:h-auto lg:sticky lg:top-4 overflow-y-auto">
              
              {/* Mobile Close Button */}
              <div className="lg:hidden mb-4 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-primary/20">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop Filter Header */}
              <div className="hidden lg:flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border-b border-primary/30">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </h2>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold bg-primary text-black px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Filter Categories - Expandable Sections */}
              <div className="p-4 space-y-3">
                {filterSections.map((section, index) => (
                  <div key={section.id} className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                    {/* Section Header - Clickable to Expand/Collapse */}
                    <button
                      onClick={() => toggleCategory(section.id)}
                      className={`
                        w-full flex items-center justify-between p-3 transition-all duration-200
                        ${index % 2 === 0 
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border-l-4 border-primary' 
                          : 'bg-gradient-to-r from-secondary/20 to-primary/20 hover:from-secondary/30 hover:to-primary/30 border-l-4 border-secondary'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className={`
                          w-4 h-4 transition-colors
                          ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}
                        `} />
                        <span className="font-bold text-black">{section.title}</span>
                      </div>
                      
                      {/* Expand/Collapse Icon */}
                      <svg 
                        className={`
                          w-4 h-4 transition-transform duration-200 text-black
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
                      ${expandedCategories.includes(section.id) ? 'max-h-96' : 'max-h-0'}
                    `}>
                      <div className={`
                        p-3 space-y-2
                        ${index % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'}
                      `}>
                        {section.items.map((item) => (
                          <label 
                            key={item.id}
                            className={`
                              flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 border
                              ${selectedFilters.includes(item.id)
                                ? index % 2 === 0 
                                  ? 'bg-primary/30 border-primary shadow-sm'
                                  : 'bg-secondary/30 border-secondary shadow-sm'
                                : 'bg-white/80 border-gray-200 hover:bg-gray-100'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              {/* Custom Checkbox */}
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.includes(item.id)}
                                  onChange={() => handleFilterToggle(item.id)}
                                  className="sr-only"
                                />
                                <div className={`
                                  w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center
                                  ${selectedFilters.includes(item.id)
                                    ? index % 2 === 0 
                                      ? 'bg-primary border-primary shadow-md' 
                                      : 'bg-secondary border-secondary shadow-md'
                                    : 'border-gray-400 hover:border-gray-500 bg-white'
                                  }
                                `}>
                                  {selectedFilters.includes(item.id) && (
                                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              
                              <span className="text-sm font-semibold text-black select-none">
                                {item.name}
                              </span>
                            </div>
                            
                            <span className={`
                              text-xs font-bold px-2 py-1 rounded-full border
                              ${index % 2 === 0 
                                ? 'bg-primary text-black border-primary' 
                                : 'bg-secondary text-black border-secondary'
                              }
                            `}>
                              {item.count}
                            </span>
                          </label>
                        ))}
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
                    const category = section?.items.find(item => item.id === filterId);
                    return (
                      <span
                        key={filterId}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {category?.name}
                        <button
                          onClick={() => handleFilterToggle(filterId)}
                          className="hover:text-primary/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Products */}
              {!isLoading && products && products.length > 0 && (
                <div className="p-6">
                  <ProductGrid 
                    products={products} 
                    title=""
                  />
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              {!isLoading && (!products || products.length === 0) && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No style products available yet.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

