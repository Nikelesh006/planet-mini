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
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
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
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Shipped'
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered'
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading all orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 mb-4">Failed to load orders</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
              </div>
              <p className="text-gray-600">
                Manage all customer orders from this admin dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {orders?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        {orders && orders.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Orders Collection</h2>
              <p className="text-sm text-gray-600 mt-1">
                All orders from all users in the system
              </p>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                      Payment
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.paymentMethod || 'Credit Card'}
                          </div>
                          <div className="text-xs text-green-600">
                            {order.paymentStatus || 'Paid'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-primary hover:text-primary/80 font-medium"
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
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {orders.length} order{orders.length === 1 ? '' : 's'}
                </div>
                <div className="text-sm font-medium text-gray-900">
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
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Order Status */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const statusConfig = getStatusConfig(selectedOrder.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                          <div>
                            <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                            <p className="text-sm text-gray-600">
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
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 w-full">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <div className="w-full sm:w-auto flex-shrink-0">
                          {item.slug ? (
                            <Link href={`/products/${item.slug}`} className="block w-full sm:w-auto">
                              <button 
                                className="w-full sm:w-auto bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                                aria-label={`View product details for ${item.name}`}
                              >
                                View Product
                              </button>
                            </Link>
                          ) : (
                            <button 
                              disabled
                              className="w-full sm:w-auto bg-gray-100 border-gray-300 text-gray-500 px-3 py-1 rounded-md text-sm font-medium cursor-not-allowed opacity-60"
                              aria-label="Product details unavailable"
                            >
                              Details unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.shippingAddress.fullName || 'N/A'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {selectedOrder.shippingAddress.phone || 'N/A'}
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-green-500' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-gray-600 capitalize">
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
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
                    <div className="flex justify-between font-semibold text-lg text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                    <HelpCircle className="w-5 h-5" />
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
