import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  LogOut,
  BarChart3,
  Home,
  Tag,
  MessageSquare,
  Star,
  List,
  Shield,
  AlertTriangle,
  Lock,
  Loader2,
  Clock,
  RefreshCw,
  Truck,
  CheckCircle,
  Image,
  XCircle,
  MapPin,
  CreditCard,
  X
} from "lucide-react";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";

// Format helpers
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const checkAuthorization = () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const authorized = isUserAdminAuthorized(user);
      setIsAuthorized(!!authorized);
      setIsLoading(false);
      if (!authorized) {
        logUnauthorizedAccess(user.email || 'unknown', 'Admin Dashboard Access Attempt');
        window.location.href = '/';
      }
    };
    checkAuthorization();
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthorized) return;
    
    const fetchDashboard = async () => {
      try {
        setDataLoading(true);
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchDashboard();
  }, [isAuthorized]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while checking authorization or fetching data
  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{isLoading ? 'Verifying admin access...' : 'Loading dashboard data...'}</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access the admin dashboard. This area is restricted to authorized administrators only.
          </p>
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2 inline" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use real data from API or fallback to zeros if not loaded
  const stats = dashboardData ? [
    { label: "Total Orders", value: formatNumber(dashboardData.summary.totalOrders), change: null, icon: ShoppingCart, color: "from-blue-500 to-blue-600" },
    { label: "Total Revenue", value: formatCurrency(dashboardData.summary.totalRevenue), change: null, icon: DollarSign, color: "from-pink-500 to-pink-600" },
    { label: "Total Customers", value: formatNumber(dashboardData.summary.totalCustomers), change: null, icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Total Products", value: formatNumber(dashboardData.summary.totalProducts), change: null, icon: Package, color: "from-blue-500 to-pink-600" }
  ] : [
    { label: "Total Orders", value: "0", change: null, icon: ShoppingCart, color: "from-blue-500 to-blue-600" },
    { label: "Total Revenue", value: "₹0", change: null, icon: DollarSign, color: "from-pink-500 to-pink-600" },
    { label: "Total Customers", value: "0", change: null, icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Total Products", value: "0", change: null, icon: Package, color: "from-blue-500 to-pink-600" }
  ];

  const recentOrders = dashboardData?.recentOrders?.map((order: any) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items: order.items || [],
    shippingAddress: order.shippingAddress || {},
    paymentMethod: order.paymentMethod || 'Credit Card',
    paymentStatus: order.paymentStatus || 'pending'
  })) || [];

  // Status configuration with icons
  const statusConfig: any = {
    pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Pending' },
    processing: { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Processing' },
    shipped: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Cancelled' }
  };

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.pending;

  const topProducts = [
    { name: "Baby Onesie Set", sales: 234, revenue: "₹5,678", rating: 4.8 },
    { name: "Swaddle Blanket", sales: 189, revenue: "₹4,234", rating: 4.9 },
    { name: "Baby Bib Pack", sales: 156, revenue: "₹2,890", rating: 4.7 },
    { name: "Sleeping Bag", sales: 145, revenue: "₹3,456", rating: 4.6 }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-lg shadow-lg border-b border-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform">
                  <span className="text-sm font-bold">PM</span>
                </div>
                <span>Planet Mini</span>
              </Link>
              <div className="h-8 w-px bg-gradient-to-b from-blue-200 to-pink-200"></div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl shadow-lg p-6 border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold ">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Link href="/admin/add-product" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-sm text-center group-hover:text-primary transition-colors">Add Product</span>
            </Link>
            <Link href="/admin/product-list" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-secondary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <List className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-secondary transition-colors">Products</span>
            </Link>
            <Link href="/admin/orders" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-primary transition-colors">Orders</span>
            </Link>
            <button className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-secondary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Tag className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-secondary transition-colors">Categories</span>
            </button>
            <button className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-primary transition-colors">Messages</span>
            </button>
            <button className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-secondary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-secondary transition-colors">Analytics</span>
            </button>
            <Link href="/admin/add-banner" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Image className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-sm text-center group-hover:text-primary transition-colors">Add Banner</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <Link 
                    href="/admin/orders"
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
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
                    {recentOrders.map((order: any, index: number) => {
                      const statusCfg = getStatusConfig(order.status);
                      const StatusIcon = statusCfg.icon;
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
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
                            <div className="text-sm text-gray-900 max-w-xs">
                              {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 ? (
                                <div className="flex items-start gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="truncate">
                                    <p className="font-medium truncate">{order.shippingAddress.street || 'N/A'}</p>
                                    <p className="text-gray-600 text-xs truncate">
                                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || ''}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 italic">No address</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.paymentMethod}</div>
                            <div className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {order.paymentStatus}
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
            </div>
          </motion.div>

          {/* Top Products & Quick Actions */}
          <div className="space-y-6">
            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{product.sales} sold</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{product.revenue}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

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
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                  </p>
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
                {(() => {
                  const statusCfg = getStatusConfig(selectedOrder.status);
                  const StatusIcon = statusCfg.icon;
                  return (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${statusCfg.bgColor} border`}>
                      <StatusIcon className={`w-6 h-6 ${statusCfg.color}`} />
                      <div>
                        <p className={`font-semibold ${statusCfg.color}`}>{statusCfg.label}</p>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.status === 'delivered' 
                            ? 'Order has been delivered'
                            : selectedOrder.status === 'shipped'
                            ? 'Order is on its way'
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

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No items found</p>}
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
                        <p className="font-medium text-gray-900">
                          {selectedOrder.shippingAddress?.street || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
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
                        selectedOrder.paymentStatus === 'completed' ? 'bg-green-500' :
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
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
