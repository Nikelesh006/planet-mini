import { ReactNode, useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { ShieldAlert, Lock, LogIn, Home, Loader2, ArrowLeft } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAuthorized = isUserAdminAuthorized(user || undefined);

  useEffect(() => {
    // Log unauthorized access attempts when user is loaded but not an admin
    if (!isLoading && user && !isAuthorized) {
      logUnauthorizedAccess(user.email || "unknown", "Admin Page Access Attempt");
    }
  }, [isLoading, user, isAuthorized]);

  // 1. Loading state while checking authentication session
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#B4C49A] mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-semibold text-gray-800">Verifying Admin Access...</h2>
          <p className="text-sm text-gray-500 mt-1">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user - Admin Login required
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#B4C49A]/40 p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#B4C49A]" />

          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login Required</h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            This area is restricted to authorized administrators. Please log in with your admin credentials to access the admin portal.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#B4C49A] hover:bg-[#a3b587] text-gray-900 font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Log In as Admin
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              <Home className="w-4 h-4" />
              Return to Storefront
            </Link>
          </div>

          <GoogleAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode="signin"
          />
        </div>
      </div>
    );
  }

  // 3. Authenticated user, but NOT authorized as admin
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />

          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            You are currently signed in as:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 mb-4 text-xs font-mono text-gray-700 break-all">
            {user.email || user.name || "User"}
          </div>
          <p className="text-xs text-red-600 font-medium mb-6">
            This account does not have administrator privileges. Please log in with an authorized administrator account.
          </p>

          <div className="space-y-3">
            <button
              onClick={async () => {
                await logout();
                setIsAuthModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#B4C49A] hover:bg-[#a3b587] text-gray-900 font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Switch to Admin Account
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Storefront
            </Link>
          </div>

          <GoogleAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode="signin"
          />
        </div>
      </div>
    );
  }

  // 4. Authorized admin - render protected component
  return <>{children}</>;
}
