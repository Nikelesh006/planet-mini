import { motion } from "framer-motion";











import { Link, useLocation } from "wouter";











import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";











import { BabyCareCard } from "@/components/BabyCareCard";
import { CustomBagBundleSummary } from "@/components/CustomBagBundleSummary";
import { useCustomBagBundle } from "@/contexts/CustomBagBundleContext";











import { Sparkles, Filter, Search, X } from "lucide-react";











import { useBlockbusterProducts, useGiftingProducts, useProducts, useShopByStyleProducts } from "@/hooks/useProducts";



import { useQueryClient } from "@tanstack/react-query";











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























const isProductInStep = (product: any, stepNumber: number) => {
  const category = (product.category || "").toLowerCase().trim();
  const subcategory = (product.subcategory || "").toLowerCase().trim();
  const subcategoryItem = (product.subcategoryItem || "").toLowerCase().trim();
  const styleGroup = (product.styleGroup || "").toLowerCase().trim();
  const productName = (product.name || "").toLowerCase().trim();
  const description = (product.description || "").toLowerCase().trim();
  const styleVariant = (product.styleVariant || "").toLowerCase().trim();
  
  if (stepNumber === 1) {
    const targetTerms = ['towels and blankets', 'towels & blankets', 'beds', 'towels', 'blankets'];
    return targetTerms.some(term => 
      styleGroup.includes(term) || 
      subcategoryItem.includes(term) ||
      subcategory.includes(term) ||
      productName.includes(term) || 
      description.includes(term) || 
      styleVariant.includes(term)
    );
  }
  
  if (stepNumber === 2) {
    const targetTerms = ['jhablas'];
    return targetTerms.some(term => 
      styleGroup.includes(term) || 
      subcategoryItem.includes(term) ||
      subcategory.includes(term) ||
      productName.includes(term) || 
      description.includes(term) || 
      styleVariant.includes(term)
    ) || product.productType === 'combo' || subcategory.includes('hospital bag');
  }
  
  if (stepNumber === 3) {
    const targetTerms = ['nappies', 'wipes', 'new born accessories', 'newborn accessories'];
    return targetTerms.some(term => 
      styleGroup.includes(term) || 
      subcategoryItem.includes(term) ||
      subcategory.includes(term) ||
      productName.includes(term) || 
      description.includes(term) || 
      styleVariant.includes(term)
    );
  }
  
  return false;
};

const STYLE_MAPPING: Record<string, { name: string; icon: string; variants: { id: string; name: string }[] }> = {
  'jhablas': { 
    name: 'Jhablas', 
    icon: '👶',
    variants: [{ id: 'knot-jhablas', name: 'Knot Jhablas' }, { id: 'button-jhablas', name: 'Button Jhablas' }] 
  },
  'towels': { 
    name: 'Towels and Blankets', 
    icon: '🧸',
    variants: [{ id: 'hooded-towels', name: 'Hooded Towels' }, { id: 'swaddle', name: 'Swaddle' }] 
  },
  'nappies': { 
    name: 'Nappies', 
    icon: '👕',
    variants: [] 
  },
  'wipes': { 
    name: 'Wipes', 
    icon: '🧻',
    variants: [] 
  },
  'newborn-accessories': { 
    name: 'Newborn Accessories', 
    icon: '🎀',
    variants: [{ id: 'hat', name: 'Hat' }, { id: 'mittens', name: 'Mittens' }, { id: 'booties', name: 'Booties' }] 
  },
  'beds': { 
    name: 'Beds', 
    icon: '🛏️',
    variants: [{ id: 'baby-nest', name: 'Baby Nest' }, { id: 'baby-net-bed', name: 'Baby Net Bed' }] 
  }
};

export default function ShopStyle() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<number>(0);

  const { bundleItems, addToBundle, removeFromBundle, updateQuantity, bundleTotal, totalItems } = useCustomBagBundle();

  const handleStepClick = (stepId: number) => {
    if (customMode) {
      // Validate step 1
      if (stepId > 1) {
        const hasStep1Item = bundleItems.some(item => isProductInStep(item.product, 1));
        if (!hasStep1Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Nursing & Bedding (Step 1) to your bundle.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Validate step 2
      if (stepId > 2) {
        const hasStep2Item = bundleItems.some(item => isProductInStep(item.product, 2));
        if (!hasStep2Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Baby Clothing (Step 2) to your bundle.",
            variant: "destructive"
          });
          return;
        }
      }

      // Validate step 3 and navigate to review
      if (stepId === 4) {
        const hasStep3Item = bundleItems.some(item => isProductInStep(item.product, 3));
        if (!hasStep3Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Other Essentials (Step 3) to your bundle.",
            variant: "destructive"
          });
          return;
        }
        setLocation('/bundle-review');
        return;
      }
      
      setCurrentStep(stepId);
    } else {
      setCurrentStep(stepId);
    }
  };











  // Scroll to top when component mounts











  useEffect(() => {











    window.scrollTo(0, 0);











  }, []);























  const searchParams = new URLSearchParams(window.location.search);











  const isBlockbusterSection = searchParams.get("section") === "blockbuster-combos";











  const isHospitalBagsSection = searchParams.get("section") === "hospital-bags";











  const isGiftingSection = searchParams.get("section") === "gifting";







  const homeFilter = searchParams.get("filter");



  const searchParam = searchParams.get("search");



  const customMode = searchParams.get("custom") === "true";

  // Set Step 1 as default when in custom mode
  useEffect(() => {
    if (customMode) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [customMode]);



























  // Fetch all home products (same as Home page sections)











  const { data: styleProducts, isLoading: styleLoading } = useShopByStyleProducts();











  const { data: blockbusterProducts, isLoading: blockbusterLoading } = useBlockbusterProducts();











  const { data: hospitalBagsProducts, isLoading: hospitalBagsLoading } = useProducts({











    category: "home",











    subcategory: "Hospital Bags",











  });











  const { data: giftingSectionProducts, isLoading: giftingSectionLoading } = useGiftingProducts();







  // Fetch all products for custom mode - always fetch to ensure availability



  const { data: allProducts, isLoading: allProductsLoading } = useProducts();











  const products = customMode

    ? (allProducts || [])

    : (isBlockbusterSection

      ? blockbusterProducts

 

      : isHospitalBagsSection

        ? hospitalBagsProducts

        : isGiftingSection

          ? giftingSectionProducts

          : homeFilter === 'hospital-bags'

            ? (() => {
                // Merge styleProducts and hospitalBagsProducts, deduplicating by id
                const style = styleProducts || [];
                const hospital = hospitalBagsProducts || [];
                const merged = [...style];
                const existingIds = new Set(style.map((p: any) => p.id));
                for (const p of hospital) {
                  if (!existingIds.has(p.id)) {
                    merged.push(p);
                  }
                }
                return merged;
              })()

            : styleProducts);











  const isLoading = customMode

    ? allProductsLoading

    : isBlockbusterSection

      ? blockbusterLoading

      : isHospitalBagsSection

        ? hospitalBagsLoading

        : isGiftingSection

          ? giftingSectionLoading

          : homeFilter === 'hospital-bags'

            ? (styleLoading || hospitalBagsLoading)

            : styleLoading;











  











  // Filter state











  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    homeFilter && STYLE_MAPPING[homeFilter] ? [homeFilter] : []
  );

  // Sync selectedFilters from homeFilter URL param on mount / param change
  useEffect(() => {
    if (homeFilter && STYLE_MAPPING[homeFilter]) {
      setSelectedFilters(prev => {
        if (!prev.includes(homeFilter)) return [homeFilter];
        return prev;
      });
    }
  }, [homeFilter]);











  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);











  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);











  const [maxPrice, setMaxPrice] = useState(5000);







  const [searchQuery, setSearchQuery] = useState<string>(searchParam || "");























  // Filter categories for Shop by Style











  const filterCategories = [











    { id: 'jhlablas', name: 'Jhablas', count: 24 },











    { id: 'towels', name: 'Towels & Blankets', count: 18 },











    { id: 'nappies', name: 'Nappies', count: 32 },











    { id: 'wipes', name: 'Wipes', count: 15 },











    { id: 'beds', name: 'Beds', count: 21 },











    { id: 'newborn-accessories', name: 'Newborn Accessories', count: 12 },











    { id: 'hospital-bags', name: 'Hospital Bags', count: 15 },











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
    const isStyleGroup = !!STYLE_MAPPING[filterId];
    const isCurrentlySelected = selectedFilters.includes(filterId);

    if (isStyleGroup) {
      // When toggling a Style Group, update the URL filter param
      const newParams = new URLSearchParams(window.location.search);
      if (isCurrentlySelected) {
        // Deselecting: remove group and its variants from selectedFilters, clear URL filter
        const groupVariantIds = STYLE_MAPPING[filterId].variants.map(v => v.id);
        setSelectedFilters(prev => prev.filter(id => id !== filterId && !groupVariantIds.includes(id)));
        newParams.delete('filter');
      } else {
        // Selecting: set only this group, clear any previous variants from other groups
        setSelectedFilters([filterId]);
        newParams.set('filter', filterId);
      }
      setLocation(`/shop/style?${newParams.toString()}`);
    } else {
      // Toggling a Style Variant — keep the parent group selected
      setSelectedFilters(prev =>
        prev.includes(filterId)
          ? prev.filter(id => id !== filterId)
          : [...prev, filterId]
      );
    }
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
    // Also clear the filter URL param
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete('filter');
    const paramStr = newParams.toString();
    setLocation(`/shop/style${paramStr ? '?' + paramStr : ''}`);
  };























  const normalizeText = (value: string | undefined | null) =>











    (value || "")











      .toLowerCase()











      .replace(/[']/g, "")











      .replace(/-/g, " ")











      .replace(/\s+/g, " ")











      .trim();























  const matchesHomeFilter = (product: any, filter: string | null) => {



    if (!filter) return true;







    // Style filter: match styleGroup, styleVariant, name, description, or printName
    const filterLower = normalizeText(filter);
    const productName = normalizeText(product.name);
    const productDesc = normalizeText(product.description);
    const productPrintName = normalizeText(product.printName);
    const productStyleGroup = normalizeText(product.styleGroup);
    const productStyleVariant = normalizeText(product.styleVariant);

    const matchesStyle =
      productStyleGroup === filterLower ||
      productStyleGroup.includes(filterLower) ||
      productStyleVariant === filterLower ||
      productStyleVariant.includes(filterLower) ||
      productName.includes(filterLower) ||
      productDesc.includes(filterLower) ||
      productPrintName.includes(filterLower);







    // Special handling for hospital-bags filter - match subcategory and category



    if (filter.toLowerCase() === 'hospital-bags') {



      const subcategory = normalizeText(product.subcategory);



      const category = normalizeText(product.category);



      // Match both "hospital bag" and "hospital bags" AND ensure category is 'home'
      return (subcategory.includes('hospital bag') || subcategory.includes('hospital bags')) && category === 'home';



    }







    return matchesStyle;



  };







  const matchesSearch = (product: any, keyword: string) => {



    if (!keyword) return true;







    const searchTerm = keyword.trim().toLowerCase();







    // Search filter: match any of the specified fields



    return (



      (product as any).styleGroup?.toLowerCase().includes(searchTerm) ||



      (product as any).styleVariant?.toLowerCase().includes(searchTerm) ||



      (product as any).printName?.toLowerCase().includes(searchTerm) ||



      (product as any).collectionName?.toLowerCase().includes(searchTerm) ||



      (product as any).collectionPrintName?.toLowerCase().includes(searchTerm) ||



      product.name?.toLowerCase().includes(searchTerm) ||



      product.description?.toLowerCase().includes(searchTerm)



    );



  };







  const filteredProducts = products











    ? products











        .filter(product => Number(product.sellingPrice) <= maxPrice)







        .filter(product => customMode || matchesHomeFilter(product, homeFilter))

        .filter(product => {
          if (!currentStep) return true;
          return isProductInStep(product, currentStep);
        })







        .filter(product => matchesSearch(product, searchQuery))

        // Style Variant filter: if any variant IDs are selected, filter by styleVariant, name, desc, etc.
        .filter(product => {
          // Get variant IDs from selectedFilters (exclude group-level keys)
          const selectedVariantIds = selectedFilters.filter(id => !STYLE_MAPPING[id]);
          if (selectedVariantIds.length === 0) return true;
          
          const productStyleVariant = normalizeText(product.styleVariant);
          const productStyleGroup = normalizeText(product.styleGroup);
          const productName = normalizeText(product.name);
          const productDesc = normalizeText(product.description);
          const productPrintName = normalizeText(product.printName);
          
          return selectedVariantIds.some(variantId => {
            const normalizedVariant = normalizeText(variantId.replace(/-/g, ' '));
            return productStyleVariant === normalizedVariant || 
                   productStyleVariant.includes(normalizedVariant) ||
                   productStyleGroup.includes(normalizedVariant) ||
                   productName.includes(normalizedVariant) ||
                   productDesc.includes(normalizedVariant) ||
                   productPrintName.includes(normalizedVariant);
          });
        })











        .filter(product => {



          // Skip section filters in custom mode



          if (customMode) return true;







          const category = normalizeText(product.category);











          const subcategory = normalizeText(product.subcategory);











          if (isBlockbusterSection) {











            return category === "home" && (











              subcategory === "blockbuster combos" ||











              subcategory === "blockbuster combo" ||











              subcategory.includes("blockbuster combo")











            );











          }











          if (isHospitalBagsSection) {











            return category === "home" && (











              subcategory === "hospital bags" ||











              subcategory === "hospital bag" ||











              subcategory.includes("hospital bag")











            );











          }











          if (isGiftingSection) {











            return category === "home" && (











              subcategory === "gifting" ||











              subcategory === "gift" ||











              subcategory.includes("gift")











            );











          }











          return true;











        })











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























      {/* Style Group & Variant Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 py-6">
        {/* Style Groups Row */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-8 md:gap-10">
          {Object.entries(STYLE_MAPPING)
            .filter(([groupId]) => {
              const activeGroupId = selectedFilters.find(id => STYLE_MAPPING[id]);
              return activeGroupId ? groupId === activeGroupId : true;
            })
            .map(([groupId, group]) => (
            <button
              key={groupId}
              onClick={() => handleFilterToggle(groupId)}
              className={`
                flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-8 rounded-2xl transition-all duration-300 border-2
                ${selectedFilters.includes(groupId)
                  ? 'bg-red-100 border-red-500 shadow-xl scale-110'
                  : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg hover:scale-110'
                }
              `}
            >
              <div className={`
                text-3xl sm:text-6xl transition-transform duration-300
                ${selectedFilters.includes(groupId) ? 'scale-125' : 'hover:scale-125'}
              `}>
                {group.icon}
              </div>
              <span className={`
                text-xs sm:text-lg font-semibold transition-colors
                ${selectedFilters.includes(groupId) ? 'text-red-600' : 'text-gray-700'}
              `}>
                {group.name}
              </span>
            </button>
          ))}
        </div>

        {/* Style Variants Row — only shown when a group with variants is selected */}
        {(() => {
          const activeGroupId = selectedFilters.find(id => STYLE_MAPPING[id]);
          const activeGroup = activeGroupId ? STYLE_MAPPING[activeGroupId] : null;
          if (!activeGroup || activeGroup.variants.length === 0) return null;

          return (
            <div className="mt-6">
              <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Style Variants
              </h3>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {activeGroup.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => handleFilterToggle(variant.id)}
                    className={`
                      px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 border-2
                      ${selectedFilters.includes(variant.id)
                        ? 'bg-red-500 text-white border-red-500 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:shadow-md'
                      }
                    `}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Clear filters button when any filter is active */}
        {selectedFilters.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
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















      {/* Customise Hospital Bags Button */}







      {homeFilter === 'hospital-bags' && (







        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">







          <div className="text-center">







            <button







              onClick={() => window.location.href = '/shop/style?custom=true&filter=hospital-bags'}







              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"







            >







              <Sparkles className="w-5 h-5" />







              Customise Your Own Hospital Bags







            </button>

            {/* Step Filters - Only in custom mode */}
            {customMode && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleStepClick(1)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-semibold">Step 1:</span>
                  <span className="text-sm">Nursing & Bedding</span>
                </button>
                <button
                  onClick={() => handleStepClick(2)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    currentStep === 2
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-semibold">Step 2:</span>
                  <span className="text-sm">Baby Clothing</span>
                </button>
                <button
                  onClick={() => handleStepClick(3)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    currentStep === 3
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-semibold">Step 3:</span>
                  <span className="text-sm">Other Essentials</span>
                </button>
              </div>
            )}

            {/* Next Step Buttons - Only in custom mode */}
            {customMode && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {currentStep === 1 && (
                  <button
                    onClick={() => handleStepClick(2)}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors bg-black text-white shadow-lg hover:bg-gray-800"
                  >
                    <span className="text-sm font-semibold">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {currentStep === 2 && (
                  <button
                    onClick={() => handleStepClick(3)}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors bg-black text-white shadow-lg hover:bg-gray-800"
                  >
                    <span className="text-sm font-semibold">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    onClick={() => handleStepClick(4)}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors bg-black text-white shadow-lg hover:bg-gray-800"
                  >
                    <span className="text-sm font-semibold">Review Bundle</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}

          </div>







        </section>







      )}























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











                      <BabyCareCard key={product.id || `style-${index}`} product={product} index={index} customMode={customMode} />











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

      {/* Custom Bag Bundle Summary - Show when in custom mode and has items */}
      {customMode && (
        <>
          {console.log('CustomBagBundleSummary render check:', { customMode, bundleItemsLength: bundleItems.length, bundleItems })}
          <CustomBagBundleSummary
            bundleItems={bundleItems}
            bundleTotal={bundleTotal}
            totalItems={totalItems}
            onRemoveItem={removeFromBundle}
            onUpdateQuantity={updateQuantity}
          />
        </>
      )}











    </div>











  );











}


















































































































































