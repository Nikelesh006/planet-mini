import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import {
  ArrowLeft,
  BadgeIndianRupee,
  Check,
  ChevronDown,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  Save,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCloudinary } from "@/hooks/useCloudinary";
import { useProduct, useProductById, useProducts } from "@/hooks/useProducts";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  id?: string;
  sku?: string;
  name: string;
  slug: string;
  productType: "single" | "combo";
  productClassification: string;
  collectionName: string;
  styleGroup: string;
  description: string;
  sellingPrice: string;
  mrp: string;
  category: "" | "style" | "home";
  subcategory: string;
  subcategoryItem: string;
  styleVariant: string;
  hospitalBagsPackSize: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew: boolean;
  status: string;
  showOnWebsite: boolean;
  visibleInNewArrivals: boolean;
  visibleInTrendingProducts: boolean;
  visibleInShopByStyle: boolean;
  featuredProduct: boolean;
  bestSeller: boolean;
  recommendedProduct: boolean;
}

interface ComboItem {
  id: string;
  product: string;
  variant: string;
  quantity: number;
  selected: boolean;
}

interface ProductDetailFields {
  ageGroup: string;
  gender: string;
  occasion: string;
  fabric: string;
  colorTheme: string;
  careInstructions: string;
}

interface InventoryFields {
  stockQuantity: string;
  lowStockAlert: string;
}

const emptyForm: ProductFormData = {
  sku: "",
  name: "",
  slug: "",
  productType: "single",
  productClassification: "",
  collectionName: "",
  styleGroup: "",
  description: "",
  sellingPrice: "",
  mrp: "",
  category: "",
  subcategory: "",
  subcategoryItem: "",
  styleVariant: "",
  hospitalBagsPackSize: "",
  images: [],
  rating: 4.5,
  reviews: 0,
  inStock: true,
  isNew: false,
  status: "Active",
  showOnWebsite: true,
  visibleInNewArrivals: false,
  visibleInTrendingProducts: false,
  visibleInShopByStyle: false,
  featuredProduct: false,
  bestSeller: false,
  recommendedProduct: false,
};

const subcategoryOptions: Record<string, string[]> = {
  style: [],
  home: ["New Arrivals", "Trending Products"],
};

const comboSubcategoryOptions = ["Gifting", "Hospital Bags", "Blockbuster Combos"];

const DRAFT_STATUS = "Draft";
const ACTIVE_STATUS = "Active";

const homeSubcategoryItemOptions = [
  "Jhablas",
  "Towels & blankets",
  "Nappies",
  "Wipes",
  "Beds",
  "New born accessories",
];

const shopByStyleClassificationOptions = [
  "Jhablas",
  "Towels & blankets",
  "Nappies",
  "Wipes",
  "Beds",
  "New born accessories",
];

const productClassificationOptionsBySubcategoryItem: Record<string, string[]> = {
  Jhablas: ["Knot Jhablas", "Button Jhablas"],
  Nappies: ["Nappies"],
  "Towels & blankets": ["Hooded towels", "Swaddle"],
  Beds: ["Baby nest", "Baby net bed"],
  "New born accessories": ["Hats", "Mittens", "Booties"],
  "Blockbuster Combos": [
    "Below ₹499",
    "Below ₹999",
    "Below ₹1499",
    "Below ₹1999",
    "Below ₹2499",
    "Below ₹2999",
  ],
};

const shopByStyleVariantOptionsByGroup: Record<string, string[]> = {
  Jhablas: ["Knot Jhablas", "Button Jhablas"],
  "Towels & blankets": ["Hooded towels", "Swaddle"],
  Beds: ["Baby nest", "Baby net bed"],
  "New born accessories": ["Hats", "Mittens", "Booties"],
  Nappies: ["Nappies"],
  Wipes: ["Wipes"],
};

const hospitalBagPackOptions = Array.from({ length: 100 }, (_, index) => String(index + 1));
const blockbusterComboPriceBands = [
  "Below ₹499",
  "Below ₹999",
  "Below ₹1499",
  "Below ₹1999",
  "Below ₹2499",
  "Below ₹2999",
];

const ageGroupOptions = [
  "Newborn (0-1M)",
  "0-3 Months",
  "3-6 Months",
  "6-9 Months",
  "9-12 Months",
  "12-18 Months",
  "18-24 Months",
];

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#B4C49A] focus:ring-2 focus:ring-[#B4C49A]/25";
const errorFieldClass = "border-red-400 focus:border-red-400 focus:ring-red-100";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const generateUniqueSlug = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const shuffled = chars.split('').sort(() => Math.random() - 0.5).join('');
  return shuffled.substring(0, 12);
};

const toNonNegativeInteger = (value: string, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const splitHomeSubcategory = (subcategory?: string | null) => {
  const [parent = "", child = ""] = (subcategory || "").split(" / ");
  return { parent, child };
};

const Section = ({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-w-0 w-full ${className}`}
  >
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5EB] text-[#5F6F46]">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const Label = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export default function AddProduct() {
  const { uploadImages, isUploading, uploadProgress } = useCloudinary();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const isEdit = !!editId;
  const productId = editId || viewId;
  const { toast } = useToast();

  const { data: productDataBySlug, isLoading: isLoadingBySlug } = useProduct(productId || "");
  const { data: productDataById, isLoading: isLoadingById } = useProductById(editId || "");
  const { data: products = [] } = useProducts();
  const productData = editId ? productDataById : productDataBySlug;
  const isLoadingProduct = editId ? isLoadingById : isLoadingBySlug;

  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAgeGroupOpen, setIsAgeGroupOpen] = useState(false);
  const [comboItems, setComboItems] = useState<ComboItem[]>([
    { id: "knot-jabla", product: "Belle Scribbles Knot Jabla", variant: "Newborn (0-1M)", quantity: 2, selected: true },
    { id: "muslin-cap", product: "Muslin Cap - White", variant: "Newborn", quantity: 1, selected: true },
    { id: "muslin-mittens", product: "Muslin Mittens - White", variant: "Newborn", quantity: 1, selected: true },
    { id: "muslin-booties", product: "Muslin Booties - White", variant: "Newborn", quantity: 1, selected: true },
  ]);
  const [productDetails, setProductDetails] = useState<ProductDetailFields>({
    ageGroup: "Newborn (0-1M)",
    gender: "Unisex",
    occasion: "Daily Use",
    fabric: "100% Muslin Cotton",
    colorTheme: "Multi Print",
    careInstructions: "Machine Wash",
  });
  const [inventory, setInventory] = useState<InventoryFields>({
    stockQuantity: "50",
    lowStockAlert: "5",
  });

  useEffect(() => {
    if (productData && (isEdit || viewId)) {
      // Parse images from JSON string if needed
      let parsedImages: string[] = [];
      const rawImages = (productData as any).images;
      if (rawImages) {
        if (typeof rawImages === 'string') {
          try {
            parsedImages = JSON.parse(rawImages);
          } catch {
            parsedImages = [rawImages];
          }
        } else if (Array.isArray(rawImages)) {
          parsedImages = rawImages;
        }
      } else if (productData.image) {
        parsedImages = [productData.image];
      }

      const parsedSubcategory = splitHomeSubcategory(productData.subcategory);

      setFormData({
        id: productData.id?.toString() || "",
        sku: productData.sku || "",
        name: productData.name || "",
        slug: productData.slug || "",
        productType: (productData as any).productType || "single",
        productClassification: (productData as any).productClassification || "",
        collectionName: (productData as any).collectionName || (productData as any).collectionPrintName || (productData as any).printName || productData.name || "",
        description: productData.description || "",
        sellingPrice: productData.sellingPrice != null ? String(productData.sellingPrice) : "",
        mrp: productData.mrp?.toString() || "",
        category: (productData.category as ProductFormData["category"]) || "",
        subcategory: parsedSubcategory.parent,
        subcategoryItem: parsedSubcategory.child,
        styleVariant: (productData as any).styleVariant || "",
        styleGroup: (productData as any).styleGroup || parsedSubcategory.parent || parsedSubcategory.child || "",
        hospitalBagsPackSize: (productData as any).hospitalBagsPackSize || "",
        images: parsedImages,
        rating: productData.rating || 4.5,
        reviews: productData.reviews || 0,
        inStock: productData.inStock ?? true,
        isNew: productData.isNew || false,
        status: (productData as any).status || "Active",
        showOnWebsite: (productData as any).showOnWebsite ?? true,
        visibleInNewArrivals: (productData as any).visibleInNewArrivals ?? false,
        visibleInTrendingProducts: (productData as any).visibleInTrendingProducts ?? false,
        visibleInShopByStyle: (productData as any).visibleInShopByStyle ?? false,
        featuredProduct: (productData as any).featuredProduct || false,
        bestSeller: (productData as any).bestSeller || false,
        recommendedProduct: (productData as any).recommendedProduct || false,
      });
      setProductDetails((prev) => ({
        ...prev,
        ageGroup: productData.ageGroup || prev.ageGroup,
        gender: (productData as any).gender || prev.gender,
        occasion: (productData as any).occasion || prev.occasion,
        fabric: (productData as any).fabric || prev.fabric,
        colorTheme: (productData as any).colorTheme || prev.colorTheme,
      }));
      setInventory({
        stockQuantity: productData.stockQuantity != null ? String(productData.stockQuantity) : "0",
        lowStockAlert: productData.lowStockAlert != null ? String(productData.lowStockAlert) : "0",
      });
    }
  }, [productData, isEdit, viewId]);

  const discount = useMemo(() => {
    const original = Number(formData.mrp);
    const current = Number(formData.sellingPrice);
    if (!original || !current || original <= current) return null;
    return {
      amount: original - current,
      percent: Math.round(((original - current) / original) * 100),
    };
  }, [formData.mrp, formData.sellingPrice]);

  const previewCategory = formData.category === "home" ? "Home" : formData.category === "style" ? "Shop by Style" : "Category";
  const normalizedCategory = formData.category.toLowerCase();
  const savedSubcategory = formData.category === "style" && formData.styleVariant
    ? `${formData.subcategory} / ${formData.styleVariant}`
    : formData.subcategoryItem
      ? `${formData.subcategory} / ${formData.subcategoryItem}`
      : formData.subcategory;
  const previewSubcategory = savedSubcategory || "No subcategory";
  const usesClassificationFlow = formData.category === "home" || formData.category === "style";
  const productClassificationOptions = useMemo(
    () =>
      formData.category === "style"
        ? shopByStyleClassificationOptions
        : formData.subcategory === "Blockbuster Combos"
          ? blockbusterComboPriceBands
          : productClassificationOptionsBySubcategoryItem[formData.subcategoryItem] || [],
    [formData.category, formData.subcategory, formData.subcategoryItem],
  );
  const nextSku = useMemo(() => `PM-${String(products.length + 1).padStart(4, "0")}`, [products.length]);
  const previewSku = isEdit ? formData.sku || nextSku : nextSku;
  const nextSlug = useMemo(() => generateUniqueSlug(), []);
  const previewSlug = isEdit ? formData.slug : nextSlug;
  const selectedAgeGroups = useMemo(
    () =>
      productDetails.ageGroup
        .split(",")
        .map((ageGroup) => ageGroup.trim())
        .filter(Boolean),
    [productDetails.ageGroup],
  );
  const selectedComboItems = comboItems.filter((item) => item.selected);
  const comboTotalQuantity = selectedComboItems.reduce((total, item) => total + Number(item.quantity || 0), 0);

  useEffect(() => {
    if (productClassificationOptions.length === 0 && formData.productClassification) {
      setFormData((prev) => ({
        ...prev,
        productClassification: "",
      }));
      return;
    }

    if (
      productClassificationOptions.length > 0 &&
      !productClassificationOptions.includes(formData.productClassification)
    ) {
      setFormData((prev) => {
        const nextClassification = productClassificationOptions[0];
        let autoPrice = prev.sellingPrice;
        if (prev.subcategory === "Blockbuster Combos") {
          autoPrice = nextClassification.replace("Below ₹", "").replace(/,/g, "");
        }
        return {
          ...prev,
          productClassification: nextClassification,
          sellingPrice: autoPrice,
        };
      });
    }
  }, [formData.productClassification, productClassificationOptions]);

  useEffect(() => {
    if (formData.productType !== "combo") return;

    setFormData((prev) => {
      const nextSubcategory = comboSubcategoryOptions.includes(prev.subcategory)
        ? prev.subcategory
        : comboSubcategoryOptions[0];

      return {
        ...prev,
        category: "home",
        subcategory: nextSubcategory,
        subcategoryItem: "",
      };
    });
  }, [formData.productType]);

  useEffect(() => {
    if (!usesClassificationFlow) {
      if (formData.subcategoryItem || formData.productClassification || formData.styleVariant || formData.hospitalBagsPackSize) {
        setFormData((prev) => ({
          ...prev,
          subcategoryItem: "",
          productClassification: "",
          styleVariant: "",
          hospitalBagsPackSize: "",
        }));
      }
      return;
    }

    if (formData.category === "home" && !formData.subcategoryItem) {
      setFormData((prev) => ({
        ...prev,
        subcategoryItem: homeSubcategoryItemOptions[0],
      }));
    }

    if (formData.category === "style" && formData.subcategory && formData.productClassification) {
      const validOptions = shopByStyleVariantOptionsByGroup[formData.subcategory] || [];
      if (!validOptions.includes(formData.styleVariant)) {
        setFormData((prev) => ({
          ...prev,
          styleVariant: "",
        }));
      }
    }
  }, [formData.category, formData.subcategory, formData.subcategoryItem, formData.productClassification, formData.styleVariant, usesClassificationFlow]);

  const resetForm = () => {
    setFormData(emptyForm);
    setProductDetails({
      ageGroup: "",
      gender: "Unisex",
      occasion: "Daily Wear",
      fabric: "Cotton",
      colorTheme: "Multi Print",
      careInstructions: "Machine Wash",
    });
    setInventory({
      stockQuantity: "50",
      lowStockAlert: "5",
    });
    setComboItems([]);
    setErrors({});
    setShowSuccess(false);
    // Navigate back to add product mode by clearing URL params
    setLocation("/admin/add-product");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        ...(name === "productType" && value === "single"
          ? {
              category: "",
              subcategory: "",
              subcategoryItem: "",
              productClassification: "",
              styleVariant: "",
              styleGroup: "",
              hospitalBagsPackSize: "",
              visibleInNewArrivals: false,
              visibleInTrendingProducts: false,
              visibleInShopByStyle: false,
            }
          : {}),
        ...(name === "category"
          ? {
              subcategory: "",
              subcategoryItem: "",
              productClassification: "",
              styleVariant: "",
              styleGroup: "",
              hospitalBagsPackSize: "",
              visibleInNewArrivals: false,
              visibleInTrendingProducts: false,
              visibleInShopByStyle: false,
            }
          : {}),
        ...(name === "subcategory"
          ? {
              subcategoryItem: "",
              productClassification: "",
              styleVariant: "",
              styleGroup: value,
              hospitalBagsPackSize: "",
            }
          : {}),
        // Auto-fill price for blockbuster combos
        ...(name === "productClassification" && formData.subcategory === "Blockbuster Combos"
          ? {
              sellingPrice: value.replace("Below ₹", "").replace(/,/g, ""),
            }
          : {}),
      }));

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset combo items when switching to single product
    if (name === "productType" && value === "single") {
      setComboItems([]);
      setProductDetails({
        ageGroup: "Newborn (0-1M)",
        gender: "Unisex",
        occasion: "Daily Use",
        fabric: "100% Muslin Cotton",
        colorTheme: "Multi Print",
        careInstructions: "Machine Wash",
      });
      setInventory({
        stockQuantity: "50",
        lowStockAlert: "5",
      });
      // Reset Store Preview by clearing images
      setFormData((prev) => ({
        ...prev,
        images: [],
      }));
      // Clear all validation errors
      setErrors({});
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const imageUrls = await uploadImages(Array.from(files));
      if (imageUrls && imageUrls.length > 0) {
        const newImageUrls = imageUrls.map((img: any) => (typeof img === "string" ? img : img.url));
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls].slice(0, 5),
        }));
        toast({
          title: "Image Uploaded!",
          description: `${newImageUrls.length} image(s) added successfully.`,
          variant: "success",
        });
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleComboQuantityChange = (id: string, quantity: string) => {
    setComboItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, Number(quantity) || 0) } : item,
      ),
    );
  };

  const toggleComboItem = (id: string) => {
    setComboItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const removeComboItem = (id: string) => {
    setComboItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProductDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgeGroupToggle = (ageGroup: string) => {
    setProductDetails((prev) => {
      const currentAgeGroups = prev.ageGroup
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const nextAgeGroups = currentAgeGroups.includes(ageGroup)
        ? currentAgeGroups.filter((value) => value !== ageGroup)
        : [...currentAgeGroups, ageGroup];

      return {
        ...prev,
        ageGroup: nextAgeGroups.join(", "),
      };
    });
  };

  const handleInventoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInventory((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) newErrors.sellingPrice = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.images || formData.images.length === 0) newErrors.images = "At least one product image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, overrideStatus?: string) => {
    e.preventDefault();

    const nextStatus = overrideStatus || formData.status || ACTIVE_STATUS;
    const isDraft = nextStatus === DRAFT_STATUS;

    if (!isDraft && !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

  const productPayload = {
    slug: previewSlug,
    sku: previewSku,
    name: formData.name,
    description: formData.description,
    sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
    mrp: formData.mrp ? parseFloat(formData.mrp) : null,
    category: formData.category,
    ageGroup: selectedAgeGroups.length > 0 ? selectedAgeGroups.join(", ") : null,
    subcategory: savedSubcategory,
    image: formData.images[0] || "",
    images: JSON.stringify(formData.images),
    rating: isDraft ? null : parseFloat(formData.rating.toString()),
    reviews: isDraft ? null : parseInt(formData.reviews.toString(), 10),
    inStock: isDraft ? false : true,
    isNew: formData.isNew,
    status: nextStatus,
    stockQuantity: toNonNegativeInteger(inventory.stockQuantity),
    lowStockAlert: toNonNegativeInteger(inventory.lowStockAlert),
    gender: productDetails.gender,
    occasion: productDetails.occasion,
    fabric: productDetails.fabric,
    colorTheme: productDetails.colorTheme,
    careInstructions: productDetails.careInstructions,
    productType: formData.productType,
    productClassification: formData.productClassification,
    styleGroup: formData.styleGroup || (formData.category === "style" ? formData.subcategory : formData.subcategoryItem),
    styleVariant: formData.styleVariant,
    hospitalBagsPackSize: formData.hospitalBagsPackSize,
    collectionName: formData.collectionName,
    collectionPrintName: formData.collectionName,
    printName: formData.collectionName,
    showOnWebsite: formData.showOnWebsite,
    visibleInNewArrivals: formData.visibleInNewArrivals,
    visibleInTrendingProducts: formData.visibleInTrendingProducts,
    visibleInShopByStyle: formData.visibleInShopByStyle,
    featuredProduct: formData.featuredProduct,
    bestSeller: formData.bestSeller,
    recommendedProduct: formData.recommendedProduct,
  };

  try {
    const url = isEdit ? `/api/products/${editId}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productPayload),
      });

    if (!response.ok) {
      let errorMessage = isEdit ? "Failed to update product" : "Failed to create product";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorMessage;
      } catch {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

      setShowSuccess(true);
      toast({
        title: nextStatus === DRAFT_STATUS ? "Draft product saved successfully" : "Product saved successfully",
        description: nextStatus === DRAFT_STATUS
          ? "Your draft has been saved and can be completed later."
          : isEdit
            ? "Your product has been updated and is now live on the store."
            : "Your new product has been added and is now live on the store.",
        variant: "success",
      });

      if (isEdit) {
        setLocation("/admin/product-list");
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct && (isEdit || viewId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-600">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-lg font-semibold text-slate-950">{isEdit ? "Edit Product" : "Add Product"}</h1>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <Eye className="h-4 w-4" />
            Store-ready product setup
          </div>
        </div>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <Check className="h-4 w-4" />
          {isEdit ? "Product updated successfully!" : "Product created successfully!"}
        </motion.div>
      )}

      <form onSubmit={(e) => handleSubmit(e, formData.status)} className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        <Section title="Basic Information" icon={Package} className="lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label required>Product Type</Label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className={fieldClass}
              >
                <option value="single">Single Product</option>
                <option value="combo">Combo Product</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Choose whether this is a single item or a bundle/combo.</p>
            </div>
            <div>
              <Label required>Category</Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={formData.productType === "combo"}
                className={`${fieldClass} ${errors.category ? errorFieldClass : ""}`}
              >
                <option value="">Select category</option>
                <option value="style">Shop by Style</option>
                <option value="home">Home</option>
              </select>
              {formData.productType === "combo" && (
                <p className="mt-1 text-xs text-slate-500">Combo products are fixed to the Home category.</p>
              )}
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            <div>
              <Label>Sub Category</Label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                disabled={!formData.category || formData.category === "style"}
                className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-400`}
              >
                {formData.productType === "combo" ? (
                  <>
                    <option value="">Select subcategory</option>
                    {comboSubcategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">Select subcategory</option>
                    {subcategoryOptions[formData.category || "none"]?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {formData.productType === "combo" && (
                <p className="mt-1 text-xs text-slate-500">
                  Combo products can only use Gifting.
                </p>
              )}
              {formData.category === "style" && (
                <p className="mt-1 text-xs text-slate-500">
                  Shop by Style uses the Product Classification field for the style group.
                </p>
              )}
            </div>

            {formData.category === "home" && (
              <div>
                <Label>Style Group</Label>
                <select
                  name="subcategoryItem"
                  value={formData.subcategoryItem}
                  onChange={handleInputChange}
                  disabled={formData.productType === "combo"}
                  className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">Select item</option>
                  {homeSubcategoryItemOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formData.productType === "combo" && (
                  <p className="mt-1 text-xs text-slate-500">Style Group is not applicable for combo products.</p>
                )}
              </div>
            )}

            {formData.productType === "combo" && formData.subcategory === "Hospital Bags" && (
              <div>
                <Label required>Hospital Bags Pack Size</Label>
                <select
                  name="hospitalBagsPackSize"
                  value={formData.hospitalBagsPackSize}
                  onChange={handleInputChange}
                  className={fieldClass}
                >
                  <option value="">Select pack size</option>
                  {hospitalBagPackOptions.map((option) => (
                    <option key={option} value={option}>
                      Pack of {option}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Choose a pack size from 1 to 100.
                </p>
              </div>
            )}

            {formData.category === "style" && (
            <div>
              <Label required>
                Style Group
              </Label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className={fieldClass}
                >
                  <option value="">Select item</option>
                  {shopByStyleClassificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Choose the style group first.</p>
              </div>
            )}

            <div>
              <Label required>
                {formData.category === "home" && formData.subcategory === "Blockbuster Combos"
                  ? "Blockbuster Combos"
                  : formData.category === "home"
                    ? "Style variants"
                    : formData.category === "style"
                      ? "Style variants"
                      : "Product Classification"}
              </Label>
              <select
                name={formData.category === "style" ? "styleVariant" : "productClassification"}
                value={formData.category === "style" ? formData.styleVariant : formData.productClassification}
                onChange={handleInputChange}
                disabled={
                  (formData.productType === "combo" && formData.subcategory !== "Blockbuster Combos") ||
                  (formData.category === "home" && !formData.subcategoryItem) ||
                  (formData.category === "style" && !formData.subcategory) ||
                  (formData.category !== "style" && productClassificationOptions.length === 0)
                }
                className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-400`}
              >
                {formData.category === "style" ? (
                  <>
                    <option value="">Select variant</option>
                    {(shopByStyleVariantOptionsByGroup[formData.subcategory] || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">Select product classification</option>
                    {productClassificationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {formData.productType === "combo" && formData.subcategory !== "Blockbuster Combos" && (
                <p className="mt-1 text-xs text-slate-500">Style Variant is not applicable for combo products.</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {formData.category === "style"
                  ? "Select a style group first, then choose the matching variant in the new input box."
                  : "Frontend-only classification for admin organization."}
              </p>
            </div>

            <div>
              <Label required>Product Name</Label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="off"
                className={`${fieldClass} ${errors.name ? errorFieldClass : ""}`}
                placeholder="Welcome to Planet Mini Set"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <Label>Collection / Print Name</Label>
              <input
                type="text"
                name="collectionName"
                value={formData.collectionName}
                onChange={handleInputChange}
                autoComplete="off"
                className={fieldClass}
                placeholder="Welcome to Planet Mini"
              />
              <p className="mt-1 text-xs text-slate-500">Saved with the product for sorting and collection pages.</p>
            </div>

            <div>
              <Label>SKU (Auto-generated)</Label>
              <div className="flex min-h-[38px] items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {previewSku}
              </div>
              <p className="mt-1 text-xs text-slate-500">Sequential product code saved with the product.</p>
            </div>

            <div>
              <Label>Slug (Auto-generated)</Label>
              <div className="flex min-h-[38px] items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {previewSlug}
              </div>
              <p className="mt-1 text-xs text-slate-500">Random alphanumeric identifier for unique product identification.</p>
            </div>
          </div>
        </Section>

        <Section title="Store Preview" icon={Eye} className="lg:col-span-4 lg:row-span-2 lg:self-start">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {formData.images[0] ? (
                <img src={formData.images[0]} alt="Product preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5F6F46]">{previewCategory} / {previewSubcategory}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-950">{formData.name || "Product name preview"}</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">
                {formData.description || "Product description preview appears here once you start typing."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{formData.inStock ? "In stock" : "Out of stock"}</span>
              {formData.isNew && <span className="rounded-full bg-[#F1F5EB] px-3 py-1 text-[#5F6F46]">New arrival</span>}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{formData.rating} rating</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-2xl font-bold text-slate-950">Rs {Number(formData.sellingPrice || 0).toLocaleString("en-IN")}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {formData.mrp && <p className="text-sm text-slate-500 line-through">Rs {Number(formData.mrp).toLocaleString("en-IN")}</p>}
                {discount && <p className="text-sm font-semibold text-emerald-700">{discount.percent}% off</p>}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pricing" icon={BadgeIndianRupee} className="lg:col-span-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div>
              <Label required>Selling Price</Label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                disabled={formData.productType === "combo" && formData.subcategory === "Blockbuster Combos"}
                className={`${fieldClass} ${errors.sellingPrice ? errorFieldClass : ""} disabled:bg-slate-100 disabled:text-slate-400`}
                placeholder="999"
              />
              {formData.productType === "combo" && formData.subcategory === "Blockbuster Combos" && (
                <p className="mt-1 text-xs text-slate-500">Price is auto-filled based on blockbuster combo selection.</p>
              )}
              {errors.sellingPrice && <p className="mt-1 text-xs text-red-500">{errors.sellingPrice}</p>}
            </div>
            <div>
              <Label>MRP</Label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={fieldClass}
                placeholder="1249"
              />
            </div>
          </div>
          {discount && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p className="font-semibold">You save Rs {discount.amount.toLocaleString("en-IN")} ({discount.percent}% OFF)</p>
              <p className="mt-1 text-xs text-emerald-700">Discount is calculated automatically for the admin preview.</p>
            </div>
          )}
        </Section>

        <Section title="Product Images" icon={ImageIcon} className="lg:col-span-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="relative">
                {formData.images[index] ? (
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img src={formData.images[index]} alt="Product upload" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : isUploading && index === formData.images.length ? (
                  <div className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-[#B4C49A] bg-[#F1F5EB] text-[#5F6F46]">
                    <span className="text-sm font-semibold">{uploadProgress}%</span>
                    <span className="mt-1 text-xs">Uploading</span>
                  </div>
                ) : (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-[#B4C49A] hover:bg-[#F1F5EB] hover:text-[#5F6F46]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e);
                          e.target.value = "";
                        }
                      }}
                      disabled={isUploading || formData.images.length >= 5}
                      className="hidden"
                    />
                    <Upload className="mb-2 h-5 w-5" />
                    <span className="text-xs font-medium">Upload</span>
                  </label>
                )}
              </div>
            ))}
          </div>
          {errors.images && <p className="mt-2 text-xs text-red-500">{errors.images}</p>}
          <p className="mt-3 text-xs text-slate-500">{formData.images.length}/5 images uploaded. The first image is used as the main product image.</p>
        </Section>


        <Section title="Inventory" icon={Package} className="lg:col-span-5">
          <div className="space-y-4">
            <div>
              <Label required>Stock Quantity</Label>
              <input
                type="number"
                min="0"
                name="stockQuantity"
                value={inventory.stockQuantity}
                onChange={handleInventoryChange}
                className={fieldClass}
                placeholder="50"
              />
            </div>
            <div>
              <Label required>Low Stock Alert</Label>
              <input
                type="number"
                min="0"
                name="lowStockAlert"
                value={inventory.lowStockAlert}
                onChange={handleInventoryChange}
                className={fieldClass}
                placeholder="5"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                You will be notified when stock is less than or equal to this number.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Product Details" icon={Tag} className="lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Age Group</Label>
              <div
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsAgeGroupOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAgeGroupOpen((open) => !open)}
                  className={`${fieldClass} flex min-h-[38px] items-center justify-between gap-2 text-left`}
                  aria-expanded={isAgeGroupOpen}
                >
                  <span className={selectedAgeGroups.length ? "text-slate-900" : "text-slate-400"}>
                    {selectedAgeGroups.length ? selectedAgeGroups.join(", ") : "Select age group"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isAgeGroupOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isAgeGroupOpen && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="max-h-64 overflow-y-auto p-2">
                      {ageGroupOptions.map((ageGroup) => {
                        const isSelected = selectedAgeGroups.includes(ageGroup);

                        return (
                          <label
                            key={ageGroup}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-[#F1F5EB]"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleAgeGroupToggle(ageGroup)}
                              className="h-4 w-4 rounded border-slate-300 text-[#5F6F46] focus:ring-[#B4C49A]"
                            />
                            <span className="flex-1">{ageGroup}</span>
                            {isSelected && <Check className="h-4 w-4 text-[#5F6F46]" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Gender</Label>
              <select name="gender" value={productDetails.gender} onChange={handleProductDetailChange} className={fieldClass}>
                <option value="Unisex">Unisex</option>
                <option value="Baby Girl">Baby Girl</option>
                <option value="Baby Boy">Baby Boy</option>
              </select>
            </div>
            <div>
              <Label>Occasion</Label>
              <select name="occasion" value={productDetails.occasion} onChange={handleProductDetailChange} className={fieldClass}>
                <option value="Daily Use">Daily Use</option>
                <option value="Hospital Bag">Hospital Bag</option>
                <option value="Gifting">Gifting</option>
                <option value="Travel">Travel</option>
              </select>
            </div>
            <div>
              <Label>Fabric</Label>
              <select name="fabric" value={productDetails.fabric} onChange={handleProductDetailChange} className={fieldClass}>
                <option value="100% Muslin Cotton">100% Muslin Cotton</option>
                <option value="Organic Cotton">Organic Cotton</option>
                <option value="Cotton Blend">Cotton Blend</option>
              </select>
            </div>
            <div>
              <Label>Colour / Theme</Label>
              <select name="colorTheme" value={productDetails.colorTheme} onChange={handleProductDetailChange} className={fieldClass}>
                <option value="Multi Print">Multi Print</option>
                <option value="Pastel Print">Pastel Print</option>
                <option value="White">White</option>
                <option value="Soft Neutrals">Soft Neutrals</option>
              </select>
            </div>
            <div>
              <Label>Care Instructions</Label>
              <select name="careInstructions" value={productDetails.careInstructions} onChange={handleProductDetailChange} className={fieldClass}>
                <option value="Machine Wash">Machine Wash</option>
                <option value="Hand Wash">Hand Wash</option>
                <option value="Gentle Cycle">Gentle Cycle</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Description" icon={Tag} className="lg:col-span-6 flex flex-col">
          <Label required>Description</Label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={14}
            className={`${fieldClass} min-h-[320px] h-full resize-y ${errors.description ? errorFieldClass : ""}`}
            placeholder="Describe the product for the store page..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </Section>
        <Section title="Status" icon={Star} className="lg:col-span-6">
          <div className="space-y-6">
            <div>
              <Label required>Product Status</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={fieldClass}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Product will be visible on website
              </p>
            </div>

            <div>
              <Label>Visibility</Label>
              <p className="mt-1 text-xs text-slate-500">
                Select one or more sections where this product should appear.
              </p>
              <div className="mt-3 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="showOnWebsite"
                    checked={formData.showOnWebsite}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white"
                  />
                  <span className="text-sm font-semibold text-slate-800">Show on Website</span>
                </label>

                <div className="rounded-lg border border-white bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Available sections
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">Visibility</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose which sections should display this product.
                      </p>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="visibleInNewArrivals"
                            checked={formData.visibleInNewArrivals}
                            onChange={handleInputChange}
                            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white"
                          />
                          <span className="text-sm font-semibold text-slate-800">New Arrivals</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="visibleInTrendingProducts"
                            checked={formData.visibleInTrendingProducts}
                            onChange={handleInputChange}
                            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white"
                          />
                          <span className="text-sm font-semibold text-slate-800">Trending Products</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="visibleInShopByStyle"
                            checked={formData.visibleInShopByStyle}
                            onChange={handleInputChange}
                            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white"
                          />
                          <span className="text-sm font-semibold text-slate-800">Shop by Style</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other existing fields like Rating, Reviews, In Stock that we still might want to keep, 
                but they were inside the old Visibility section. The image only shows the checkboxes.
                We can put them here or below. */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 mb-4">
                <span>
                  <span className="block text-sm font-semibold text-slate-900">In Stock</span>
                  <span className="text-xs text-slate-500">Product can be purchased</span>
                </span>
                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-[#B4C49A] focus:ring-[#B4C49A]" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Rating</Label>
                  <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} min="1" max="5" step="0.1" className={fieldClass} />
                </div>
                <div>
                  <Label>Reviews Count</Label>
                  <input type="number" name="reviews" value={formData.reviews} onChange={handleInputChange} min="0" className={fieldClass} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:col-span-12 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setLocation("/admin");
              }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => {
                void handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, DRAFT_STATUS);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#B4C49A] bg-white px-5 py-2.5 text-sm font-semibold text-[#5F6F46] transition hover:bg-[#F1F5EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B4C49A]/30 border-b-[#5F6F46]" />
                  Saving Draft...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save as Draft
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => void handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, ACTIVE_STATUS)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B4C49A] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#A4B68A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-b-white" />
                  {isEdit ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Update Product" : "Save Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
