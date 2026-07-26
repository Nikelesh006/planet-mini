import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";
import { API_BASE_URL } from "@/lib/api";

interface SpinResult {
  _id: string;
  userId: {
    _id: string;
    phone: string;
    email: string;
  };
  prizeId: {
    _id: string;
    label: string;
    color: string;
    discountPercentage?: number;
    discountType?: string;
    discountValue?: number;
    isSpinAgain: boolean;
    isNoLuck: boolean;
  };
  prizeLabel: string;
  prizeColor: string;
  discountPercentage?: number;
  discountType?: string;
  discountValue?: number;
  isSpinAgain: boolean;
  isNoLuck: boolean;
  claimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export default function AdminSpinWheel() {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SpinResult[]>([]);
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
        logUnauthorizedAccess(user.email || 'unknown', 'Admin Spin Wheel Access Attempt');
        window.location.href = '/';
      }
    };
    checkAuthorization();
  }, [user]);

  // Fetch spin wheel results
  useEffect(() => {
    if (!isAuthorized) return;
    
    const fetchResults = async () => {
      try {
        setDataLoading(true);
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/api/spin-wheel/admin/results`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching spin wheel results:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchResults();
  }, [isAuthorized]);

  // Show loading state while checking authorization or fetching data
  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-16 sm:h-16 text-[#B4C49A] mx-auto mb-3 sm:mb-4 animate-spin" />
          <p className="text-sm sm:text-base text-gray-600 px-4">{isLoading ? 'Verifying admin access...' : 'Loading spin wheel results...'}</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Access Denied</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            You don't have permission to access the spin wheel admin page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getOfferDisplay = (result: SpinResult) => {
    if (result.isNoLuck) {
      return <span className="text-red-600 font-medium">No Luck</span>;
    }
    if (result.isSpinAgain) {
      return <span className="text-yellow-600 font-medium">Spin Again</span>;
    }
    if (result.discountPercentage) {
      return <span className="text-green-600 font-medium">{result.discountPercentage}% Off</span>;
    }
    if (result.discountValue) {
      return <span className="text-green-600 font-medium">₹{result.discountValue} Off</span>;
    }
    return <span className="text-gray-600">{result.prizeLabel}</span>;
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#B4C49A] backdrop-blur-lg shadow-lg border-b border-[#9EAF84]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="hidden sm:block h-8 w-px bg-[#5F6F46]/30"></div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-black" />
                <h1 className="text-sm sm:text-xl font-semibold text-black">Spin Wheel Results</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Spin Results</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Total: {results.length} spins</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Email ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Offer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.userId?.phone || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.userId?.email || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {getOfferDisplay(result)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {result.claimed ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Claimed</span>
                          </div>
                        ) : result.isNoLuck || result.isSpinAgain ? (
                          <div className="flex items-center gap-1 text-gray-500">
                            <XCircle className="w-4 h-4" />
                            <span>N/A</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <RotateCcw className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(result.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-sm text-gray-500">
                      No spin wheel results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
