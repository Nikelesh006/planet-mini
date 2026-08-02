import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { BabyCareCard } from "@/components/BabyCareCard";
import { CustomBagBundleSummary } from "@/components/CustomBagBundleSummary";
import { useCustomBagBundle } from "@/contexts/CustomBagBundleContext";
import { useGiftBundle } from "@/contexts/GiftBundleContext";
import { Sparkles, Filter, Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
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
    const targetTerms = ['jhablas', 'new born accessories', 'newborn accessories', 'nappies'];
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
    const targetTerms = ['towels and blankets', 'towels & blankets', 'towels', 'blankets'];
    return targetTerms.some(term => 
      styleGroup.includes(term) || 
      subcategoryItem.includes(term) ||
      subcategory.includes(term) ||
      productName.includes(term) || 
      description.includes(term) || 
      styleVariant.includes(term)
    );
  }

  if (stepNumber === 3) {
    const targetTerms = ['beds', 'hats'];
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

// Gift mode step filtering function
const isGiftProductInStep = (product: any, stepNumber: number) => {

  const category = (product.category || "").toLowerCase().trim();
  const subcategory = (product.subcategory || "").toLowerCase().trim();
  const subcategoryItem = (product.subcategoryItem || "").toLowerCase().trim();
  const styleGroup = (product.styleGroup || "").toLowerCase().trim();
  const productName = (product.name || "").toLowerCase().trim();
  const description = (product.description || "").toLowerCase().trim();
  const styleVariant = (product.styleVariant || "").toLowerCase().trim();
  if (stepNumber === 1) {
    // Step 1: Baby Clothing
    const targetTerms = ['jhablas', 'new born accessories', 'newborn accessories', 'nappies'];
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
    // Step 2: Essentials
    const targetTerms = ['towels and blankets', 'towels & blankets', 'towels', 'blankets'];
    return targetTerms.some(term =>
      styleGroup.includes(term) ||
      subcategoryItem.includes(term) ||
      subcategory.includes(term) ||
      productName.includes(term) ||
      description.includes(term) ||
      styleVariant.includes(term)
    );
  }

  if (stepNumber === 3) {
    // Step 3: Bedding & Comfort
    const targetTerms = ['beds', 'hats'];
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


// Product classification mapping (single source of truth for Shop by Style filtering)
const PRODUCT_CLASSIFICATION: Record<string, string[]> = {
  Jhablas: ["Knot Jhablas", "Button Jhablas"],
  Nappies: ["Nappies"],
  "Towels & blankets": ["Hooded towels", "Swaddle", "Bath towels", "Quilt towels"],
  Beds: ["Baby nest", "Baby net bed"],
  "New born accessories": ["Dry Sheets", "Wipes", "Booties", "Mittens"],
  Hats: ["Hats"]
};

// Map each style group id to a circular image asset (mirrors the Home page Shop by Style).
// Used as a fallback when no dedicated image exists for a style group.
const STYLE_GROUP_IMAGES: Record<string, string> = {
  'jhablas': '/pmf2.jpeg',
  'towels': '/pmf3.jpeg',
  'nappies': '/pmf4.jpeg',
  'wipes': '/pmf10.jpeg',
  'newborn-accessories': '/pmf8.jpeg',
  'hats': '/pmf7.jpeg',
  'beds': '/pmf5.jpeg',
  'jhlablas': '/pmf2.jpeg',
  'knot-jhablas': '/pmf9.jpeg',
  'button-jhablas': '/pmf2.jpeg',
  'baby-nest': '/pmf6.jpeg',
  'baby-net-bed': '/pmf5.jpeg',
  'newborn-nappies': '/pmf4.jpeg',
  'small-nappies': '/pmf4.jpeg',
  'medium-nappies': '/pmf4.jpeg',
  'large-nappies': '/pmf4.jpeg',
  'dry-sheets': '/pmf8.jpeg',
  'hooded-towels': '/pmf12.jpeg',
  'swaddle': '/pmf11.jpeg',
};

// Helper function to normalize text values for comparison
const normalizeValue = (value: string | undefined | null): string => {
  return (value || "").toLowerCase().trim().replace(/\s+/g, " ");
};

// Helper function to get parent group of a variant (from filter ID)
const getParentGroup = (variantId: string): string | null => {
  const normalizedVariant = normalizeValue(variantId).replace(/-/g, ' ');
  for (const [groupName, variants] of Object.entries(PRODUCT_CLASSIFICATION)) {
    if (variants.some(v => normalizeValue(v) === normalizedVariant)) {
      return groupName;
    }
  }
  return null;
};

// Helper function to get all variants of a group
const getVariantsOfGroup = (groupName: string): string[] => {
  return PRODUCT_CLASSIFICATION[groupName] || [];
};

// Helper function to convert filter ID to variant name
const filterIdToVariantName = (filterId: string): string => {
  // Convert "knot-jhablas" to "Knot Jhablas" by looking up in PRODUCT_CLASSIFICATION
  const normalizedId = normalizeValue(filterId).replace(/-/g, ' ');
  for (const [groupName, variants] of Object.entries(PRODUCT_CLASSIFICATION)) {
    const match = variants.find(v => normalizeValue(v) === normalizedId);
    if (match) return match;
  }
  return filterId;
};

// Helper function to convert filter ID to group name
const filterIdToGroupName = (filterId: string): string => {
  // Convert "jhablas" to "Jhablas" by looking up in PRODUCT_CLASSIFICATION
  const normalizedId = normalizeValue(filterId);
  for (const [groupName, variants] of Object.entries(PRODUCT_CLASSIFICATION)) {
    if (normalizeValue(groupName) === normalizedId) {
      return groupName;
    }
  }
  return filterId;
};

// Helper function to parse subcategory to extract group and variant
const parseSubcategory = (subcategory: string | undefined | null) => {
  if (!subcategory) return { group: '', variant: '' };
  
  const parts = subcategory.split('/').map(p => p.trim());
  if (parts.length === 2) {
    return { group: parts[0], variant: parts[1] };
  } else if (parts.length === 1) {
    return { group: parts[0], variant: '' };
  }
  return { group: '', variant: '' };
};

// Helper function to check if product matches a style group
const matchesStyleGroup = (product: any, groupId: string): boolean => {
  const groupName = filterIdToGroupName(groupId);
  const normalizedGroupName = normalizeValue(groupName);
  
  // Parse subcategory to get actual group
  const { group: subcategoryGroup } = parseSubcategory(product.subcategory);
  const normalizedSubcategoryGroup = normalizeValue(subcategoryGroup);
  
  // Check if product's subcategory group matches the selected group
  return normalizedSubcategoryGroup === normalizedGroupName;
};

// Helper function to check if product matches a style variant
const matchesStyleVariant = (product: any, variantId: string): boolean => {
  const variantName = filterIdToVariantName(variantId);
  const normalizedVariant = normalizeValue(variantName);
  
  // Parse subcategory to get actual variant
  const { variant: subcategoryVariant } = parseSubcategory(product.subcategory);
  const normalizedSubcategoryVariant = normalizeValue(subcategoryVariant);
  
  return normalizedSubcategoryVariant === normalizedVariant;
};

// Helper function to check if product matches Shop by Style filters
const matchesShopStyleFilters = (product: any, selectedFilters: string[]): boolean => {
  if (selectedFilters.length === 0) return true;
  
  // Separate parent groups and variants from selected filters
  const selectedGroups = selectedFilters.filter(filter => PRODUCT_CLASSIFICATION[filter]);
  const selectedVariants = selectedFilters.filter(filter => !PRODUCT_CLASSIFICATION[filter]);
  
  // If no filters selected, return true
  if (selectedGroups.length === 0 && selectedVariants.length === 0) return true;
  
  // Check if product matches any selected variant (variant takes priority)
  if (selectedVariants.length > 0) {
    const matchesAnyVariant = selectedVariants.some(variant => matchesStyleVariant(product, variant));
    if (matchesAnyVariant) return true;
  }
  
  // Check if product matches any selected group (only if no variant match)
  if (selectedGroups.length > 0) {
    const matchesAnyGroup = selectedGroups.some(group => matchesStyleGroup(product, group));
    if (matchesAnyGroup) return true;
  }
  
  return false;
};

const getStyleGroupImage = (groupId: string): string => {
  return STYLE_GROUP_IMAGES[groupId] || '/pmf1.jpeg';
};

// Dynamically build STYLE_MAPPING from PRODUCT_CLASSIFICATION for scalability
const STYLE_MAPPING: Record<string, { name: string; icon: string; variants: { id: string; name: string }[] }> = {};
const GROUP_ICONS: Record<string, string> = {
  'Jhablas': '👶',
  'Nappies': '👕',
  'Towels & blankets': '🧸',
  'Beds': '🛏️',
  'New born accessories': '🎀',
  'Hats': '🧢'
};

for (const [groupName, variants] of Object.entries(PRODUCT_CLASSIFICATION)) {
  const normalizedGroupId = normalizeValue(groupName).replace(/\s+/g, '-');
  STYLE_MAPPING[normalizedGroupId] = {
    name: groupName,
    icon: GROUP_ICONS[groupName] || '📦',
    variants: variants.map(variant => ({
      id: normalizeValue(variant).replace(/\s+/g, '-'),
      name: variant
    }))
  };
}

export default function ShopStyle() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentGiftStep, setCurrentGiftStep] = useState<number>(0);
  const handleStepClick = (stepId: number) => {
    if (customMode) {
      // Validate step 1
      if (stepId > 1) {
        const hasStep1Item = bundleItems.some((item: any) => isProductInStep(item.product, 1));
        if (!hasStep1Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Baby Clothing (Step 1) to your bundle.",
            variant: "destructive"
          });
          return;
        }
      }
      // Validate step 2
      if (stepId > 2) {
        const hasStep2Item = bundleItems.some((item: any) => isProductInStep(item.product, 2));
        if (!hasStep2Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Other Essentials (Step 2) to your bundle.",
            variant: "destructive"
          });
          return;
        }
      }
      // Validate step 3 and navigate to review
      if (stepId === 4) {
        const hasStep3Item = bundleItems.some((item: any) => isProductInStep(item.product, 3));
        if (!hasStep3Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Nursing and Bedding (Step 3) to your bundle.",
            variant: "destructive"
          });
          return;
        }

        setLocation('/bundle-review');
        return;
      }

      setCurrentStep(stepId);
    } else if (giftMode) {
      // Gift mode validation
      // Validate step 1
      if (stepId > 1) {
        const hasStep1Item = giftBundleItems.some((item: any) => isGiftProductInStep(item.product, 1));
        if (!hasStep1Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Baby Clothing (Step 1) to your gift bundle.",
            variant: "destructive"
          });
          return;
        }
      }
      // Validate step 2
      if (stepId > 2) {
        const hasStep2Item = giftBundleItems.some((item: any) => isGiftProductInStep(item.product, 2));
        if (!hasStep2Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Essentials (Step 2) to your gift bundle.",
            variant: "destructive"
          });
          return;
        }
      }
      // Validate step 3 and navigate to gift review
      if (stepId === 4) {
        const hasStep3Item = giftBundleItems.some((item: any) => isGiftProductInStep(item.product, 3));
        if (!hasStep3Item) {
          toast({
            title: "Action Required",
            description: "Please add at least one product from Bedding & Comfort (Step 3) to your gift bundle.",
            variant: "destructive"
          });
          return;
        }

        setLocation('/gift-bundle-review');
        return;
      }

      setCurrentGiftStep(stepId);
    } else {
      setCurrentStep(stepId);
    }

  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const searchParams = new URLSearchParams(window.location.search);
  const homeFilter = searchParams.get("filter");
  const searchParam = searchParams.get("search");
  const customMode = searchParams.get("custom") === "true";
  const giftMode = searchParams.get("custom") === "gift";
  const sectionParam = searchParams.get("section");
  const isBlockbusterSection = sectionParam === "blockbuster-combos";
  const isHospitalBagsSection = sectionParam === "hospital-bags";
  const isGiftingSection = sectionParam === "gifting";
  const { bundleItems, addToBundle, removeFromBundle, updateQuantity, bundleTotal, totalItems } = useCustomBagBundle();
  const { giftBundleItems, addToGiftBundle, removeFromGiftBundle, updateGiftQuantity, giftBundleTotal, giftTotalItems } = useGiftBundle();
  // Set Step 1 as default when in custom mode
  useEffect(() => {
    if (customMode) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }

    if (giftMode) {
      setCurrentGiftStep(1);
    } else {
      setCurrentGiftStep(0);
    }

  }, [customMode, giftMode]);

  // Apply filter from URL parameter on page load
  useEffect(() => {
    if (homeFilter) {
      // Map home filter IDs to actual filter IDs (based on PRODUCT_CLASSIFICATION)
      const filterMapping: Record<string, string> = {
        'wipes': 'new-born-accessories',
        'jhablas': 'jhablas',
        'towels': 'towels-blankets',
        'nappies': 'nappies',
        'beds': 'beds',
        'hospital-bags': 'hospital-bags'
      };
      
      const mappedFilter = filterMapping[homeFilter];
      if (mappedFilter) {
        setSelectedFilters([mappedFilter]);
      }
    }
  }, [homeFilter]);
  // Fetch all products for the master catalog
  const { data: allProducts, isLoading: allProductsLoading } = useProducts();
  const products = (allProducts || []).filter((product: any) => {
    // In custom mode, show all products
    if (customMode) return true;
    // Check if product belongs to home or style category, or has any visibleIn flag
    const isHomeOrStyle = product.category === 'home' || product.category === 'style';
    const hasVisibilityFlag = Object.keys(product).some(key => key.startsWith('visibleIn') && product[key] === true);
    return isHomeOrStyle || hasVisibilityFlag;
  });
  const isLoading = allProductsLoading;
  // Filter state for Shop by Style
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam || "");
  
  // Dynamically build filter categories from PRODUCT_CLASSIFICATION with real product counts
  const filterCategories = Object.entries(PRODUCT_CLASSIFICATION).map(([groupName, variants]) => {
    // Count actual products that belong to this category based on subcategory
    const normalizedGroupName = normalizeValue(groupName);
    const categoryCount = products.filter((product: any) => {
      const { group: subcategoryGroup } = parseSubcategory(product.subcategory);
      const normalizedSubcategoryGroup = normalizeValue(subcategoryGroup);
      const match = normalizedSubcategoryGroup === normalizedGroupName;
      
      // Debug logging for Jhablas
      if (groupName === 'Jhablas' && match) {
        console.log('🔍 Jhablas product match:', {
          productName: product.name,
          subcategory: product.subcategory,
          subcategoryGroup,
          normalizedSubcategoryGroup,
          normalizedGroupName,
          match
        });
      }
      
      return match;
    }).length;
    
    console.log('🔍 Category count:', { groupName, count: categoryCount });
    
    return {
      id: normalizeValue(groupName).replace(/\s+/g, '-'),
      name: groupName,
      count: categoryCount
    };
  });
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
        { id: 'newborn', name: 'Newborn (0-1M)', count: 15 },
        { id: '0-3-months', name: '0-3 Months', count: 22 },
        { id: '3-6-months', name: '3-6 Months', count: 28 },
        { id: '6-9-months', name: '6-9 Months', count: 19 },
        { id: '9-12-months', name: '9-12 Months', count: 14 },
        { id: '12-18-months', name: '12-18 Months', count: 10 },
        { id: '18-24-months', name: '18-24 Months', count: 8 },
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
    console.log('🔄 Filter Toggle:', { filterId, isSizeFilter: ['newborn', '0-3-months', '3-6-months', '6-9-months', '9-12-months', '12-18-months', '18-24-months'].includes(filterId) });
    const isGroup = !!STYLE_MAPPING[filterId];
    setSelectedFilters(prev => {
      console.log('🔄 Previous filters:', prev);
      const newFilters = (() => {
        if (prev.includes(filterId)) {
          // Deselecting
          if (isGroup) {
            // If deselecting a group, also deselect all its variants
            const groupVariants = STYLE_MAPPING[filterId].variants.map(v => v.id);
            return prev.filter(id => id !== filterId && !groupVariants.includes(id));
          }
          // If deselecting a variant, check if any variants of its parent are still selected
          const parentGroup = getParentGroup(filterId);
          if (parentGroup) {
            const parentGroupId = normalizeValue(parentGroup).replace(/\s+/g, '-');
            const parentVariants = STYLE_MAPPING[parentGroupId]?.variants.map(v => v.id) || [];
            const hasOtherVariants = prev.some(id => id !== filterId && parentVariants.includes(id));
            if (!hasOtherVariants) {
              // Also deselect the parent group if no variants remain
              return prev.filter(id => id !== filterId && id !== parentGroupId);
            }
          }
          return prev.filter(id => id !== filterId);
        } else {
          // Selecting
          if (isGroup) {
            // If selecting a group, deselect all other groups and their variants
            const allGroupIds = Object.keys(STYLE_MAPPING);
            const allVariantIds = Object.values(STYLE_MAPPING).flatMap(g => g.variants.map(v => v.id));
            return [...prev.filter(id => !allGroupIds.includes(id) && !allVariantIds.includes(id)), filterId];
          } else {
            // If selecting a variant, deselect all other variants and ensure its parent group is selected
            const parentGroup = getParentGroup(filterId);
            if (parentGroup) {
              const parentGroupId = normalizeValue(parentGroup).replace(/\s+/g, '-');
              // Remove all other variant IDs, keep only non-variant filters and the new variant
              const allVariantIds = Object.values(STYLE_MAPPING).flatMap(g => g.variants.map(v => v.id));
              const nonVariantFilters = prev.filter(id => !allVariantIds.includes(id));
              
              if (!nonVariantFilters.includes(parentGroupId)) {
                return [...nonVariantFilters, parentGroupId, filterId];
              }
              return [...nonVariantFilters, filterId];
            }
            return [...prev, filterId];
          }
        }
      })();
      console.log('🔄 New filters:', newFilters);
      return newFilters;
    });
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
        // 1. Section-based filtering (Hospital Bags, Blockbuster, Gifting)
        .filter(product => {
          if (customMode) return true;
          const category = normalizeValue(product.category);
          const subcategory = normalizeValue(product.subcategory);
          if (isBlockbusterSection) {
            return category === "home" && subcategory.includes('blockbuster combo');
          }
          if (isHospitalBagsSection) {
            const productType = normalizeValue(product.productType || '');
            const matchesSubcategory = subcategory === "hospital bags" ||
              subcategory === "hospital bag" ||
              subcategory.includes("hospital bag");
            const matchesCategory = category === 'home';
            const matchesProductType = productType === 'combo product';
            
            console.log('🏥 Hospital Bags Filter Check:', {
              productName: product.name,
              category: product.category,
              normalizedCategory: category,
              subcategory: product.subcategory,
              normalizedSubcategory: subcategory,
              productType: product.productType,
              normalizedProductType: productType,
              matchesSubcategory,
              matchesCategory,
              matchesProductType,
              willPass: matchesSubcategory && matchesCategory && matchesProductType
            });
            
            // Relaxed criteria: only check subcategory for now
            return matchesSubcategory;
          }
          if (isGiftingSection) {
            return subcategory === "gifting" ||
              subcategory === "gift" ||
              subcategory.includes("gift");
          }
          return true;
        })
        // 2. Bundle Builder step filtering (Custom/Gift mode)
        .filter(product => {
          if (!customMode && !giftMode) return true;
          if (giftMode) {
            if (!currentGiftStep) return true;
            return isGiftProductInStep(product, currentGiftStep);
          }
          if (!currentStep) return true;
          return isProductInStep(product, currentStep);
        })
        // 3. Shop by Style filtering
        .filter(product => {
          const styleFilters = selectedFilters.filter(id => 
            !['newborn', '0-3-months', '3-6-months', '6-9-months', '9-12-months', '12-18-months', '18-24-months'].includes(id)
          );
          const result = matchesShopStyleFilters(product, styleFilters);
          console.log('🎨 Style Filter Check:', {
            productName: product.name,
            selectedFilters,
            styleFilters,
            result
          });
          return result;
        })
        // 4. Search filtering
        .filter(product => matchesSearch(product, searchQuery))
        // 5. Size/Age Group filtering
        .filter(product => {
          const sizeFilterIds = selectedFilters.filter(id => 
            ['newborn', '0-3-months', '3-6-months', '6-9-months', '9-12-months', '12-18-months', '18-24-months'].includes(id)
          );
          console.log('📏 Size Filter - Before check:', {
            productName: product.name,
            sizeFilterIds,
            productAgeGroup: product.ageGroup
          });
          if (sizeFilterIds.length === 0) return true;
          const productAgeGroup = normalizeValue(product.ageGroup || '');
          const matches = sizeFilterIds.some(sizeId => {
            const sizeMap: Record<string, string> = {
              'newborn': 'newborn (0-1m)',
              '0-3-months': '0-3 months',
              '3-6-months': '3-6 months',
              '6-9-months': '6-9 months',
              '9-12-months': '9-12 months',
              '12-18-months': '12-18 months',
              '18-24-months': '18-24 months'
            };
            const expectedValue = sizeMap[sizeId];
            // Check if expected value is contained in the product's age group (handles comma-separated values)
            const match = productAgeGroup.includes(expectedValue);
            
            console.log('📏 Size Filter Check:', {
              productName: product.name,
              productAgeGroup: product.ageGroup,
              normalizedAgeGroup: productAgeGroup,
              selectedSizeId: sizeId,
              expectedValue,
              match
            });
            
            return match;
          });
          
          console.log('📏 Size Filter - Final result:', {
            productName: product.name,
            matches
          });
          
          return matches;
        })
        // 6. Price filtering
        .filter(product => Number(product.sellingPrice) <= maxPrice)
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
      <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-8 py-6">
        {/* Style Groups Row */}
        <div className="flex overflow-x-auto justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 py-4 md:flex-wrap md:justify-center scrollbar-hide">
          {Object.entries(STYLE_MAPPING)
            .map(([groupId, group]) => (
              <button
                key={groupId}
                onClick={() => handleFilterToggle(groupId)}
                className="group flex flex-col items-center flex-shrink-0"
              >
                <div className={`
                  bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20
                  w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40
                  ${groupId === 'jhablas' || groupId === 'nappies' || groupId === 'beds'
                    ? 'border-primary/20 hover:border-primary/40'
                    : 'border-secondary/20 hover:border-secondary/40'
                  }

                  ${selectedFilters.includes(groupId) ? 'ring-6 ring-red-500 ring-offset-4 ring-offset-red-100 scale-110 shadow-2xl shadow-red-500/50' : ''}
                `}>
                  <img
                    src={getStyleGroupImage(groupId)}
                    alt={group.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23A855F7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3E" + encodeURIComponent(group.name) + "%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <h3 className={`text-sm sm:text-base font-bold text-center mt-2 sm:mt-3 ${selectedFilters.includes(groupId) ? 'text-red-600' : 'text-black'}`}>{group.name}</h3>
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
              <div className="flex overflow-x-auto justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 py-4 md:flex-wrap md:justify-center scrollbar-hide">
                {activeGroup.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => handleFilterToggle(variant.id)}
                    className="group flex flex-col items-center flex-shrink-0"
                  >
                    <div className={`
                      bg-white rounded-full border-2 transition-all duration-300 hover:shadow-3xl hover:-translate-y-3 cursor-pointer overflow-hidden shadow-xl shadow-gray-300/60 hover:shadow-black/20
                      w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40
                      ${selectedFilters.includes(variant.id)
                        ? 'ring-6 ring-red-500 ring-offset-4 ring-offset-red-100 scale-110 shadow-2xl shadow-red-500/50 border-red-500'
                        : 'border-gray-200 hover:border-red-300'
                      }

                    `}>
                      <img
                        src={getStyleGroupImage(variant.id)}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='%23A855F7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16' font-family='Arial'%3E" + encodeURIComponent(variant.name) + "%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <h3 className={`text-sm sm:text-base font-bold text-center mt-2 sm:mt-3 ${selectedFilters.includes(variant.id) ? 'text-red-600' : 'text-black'}`}>{variant.name}</h3>
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
      {(homeFilter === 'hospital-bags' || customMode || giftMode) && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/shop/style?custom=true'}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-colors shadow-lg hover:shadow-xl bg-black text-white hover:bg-gray-800"
            >
              Customise Your Own Hospital Bags
            </button>
            {/* Step Filters - Only in custom mode or gift mode */}
            {(customMode || giftMode) && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleStepClick(1)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-colors shadow-lg ${
                    (customMode ? currentStep : currentGiftStep) === 1
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">Step 1:</span>
                  <span className="text-xs sm:text-sm">Baby Clothing</span>
                </button>
                <button
                  onClick={() => handleStepClick(2)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-colors shadow-lg ${
                    (customMode ? currentStep : currentGiftStep) === 2
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">Step 2:</span>
                  <span className="text-xs sm:text-sm">{giftMode ? 'Essentials' : 'Other Essentials'}</span>
                </button>
                <button
                  onClick={() => handleStepClick(3)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-colors shadow-lg ${
                    (customMode ? currentStep : currentGiftStep) === 3
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">Step 3:</span>
                  <span className="text-xs sm:text-sm">{giftMode ? 'Bedding & Comfort' : 'Nursing and Bedding'}</span>
                </button>
              </div>
            )}
            {/* Next Step Buttons - Only in custom mode or gift mode */}
            {(customMode || giftMode) && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {(customMode ? currentStep : currentGiftStep) === 1 && (
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
                {(customMode ? currentStep : currentGiftStep) === 2 && (
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
                {(customMode ? currentStep : currentGiftStep) === 3 && (
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
          className="flex items-center gap-2 bg-[#b4c49a] px-4 py-2 rounded-lg hover:bg-[#a3b385] transition-colors"
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
            <div className="bg-white lg:rounded-xl lg:border-2 lg:border-white lg:shadow-2xl h-full lg:h-auto lg:sticky lg:top-4 flex flex-col ring-1 ring-gray-200/80 [box-shadow:0_-8px_20px_-8px_rgba(0,0,0,0.18),0_25px_50px_-12px_rgba(0,0,0,0.25)]">
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
                          ? 'bg-gradient-to-l from-[#e6ecdb] via-[#d6e0c2] to-[#c5d2a8] hover:from-[#dde3d0] hover:via-[#cdd9b6] hover:to-[#bccb9b] border-l-4 border-white'
                          : 'bg-gradient-to-l from-[#e6ecdb] via-[#d6e0c2] to-[#c5d2a8] hover:from-[#dde3d0] hover:via-[#cdd9b6] hover:to-[#bccb9b] border-l-4 border-white'
                        }

                      `}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-black/10 shadow-sm flex-shrink-0">
                        <section.icon className={`
                          w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors
                          ${index % 2 === 0 ? 'text-black' : 'text-black'}
                        `} />
                        </span>
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
                        ${index % 2 === 0 ? 'bg-white' : 'bg-white'}
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
                                    ? 'bg-[#b4c49a] border-[#b4c49a] shadow-sm'
                                    : 'bg-[#b4c49a] border-[#b4c49a] shadow-sm'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
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
                                        ? 'bg-[#b4c49a] border-[#b4c49a] shadow-md'
                                        : 'bg-[#b4c49a] border-[#b4c49a] shadow-md'
                                      : 'border-gray-400 hover:border-gray-500 bg-white'
                                    }

                                  `}>
                                    {selectedFilters.includes(item.id) && (
                                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                                  ? 'bg-[#b4c49a] text-white border-[#b4c49a]'
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
                      <BabyCareCard key={product.id || `style-${index}`} product={product} index={index} customMode={customMode} giftMode={giftMode} />
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
          {console.log('CustomBagBundleSummary render check:', { customMode, bundleItemsLength: bundleItems.length })}
          <CustomBagBundleSummary
            bundleItems={bundleItems}
            bundleTotal={bundleTotal}
            totalItems={totalItems}
            onRemoveItem={removeFromBundle}
            onUpdateQuantity={updateQuantity}
            reviewPageUrl="/bundle-review"
          />
        </>
      )}
      {/* Gift Bundle Summary - Show when in gift mode and has items */}
      {giftMode && (
        <>
          {console.log('GiftBundleSummary render check:', { giftMode, giftBundleItemsLength: giftBundleItems.length })}
          <CustomBagBundleSummary
            bundleItems={giftBundleItems}
            bundleTotal={giftBundleTotal}
            totalItems={giftTotalItems}
            onRemoveItem={removeFromGiftBundle}
            onUpdateQuantity={updateGiftQuantity}
            reviewPageUrl="/gift-bundle-review"
          />
        </>
      )}
    </div>
  );
}

