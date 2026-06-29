import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Plus,
  Settings,
  LogOut,
  Home,
  List,
  Shield,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";
import { API_BASE_URL } from "@/lib/api";

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
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
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
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
          <Loader2 className="w-16 h-16 text-[#B4C49A] mx-auto mb-4 animate-spin" />
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
    { label: "Total Orders", value: formatNumber(dashboardData.summary.totalOrders), change: null, icon: ShoppingCart, color: "bg-[#B4C49A]" },
    { label: "Total Revenue", value: formatCurrency(dashboardData.summary.totalRevenue), change: null, icon: DollarSign, color: "bg-[#B4C49A]" },
    { label: "Total Customers", value: formatNumber(dashboardData.summary.totalCustomers), change: null, icon: Users, color: "bg-[#B4C49A]" },
    { label: "Total Products", value: formatNumber(dashboardData.summary.totalProducts), change: null, icon: Package, color: "bg-[#B4C49A]" }
  ] : [
    { label: "Total Orders", value: "0", change: null, icon: ShoppingCart, color: "bg-[#B4C49A]" },
    { label: "Total Revenue", value: "₹0", change: null, icon: DollarSign, color: "bg-[#B4C49A]" },
    { label: "Total Customers", value: "0", change: null, icon: Users, color: "bg-[#B4C49A]" },
    { label: "Total Products", value: "0", change: null, icon: Package, color: "bg-[#B4C49A]" }
  ];

  // Kept for future backend invoice work.
  const generateInvoiceContent = (order: any): string => {
    const statusCfg = { label: order.status || 'Pending' };
    const date = new Date(order.createdAt).toLocaleDateString('en-IN');

    let content = `
========================================
           PLANET MINI INVOICE
========================================

Order Number: ${order.orderNumber}
Date: ${date}
Status: ${statusCfg.label}

----------------------------------------
CUSTOMER DETAILS
----------------------------------------
Shipping Address:
${order.shippingAddress?.street || 'N/A'}
${order.shippingAddress?.city}, ${order.shippingAddress?.state}
${order.shippingAddress?.pincode || ''}

----------------------------------------
ORDER ITEMS
----------------------------------------
`;

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any, index: number) => {
        const itemTotal = (item.sellingPrice * item.quantity).toFixed(2);
        content += `${index + 1}. ${item.name}
   Quantity: ${item.quantity}
   Price: ₹${item.sellingPrice.toFixed(2)}
   Subtotal: ₹${itemTotal}
\n`;
      });
    } else {
      content += 'No items found\n';
    }

    content += `
----------------------------------------
PAYMENT DETAILS
----------------------------------------
Payment Method: ${order.paymentMethod || 'N/A'}
Payment Status: ${order.paymentStatus || 'pending'}

----------------------------------------
ORDER SUMMARY
----------------------------------------
Subtotal: ₹${order.totalAmount.toFixed(2)}
Shipping: Free
Total Amount: ₹${order.totalAmount.toFixed(2)}

========================================
Thank you for shopping with Planet Mini!
========================================
`;

    return content;
  };

  const recentOrderedProducts = dashboardData?.recentOrders
    ? dashboardData.recentOrders
        .slice()
        .flatMap((order: any) =>
          (order.items || []).map((item: any) => ({
            ...item,
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
          }))
        )
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#B4C49A] backdrop-blur-lg shadow-lg border-b border-[#9EAF84]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black">
                <div className="w-8 h-8 rounded-full bg-[#B4C49A] border border-[#5F6F46]/30 flex items-center justify-center text-black shadow-lg transform hover:scale-110 transition-transform">
                  <span className="text-sm font-bold">PM</span>
                </div>
                <span>Planet Mini</span>
              </Link>
              <div className="h-8 w-px bg-[#5F6F46]/30"></div>
              <h1 className="text-xl font-semibold text-black">Admin Dashboard</h1>
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
          className="bg-[#F1F5EB] rounded-2xl shadow-lg p-6 border border-[#B4C49A]/40"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#B4C49A] rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold ">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Link href="/admin/add-product" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-[#B4C49A]/40">
              <div className="w-12 h-12 bg-[#B4C49A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-sm text-center group-hover:text-[#5F6F46] transition-colors">Add Product</span>
            </Link>
            <Link href="/admin/product-list" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-[#B4C49A]/40">
              <div className="w-12 h-12 bg-[#B4C49A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <List className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-[#5F6F46] transition-colors">Products</span>
            </Link>
            <Link href="/admin/orders" className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-[#B4C49A]/40">
              <div className="w-12 h-12 bg-[#B4C49A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-700 text-sm text-center group-hover:text-[#5F6F46] transition-colors">Orders</span>
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
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-black" />
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

        <div className="grid grid-cols-1 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {recentOrderedProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrderedProducts.map((item: any, index: number) => (
                      <div key={`${item.id}-${index}`} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Order #{item.orderNumber} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{Number(item.sellingPrice || item.price || 0).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No orders</p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}
