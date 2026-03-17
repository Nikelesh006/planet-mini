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
  Lock
} from "lucide-react";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authorization on component mount
    const checkAuthorization = () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const authorized = isUserAdminAuthorized(user);
      
      setIsAuthorized(!!authorized);
      setIsLoading(false);

      // Log unauthorized access attempts and redirect immediately
      if (!authorized) {
        logUnauthorizedAccess(user.email || 'unknown', 'Admin Dashboard Access Attempt');
        window.location.href = '/'; // Redirect to home
      }
    };

    checkAuthorization();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
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

  // Mock data for demonstration
  const stats = [
    { label: "Total Orders", value: "1,234", change: "+12%", icon: ShoppingCart, color: "from-blue-500 to-blue-600" },
    { label: "Total Revenue", value: "₹45,678", change: "+23%", icon: DollarSign, color: "from-pink-500 to-pink-600" },
    { label: "Total Customers", value: "892", change: "+8%", icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Total Products", value: "156", change: "+5%", icon: Package, color: "from-blue-500 to-pink-600" }
  ];

  const recentOrders = [
    { id: "#1234", customer: "John Doe", amount: "₹89.99", status: "Delivered", date: "2024-02-23" },
    { id: "#1235", customer: "Jane Smith", amount: "₹124.99", status: "Processing", date: "2024-02-23" },
    { id: "#1236", customer: "Bob Johnson", amount: "₹67.99", status: "Shipped", date: "2024-02-22" },
    { id: "#1237", customer: "Alice Brown", amount: "₹156.99", status: "Pending", date: "2024-02-22" }
  ];

  const topProducts = [
    { name: "Baby Onesie Set", sales: 234, revenue: "₹5,678", rating: 4.8 },
    { name: "Swaddle Blanket", sales: 189, revenue: "₹4,234", rating: 4.9 },
    { name: "Baby Bib Pack", sales: 156, revenue: "₹2,890", rating: 4.7 },
    { name: "Sleeping Bag", sales: 145, revenue: "₹3,456", rating: 4.6 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100/90 via-white/50 to-pink-100/90 backdrop-blur-lg shadow-lg border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform">
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
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/admin/add-product" className="w-full flex items-center gap-3 p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add New Product</span>
                </Link>
                <Link href="/admin/product-list" className="w-full flex items-center gap-3 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                  <List className="w-5 h-5" />
                  <span className="font-medium">Product List</span>
                </Link>
                <Link href="/admin/orders" className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Tag className="w-5 h-5" />
                  <span className="font-medium">Manage Categories</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Customer Messages</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">View Analytics</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
