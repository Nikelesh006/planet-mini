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
  Check
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import type { ProductResponse } from "@shared/routes";

export default function ProductList() {
  const { data: products = [], isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
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
      let filtered = products;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by category
      if (filterCategory !== "all") {
        filtered = filtered.filter(product => product.category === filterCategory);
      }

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
      const response = await fetch(`/api/products/${deleteModal.productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDeleteModal({ isOpen: true, productId: null });
          return;
        }
        throw new Error('Failed to delete product');
      }

      const result = await response.json();
      setDeleteModal({ isOpen: false, productId: null });
      
      // Refresh the products list by refetching
      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteModal({ isOpen: false, productId: null });
    }
  };

  const handleAddProduct = () => {
  // Clear any existing edit data from localStorage
  localStorage.removeItem('editProduct');
  
  // Navigate to add product page
  window.location.href = '/admin/add-product';
};

const handleProductSelect = (productId: number) => {
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
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete product ${productId}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);
      setSelectedProducts(new Set());

      // Show success message
      setBulkDeleteModal({ isOpen: false, count: 0 });

      // Refresh the page to show updated list
      window.location.reload();

    } catch (error) {
      console.error('Error deleting products:', error);
      setBulkDeleteModal({ isOpen: false, count: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Admin</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Product List</h1>
            </div>
            <div className="flex items-center gap-3">
              {selectedProducts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedProducts.size})</span>
                </button>
              )}
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.inStock).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length > 0 
                    ? (products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1)
                    : "0"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleProductSelect(product.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
                          selectedProducts.has(product.id)
                            ? 'bg-blue-600 border-blue-600 shadow-lg'
                            : 'bg-white border-gray-400 hover:border-blue-500 shadow-md'
                        }`}
                      >
                        {selectedProducts.has(product.id) && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{Number(product.originalPrice).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">{product.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/add-product?edit=${product.id}`}
                          className="text-amber-600 hover:text-amber-900"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(String(product.id))}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchTerm || filterCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first product"
                }
              </p>
              {!searchTerm && filterCategory === "all" && (
                <button
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
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
    </div>
  );
}
