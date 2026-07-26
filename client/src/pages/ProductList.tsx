import { motion } from "framer-motion";



import { Link } from "wouter";



import { useState, useEffect } from "react";



import { 



  Search, 



  Filter, 



  Trash2, 



  Eye, 



  Edit,



  Plus,



  ArrowLeft,



  Package,



  Tag,



  DollarSign,



  Star,



  TrendingUp,



  Calendar,



  Check,



  Zap



} from "lucide-react";



import { useProducts, useDeleteProduct, useToggleBoostProduct, useUpdateProductBoostSections } from "@/hooks/useProducts";



import { Modal, ConfirmModal } from "@/components/ui/Modal";

import { BoostModal } from "@/components/BoostModal";



import { useToast } from "@/hooks/use-toast";



import type { ProductResponse } from "@shared/routes";







export default function ProductList() {



  const { data: products = [], isLoading, error } = useProducts({ includeDrafts: true });



  const deleteProduct = useDeleteProduct();



  const { toast } = useToast();



  const toggleBoostProduct = useToggleBoostProduct();



  const updateProductBoostSections = useUpdateProductBoostSections();



  const [searchTerm, setSearchTerm] = useState("");



  const [filterCategory, setFilterCategory] = useState("all");



  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);



  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());



  const [boostingProducts, setBoostingProducts] = useState<Set<string>>(new Set());



  const [boostModal, setBoostModal] = useState<{ isOpen: boolean; product: ProductResponse | null }>({ 

    isOpen: false, 

    product: null 

  });



  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null }>({ 



    isOpen: false, 



    productId: null 



  });



  const [bulkDeleteModal, setBulkDeleteModal] = useState<{ isOpen: boolean; count: number }>({ 



    isOpen: false, 



    count: 0 



  });







  useEffect(() => {



    if (products) {



      // Sort products by Product ID in descending order first
      let sorted = [...products].sort((a, b) => {
        const extractNumericId = (id: string | number) => {
          const idStr = String(id);
          const match = idStr.match(/PM-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };

        const aId = extractNumericId(a.id);
        const bId = extractNumericId(b.id);

        return bId - aId;
      });

      let filtered = [...sorted];







      // Filter by search term



      if (searchTerm) {



        const search = searchTerm.toLowerCase();



        filtered = filtered.filter(product =>



          product.name.toLowerCase().includes(search) ||



          product.description.toLowerCase().includes(search) ||



          product.category.toLowerCase().includes(search) ||



          product.id.toString().toLowerCase().includes(search) ||



          (product.sku || "").toLowerCase().includes(search)



        );



      }







      // Filter by category



      if (filterCategory !== "all") {



        filtered = filtered.filter(product => product.category === filterCategory);



      }







      filtered.sort((a, b) => {
        // Drafts should appear last
        const aDraft = (a.status || "").toLowerCase() === "draft";



        const bDraft = (b.status || "").toLowerCase() === "draft";







        if (aDraft !== bDraft) {



          return aDraft ? 1 : -1;



        }







        // Maintain existing order from pre-filtering sort
        return 0;



      });







      setFilteredProducts(filtered);



    }



  }, [products, searchTerm, filterCategory]);







  const categories = ["all", ...Array.from(new Set(products?.map(p => p.category) || []))];







  const handleDeleteProduct = async (productId: string) => {



    setDeleteModal({ isOpen: true, productId });



  };







  const confirmDeleteProduct = async () => {



    if (!deleteModal.productId) return;



    



    try {



      await deleteProduct(deleteModal.productId);



      setDeleteModal({ isOpen: false, productId: null });



      



      // Show success toast



      toast({



        title: "Product Deleted Successfully!",



        description: "The product has been removed from your store.",



        variant: "success"



      });



      



    } catch (error) {



      console.error('Error deleting product:', error);



      setDeleteModal({ isOpen: false, productId: null });



      



      // Show error toast



      toast({



        title: "Error",



        description: "Failed to delete product. Please try again.",



        variant: "destructive"



      });



    }



  };







  const handleAddProduct = () => {



  // Clear any existing edit data from localStorage



  localStorage.removeItem('editProduct');



  



  // Navigate to add product page



  window.location.href = '/admin/add-product';



};







const handleProductSelect = (productId: string) => {



  setSelectedProducts(prev => {



    const newSet = new Set(prev);



    if (newSet.has(productId)) {



      newSet.delete(productId);



      console.log('Product deselected:', productId);



    } else {



      newSet.add(productId);



      console.log('Product selected:', productId);



    }



    return newSet;



  });



};







  const handleToggleBoost = async (product: ProductResponse) => {

    setBoostModal({ isOpen: true, product });

  };



  const handleSaveBoostSections = async (sections: string[]) => {

    if (!boostModal.product) return;



    const productId = String(boostModal.product.id);

    setBoostingProducts(prev => {

      const next = new Set(prev);

      next.add(productId);

      return next;

    });



    try {

      await updateProductBoostSections(productId, sections);

      

      const hasBoost = sections.length > 0;

      toast({

        title: hasBoost ? "Product boosted" : "Boost removed",

        description: hasBoost

          ? `The product will now appear at the top of ${sections.length} section(s).`

          : "The product will return to its normal position.",

        variant: "success",

      });

    } catch (error) {

      console.error("Error updating boost sections:", error);

      toast({

        title: "Error",

        description: "Failed to update boost settings. Please try again.",

        variant: "destructive",

      });

    } finally {

      setBoostingProducts(prev => {

        const next = new Set(prev);

        next.delete(productId);

        return next;

      });

    }

  };







  const handleBulkDelete = async () => {



    if (selectedProducts.size === 0) {



      setBulkDeleteModal({ isOpen: true, count: 0 });



      setTimeout(() => setBulkDeleteModal({ isOpen: false, count: 0 }), 2000);



      return;



    }







    setBulkDeleteModal({ isOpen: true, count: selectedProducts.size });



  };







  const confirmBulkDelete = async () => {



    if (selectedProducts.size === 0) return;







    try {



      // Delete each selected product



      const deletePromises = Array.from(selectedProducts).map(async (productId) => {



        await deleteProduct(productId.toString());



      });







      await Promise.all(deletePromises);



      setSelectedProducts(new Set());



      setBulkDeleteModal({ isOpen: false, count: 0 });







      // Show success toast



      toast({



        title: "Products Deleted Successfully!",



        description: `${selectedProducts.size} product(s) have been removed from your store.`,



        variant: "success"



      });



      



    } catch (error) {



      console.error('Error deleting products:', error);



      setBulkDeleteModal({ isOpen: false, count: 0 });



      



      // Show error toast



      toast({



        title: "Error",



        description: "Failed to delete some products. Please try again.",



        variant: "destructive"



      });



    }



  };







  if (isLoading) {



    return (



      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">



        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">



          <div className="flex justify-center items-center h-64">



            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4C49A]"></div>



          </div>



        </div>



      </div>



    );



  }







  if (error) {



    return (



      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">



        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">



          <div className="text-center">



            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>



            <p className="text-gray-600">Please try again later.</p>



          </div>



        </div>



      </div>



    );



  }







  return (



    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50 pt-20">



      {/* Header */}



      <div className="bg-white shadow-sm border-b">



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">



          <div className="flex items-center justify-between h-16">



            <div className="flex items-center gap-4">



              <Link href="/admin" className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#5F6F46] transition-colors">



                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />



                <span>Back to Admin</span>



              </Link>



              <div className="h-8 w-px bg-gray-300"></div>



              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Product List</h1>



            </div>



            <div className="flex items-center gap-3">



              {selectedProducts.size > 0 && (



                <button



                  onClick={handleBulkDelete}



                  className="flex items-center gap-1.5 sm:gap-2 bg-red-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors"



                >



                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                  <span>Delete Selected ({selectedProducts.size})</span>



                </button>



              )}



              <button



                onClick={handleAddProduct}



                className="flex items-center gap-1.5 sm:gap-2 bg-[#B4C49A] text-black px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-[#A4B68A] transition-colors"



              >



                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                Add New Product



              </button>



            </div>



          </div>



        </div>



      </div>







      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">



        {/* Stats Cards */}



        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">



          <motion.div



            initial={{ opacity: 0, y: 20 }}



            animate={{ opacity: 1, y: 0 }}



            className="bg-white rounded-xl shadow-sm p-3 sm:p-6"



          >



            <div className="flex items-center justify-between">



              <div>



                <p className="text-xs sm:text-sm text-gray-600">Total Products</p>



                <p className="text-lg sm:text-2xl font-bold text-gray-900">{products.length}</p>



              </div>



              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">



                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />



              </div>



            </div>



          </motion.div>







          <motion.div



            initial={{ opacity: 0, y: 20 }}



            animate={{ opacity: 1, y: 0 }}



            transition={{ delay: 0.1 }}



            className="bg-white rounded-xl shadow-sm p-3 sm:p-6"



          >



            <div className="flex items-center justify-between">



              <div>



                <p className="text-xs sm:text-sm text-gray-600">Categories</p>



                <p className="text-lg sm:text-2xl font-bold text-gray-900">{categories.length - 1}</p>



              </div>



              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">



                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />



              </div>



            </div>



          </motion.div>







          <motion.div



            initial={{ opacity: 0, y: 20 }}



            animate={{ opacity: 1, y: 0 }}



            transition={{ delay: 0.2 }}



            className="bg-white rounded-xl shadow-sm p-3 sm:p-6"



          >



            <div className="flex items-center justify-between">



              <div>



                <p className="text-xs sm:text-sm text-gray-600">In Stock</p>



                <p className="text-lg sm:text-2xl font-bold text-gray-900">



                  {products.filter(p => p.inStock).length}



                </p>



              </div>



              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#F1F5EB] rounded-lg flex items-center justify-center">



                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#5F6F46]" />



              </div>



            </div>



          </motion.div>







          <motion.div



            initial={{ opacity: 0, y: 20 }}



            animate={{ opacity: 1, y: 0 }}



            transition={{ delay: 0.3 }}



            className="bg-white rounded-xl shadow-sm p-3 sm:p-6"



          >



            <div className="flex items-center justify-between">



              <div>



                <p className="text-xs sm:text-sm text-gray-600">Avg Rating</p>



                <p className="text-lg sm:text-2xl font-bold text-gray-900">



                  {products.length > 0



                    ? (products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1)



                    : "0"



                  }



                </p>



              </div>



              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">



                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />



              </div>



            </div>



          </motion.div>



        </div>







        {/* Filters */}



        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">



          <div className="flex flex-col md:flex-row gap-4">



            <div className="flex-1">



              <div className="relative">



                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />



                <input



                  type="text"



                  placeholder="Search products..."



                  value={searchTerm}



                  onChange={(e) => setSearchTerm(e.target.value)}



                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"



                />



              </div>



            </div>



            <div className="md:w-64">



              <select



                value={filterCategory}



                onChange={(e) => setFilterCategory(e.target.value)}



                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"



              >



                {categories.map(category => (



                  <option key={category} value={category}>



                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}



                  </option>



                ))}



              </select>



            </div>



          </div>



        </div>







        {/* Products - Mobile Card List (visible on mobile only) */}



        <div className="sm:hidden space-y-3">

          {filteredProducts.map((product, index) => (

            <motion.div

              key={product.id}

              initial={{ opacity: 0, y: 10 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ delay: index * 0.04 }}

              className="bg-white rounded-xl shadow-sm border border-gray-200 p-3"

            >

              <div className="flex items-start gap-3">

                <button

                  onClick={() => handleProductSelect(String(product.id))}

                  className={`mt-1 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${

                    selectedProducts.has(String(product.id))

                      ? 'bg-[#B4C49A] border-[#B4C49A]'

                      : 'bg-white border-gray-400'

                  }`}

                  aria-label="Select product"

                >

                  {selectedProducts.has(String(product.id)) && <Check className="w-2.5 h-2.5 text-white" />}

                </button>

                <img

                  src={product.image}

                  alt={product.name}

                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"

                />

                <div className="min-w-0 flex-1">

                  <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>

                  <div className="text-xs text-gray-500 truncate">{product.sku}</div>

                  <div className="mt-1 flex items-center gap-2 flex-wrap">

                    <span className="text-sm font-semibold text-gray-900">

                      ₹{Number(product.sellingPrice).toFixed(0)}

                    </span>

                    {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (

                      <span className="text-xs text-gray-500 line-through">

                        ₹{Number(product.mrp).toFixed(0)}

                      </span>

                    )}

                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap ${

                      (product.status || "").toLowerCase() === "draft"

                        ? "bg-amber-100 text-amber-800"

                        : "bg-emerald-100 text-emerald-800"

                    }`}>

                      {product.status || "Active"}

                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 border-t border-gray-100 pt-3">

                <Link

                  href={`/products/${product.slug}`}

                  className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"

                  title="View Product Details"

                >

                  <Eye className="w-4 h-4" />

                  <span className="text-[10px] font-medium">View</span>

                </Link>

                <Link

                  href={`/admin/add-product?edit=${product.id}`}

                  className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"

                  title="Edit Product"

                >

                  <Edit className="w-4 h-4" />

                  <span className="text-[10px] font-medium">Edit</span>

                </Link>

                <button

                  onClick={() => handleToggleBoost(product)}

                  disabled={boostingProducts.has(String(product.id))}

                  className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${

                    product.isBoosted

                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"

                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"

                  }`}

                  title={product.isBoosted ? "Remove Boost" : "Boost Product"}

                >

                  <Zap className="w-4 h-4" />

                  <span className="text-[10px] font-medium">{product.isBoosted ? "Boosted" : "Boost"}</span>

                </button>

                <button

                  onClick={() => handleDeleteProduct(String(product.id))}

                  className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"

                  title="Delete Product"

                >

                  <Trash2 className="w-4 h-4" />

                  <span className="text-[10px] font-medium">Delete</span>

                </button>

              </div>

            </motion.div>

          ))}

          {filteredProducts.length === 0 && (

            <div className="bg-white rounded-xl shadow-sm text-center py-10">

              <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />

              <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>

              <p className="text-xs text-gray-500">

                {searchTerm || filterCategory !== "all"

                  ? "Try adjusting your search or filter criteria"

                  : "Get started by adding your first product"}

              </p>

            </div>

          )}

        </div>



        {/* Products Table - Desktop (visible on sm and up) */}



        <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">



          <div className="overflow-x-auto">



            <table className="w-full">



              <thead className="bg-gray-50">



                <tr>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Select



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Product



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Category



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Status



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Price



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Stock



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Rating



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Date Added



                  </th>



                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">



                    Actions



                  </th>



                </tr>



              </thead>



              <tbody className="bg-white divide-y divide-gray-200">



                {filteredProducts.map((product, index) => (



                  <motion.tr



                    key={product.id}



                    initial={{ opacity: 0, x: -20 }}



                    animate={{ opacity: 1, x: 0 }}



                    transition={{ delay: index * 0.05 }}



                    className="hover:bg-gray-50"



                  >



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <button



                        onClick={() => handleProductSelect(String(product.id))}



                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${



                          selectedProducts.has(String(product.id))



                            ? 'bg-[#B4C49A] border-[#B4C49A] shadow-lg'



                            : 'bg-white border-gray-400 hover:border-[#B4C49A] shadow-md'



                        }`}



                      >



                        {selectedProducts.has(String(product.id)) && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}



                      </button>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <div className="flex items-center">



                        <img



                          src={product.image}



                          alt={product.name}



                          className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg object-cover mr-3 sm:mr-4"



                        />



                        <div>



                          <div className="text-xs sm:text-sm font-medium text-gray-900">



                            {product.name}



                          </div>



                          <div className="text-xs text-gray-500">



                            {product.sku}



                          </div>



                        </div>



                      </div>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-blue-100 text-blue-800">



                        {product.category}



                      </span>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${



                        (product.status || "").toLowerCase() === "draft"



                          ? "bg-amber-100 text-amber-800"



                          : "bg-emerald-100 text-emerald-800"



                      }`}>



                        {product.status || "Active"}



                      </span>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <span className="text-xs sm:text-sm text-gray-900">



                        ₹{Number(product.sellingPrice).toFixed(0)}



                      </span>



                      {product.mrp && (



                        <div className="text-xs text-gray-500 line-through">



                          ₹{Number(product.mrp).toFixed(0)}



                        </div>



                      )}



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${



                        product.inStock 



                          ? 'bg-green-100 text-green-800' 



                          : 'bg-red-100 text-red-800'



                      }`}>



                        {product.inStock ? 'In Stock' : 'Out of Stock'}



                      </span>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">



                      <div className="flex items-center">



                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />



                        <span className="text-xs sm:text-sm text-gray-900">{product.rating}</span>



                        <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>



                      </div>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">



                      <div className="flex items-center">



                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />



                        {new Date().toLocaleDateString()}



                      </div>



                    </td>



                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">



                      <div className="flex items-center gap-1.5 sm:gap-2">



                        <Link



                          href={`/products/${product.slug}`}



                          className="text-blue-600 hover:text-blue-900"



                          title="View Product Details"



                        >



                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                        </Link>



                        <Link



                          href={`/admin/add-product?edit=${product.id}`}



                          className="text-amber-600 hover:text-amber-900"



                          title="Edit Product"



                        >



                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                        </Link>



                        <button



                          onClick={() => handleToggleBoost(product)}



                          disabled={boostingProducts.has(String(product.id))}



                          className={`transition-colors ${



                            product.isBoosted



                              ? "text-yellow-500 hover:text-yellow-700"



                              : "text-slate-500 hover:text-yellow-600"



                          } disabled:opacity-50`}



                          title={product.isBoosted ? "Remove Boost" : "Boost Product"}



                        >



                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                        </button>



                        <button



                          onClick={() => handleDeleteProduct(String(product.id))}



                          className="text-red-600 hover:text-red-900"



                          title="Delete Product"



                        >



                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                        </button>



                      </div>



                    </td>



                  </motion.tr>



                ))}



              </tbody>



            </table>



          </div>







          {filteredProducts.length === 0 && (



            <div className="text-center py-12">



              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />



              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products found</h3>



              <p className="text-gray-500">



                {searchTerm || filterCategory !== "all" 



                  ? "Try adjusting your search or filter criteria"



                  : "Get started by adding your first product"



                }



              </p>



              {!searchTerm && filterCategory === "all" && (



                <button



                  onClick={handleAddProduct}



                  className="inline-flex items-center gap-1.5 sm:gap-2 mt-4 bg-[#B4C49A] text-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-[#A4B68A] transition-colors"



                >



                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />



                  Add New Product



                </button>



              )}



            </div>



          )}



        </div>



      </div>







      {/* Delete Confirmation Modal */}



      <ConfirmModal



        isOpen={deleteModal.isOpen}



        onClose={() => setDeleteModal({ isOpen: false, productId: null })}



        onConfirm={confirmDeleteProduct}



        title="Delete Product"



        message="Are you sure you want to delete this product? This action cannot be undone."



        confirmText="Delete"



        cancelText="Cancel"



        variant="danger"



      />







      {/* Bulk Delete Confirmation Modal */}



      <ConfirmModal



        isOpen={bulkDeleteModal.isOpen}



        onClose={() => setBulkDeleteModal({ isOpen: false, count: 0 })}



        onConfirm={confirmBulkDelete}



        title={bulkDeleteModal.count === 0 ? "No Products Selected" : "Delete Multiple Products"}



        message={bulkDeleteModal.count === 0 



          ? "Please select at least one product to delete." 



          : `Are you sure you want to delete ${bulkDeleteModal.count} product${bulkDeleteModal.count > 1 ? 's' : ''}? This action cannot be undone.`



        }



        confirmText={bulkDeleteModal.count === 0 ? "OK" : "Delete All"}



        cancelText="Cancel"



        variant={bulkDeleteModal.count === 0 ? "primary" : "danger"}



      />



      {/* Boost Modal */}

      {boostModal.product && (

        <BoostModal

          isOpen={boostModal.isOpen}

          onClose={() => setBoostModal({ isOpen: false, product: null })}

          product={boostModal.product}

          onSave={handleSaveBoostSections}

        />

      )}



    </div>



  );



}



