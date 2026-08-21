import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  MapPin,
  CreditCard,
  RefreshCw,
  Eye,
  Download,
  HelpCircle,
  X,
  Users,
  User
} from "lucide-react";
import { useAdminOrders } from "../hooks/useAdminOrders";

interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  sellingPrice?: number;
  price?: number;
  quantity: number;
  image: string;
  slug?: string;
  sku?: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  userId: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  },
  processing: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Processing'
  },
  shipped: {
    icon: Truck,
    color: 'text-[#5F6F46]',
    bgColor: 'bg-[#F1F5EB]',
    borderColor: 'border-[#B4C49A]',
    label: 'Shipped'
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Completed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Cancelled'
  }
};

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const { data: orders, isLoading, error } = useAdminOrders();

  console.log('🔍 Admin Orders Debug - Orders data:', orders);
  console.log('🔍 Admin Orders Debug - Loading:', isLoading);
  console.log('🔍 Admin Orders Debug - Error:', error);
  console.log('🔍 Admin Orders Debug - Orders length:', orders?.length);

  // Format price to INR
  const formatPrice = (sellingPrice: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(sellingPrice);
  };

  const getItemUnitPrice = (item: OrderItem) => {
    const value = item.sellingPrice ?? item.price ?? 0;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const getItemSize = (item: OrderItem) => {
    const size = item.size?.trim();
    return size && size.toLowerCase() !== 'n/a' ? size : null;
  };

  const getItemProductSku = (item?: OrderItem) => {
    return item?.sku || null;
  };

  const getItemProductHref = (item: OrderItem) => {
    if (item.slug) return `/products/${item.slug}`;

    const productId = item.productId || item.id;
    return productId ? `/products/product-${productId}` : null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusConfig = (status: string | undefined | null) => {
    const key = (status || 'pending').toLowerCase() as keyof typeof statusConfig;
    return statusConfig[key] || statusConfig.pending;
  };

  const getPaymentStatusConfig = (status: string | undefined | null) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'completed' || s === 'paid successfully' || s === 'success') {
      return {
        label: 'Paid Successfully',
        dotClass: 'bg-green-500',
        textClass: 'text-green-700',
        badgeClass: 'bg-green-50 text-green-700 border-green-200 border'
      };
    }
    if (s === 'pending') {
      return {
        label: 'Pending',
        dotClass: 'bg-yellow-500',
        textClass: 'text-yellow-700',
        badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 border'
      };
    }
    return {
      label: 'Failed',
      dotClass: 'bg-red-500',
      textClass: 'text-red-700',
      badgeClass: 'bg-red-50 text-red-700 border-red-200 border'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#B4C49A] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading all orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Failed to load orders</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#B4C49A] text-black px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-[#A4B68A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 pb-6 sm:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#5F6F46] flex-shrink-0" />
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">All Orders</h1>
              </div>
              <p className="text-xs sm:text-base text-gray-600">
                Manage all customer orders from this admin dashboard
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-2xl font-bold text-[#5F6F46]">
                {orders?.length || 0}
              </div>
              <div className="text-[11px] sm:text-sm text-gray-600 whitespace-nowrap">Total Orders</div>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        {orders && orders.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900">Orders Collection</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                All orders from all users in the system
              </p>
            </div>
            
            {/* Table - Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipping Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: Order, index: number) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getItemProductSku(order.items?.[0]) || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items?.length || 0} items
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {order.items[0].name}
                              {order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 ? (
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-sm">
                                    {order.shippingAddress.fullName || 'N/A'}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {order.shippingAddress.phone || 'N/A'}
                                  </p>
                                  <p className="font-medium mt-1">
                                    {order.shippingAddress.street || 'N/A'}
                                  </p>
                                  <p className="text-gray-600 text-xs">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || ''}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 italic">
                                No address available
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-[#5F6F46] hover:text-[#4F5E39] font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-3">
              {orders.map((order: Order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-2.5 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-[11px] text-gray-500 truncate">Product ID: {getItemProductSku(order.items?.[0]) || 'N/A'}</p>
                        <p className="text-[11px] text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bgColor} ${statusConfig.color} flex-shrink-0`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 whitespace-nowrap">{order.items?.length || 0} items</span>
                        {order.items && order.items.length > 0 && (
                          <span className="text-[11px] text-gray-500 truncate min-w-0">
                            {order.items[0].name}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </span>
                        )}
                      </div>

                      {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-[11px] text-gray-600 space-y-0.5 min-w-0 flex-1">
                            <p className="font-semibold text-gray-900">{order.shippingAddress.fullName || 'N/A'}</p>
                            <p className="text-gray-500">{order.shippingAddress.phone || 'N/A'}</p>
                            <p className="font-medium">{order.shippingAddress.street || 'N/A'}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || ''}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatPrice(order.totalAmount)}</span>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5EB] text-[#5F6F46] hover:bg-[#B4C49A] text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {orders.length} order{orders.length === 1 ? '' : 's'}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  Total Revenue: {formatPrice(orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">No orders yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8 max-w-md mx-auto px-4">
              There are no orders in the system yet. Orders will appear here once customers start placing them.
            </p>
          </motion.div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2 sm:p-4 lg:p-8"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                      Order Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    aria-label="Close order details"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Order Status */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-5">Order Status</h3>
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                    {(() => {
                      const statusConfig = getStatusConfig(selectedOrder.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div className={`flex items-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                          <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${statusConfig.color} flex-shrink-0`} />
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm sm:text-base lg:text-lg ${statusConfig.color}`}>{statusConfig.label}</p>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                              {selectedOrder.status === 'delivered'
                                ? 'Order has been delivered'
                                : selectedOrder.status === 'shipped'
                                ? `Order is on its way (Tracking: ${selectedOrder.trackingNumber})`
                                : selectedOrder.status === 'processing'
                                ? 'Order is being prepared'
                                : selectedOrder.status === 'cancelled'
                                ? 'This order has been cancelled'
                                : 'Order is being processed'
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-5">Order Items</h3>
                  <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                    {selectedOrder.items.map((item) => {
                      const productSku = getItemProductSku(item);
                      const productHref = getItemProductHref(item);
                      console.log('🔍 Order item:', item);
                      console.log('🔍 Item sku:', item.sku);
                      return (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-5 lg:p-6 bg-gray-50 rounded-xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 w-full min-w-0">
                          <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500 mt-0.5 sm:mt-1 lg:mt-2">Product ID: {productSku || 'N/A'}</p>
                          <div className="mt-1 sm:mt-2 lg:mt-3 flex flex-wrap items-center gap-x-2 sm:gap-x-3 lg:gap-x-4 gap-y-0.5 sm:gap-y-1 text-xs sm:text-sm lg:text-base text-gray-500">
                            <span>Quantity: {item.quantity}</span>
                            {getItemSize(item) && <span>Size: {getItemSize(item)}</span>}
                          </div>
                          <div className="mt-1 sm:mt-2 lg:mt-3 flex flex-wrap items-center gap-x-2 sm:gap-x-3 lg:gap-x-4 gap-y-0.5 sm:gap-y-1 text-xs sm:text-sm lg:text-base">
                            <span className="font-semibold text-[#5F6F46]">
                              Price: {formatPrice(getItemUnitPrice(item))}
                            </span>
                            <span className="font-semibold text-gray-900">
                              Total: {formatPrice(getItemUnitPrice(item) * item.quantity)}
                            </span>
                          </div>
                        </div>
<div className="w-full sm:w-auto flex-shrink-0">
                           {productHref ? (
                             <Link href={productHref} className="block w-full sm:w-auto">
                              <button
                                className="w-full sm:w-auto bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-md text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                                aria-label={`View product details for ${item.name}`}
                              >
                                View Product
                              </button>
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="w-full sm:w-auto bg-gray-100 border-gray-300 text-gray-500 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-md text-xs sm:text-sm lg:text-base font-medium cursor-not-allowed opacity-60"
                              aria-label="Product details unavailable"
                            >
                              Details unavailable
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-5">Shipping Address</h3>
                    <div className="p-4 sm:p-5 lg:p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <div className="text-xs sm:text-sm lg:text-base">
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.shippingAddress.fullName || 'N/A'}
                          </p>
                          <p className="text-gray-500">
                            {selectedOrder.shippingAddress.phone || 'N/A'}
                          </p>
                          <p className="font-medium text-gray-900 mt-0.5 sm:mt-1 lg:mt-2">
                            {selectedOrder.shippingAddress.street}
                          </p>
                          <p className="text-gray-600">
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-5">Payment Information</h3>
                    <div className="p-4 sm:p-5 lg:p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400" />
                        <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      {(() => {
                        const payConfig = getPaymentStatusConfig(selectedOrder.paymentStatus);
                        return (
                          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full ${payConfig.dotClass}`}></div>
                            <span className={`text-xs sm:text-sm lg:text-base font-semibold ${payConfig.textClass}`}>
                              {payConfig.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6 lg:pt-8">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-5">Order Summary</h3>
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base sm:text-lg lg:text-xl text-gray-900 pt-2 sm:pt-3 lg:pt-4 border-t">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200">
                  <button className="inline-flex items-center gap-1.5 sm:gap-2 lg:gap-3 text-[#5F6F46] hover:text-[#4F5E39] text-xs sm:text-sm lg:text-base font-medium transition-colors">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Need Help?
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
