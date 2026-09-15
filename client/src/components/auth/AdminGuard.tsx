import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdminAuthorized, logUnauthorizedAccess } from "@/lib/admin-auth";
import { ShieldAlert, Lock, Loader2, KeyRound } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * AdminGuard component to protect administrative pages.
 * Enforces 5 distinct states:
 * 1. Loading: Displays verified session check indicator
 * 2. Unauthenticated: Renders Admin Login Required warning card (no action buttons)
 * 3. Unauthorized: Renders 403 Access Denied for authenticated non-admin users
 * 4. Locked: Renders Admin PIN Verification Required for authorized admins who have not verified PIN
 * 5. Authorized & Verified Admin: Renders the protected admin component
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAdminPinVerified, setIsPinModalOpen } = useAuth();
  const [location] = useLocation();

  const isAuthorized = isUserAdminAuthorized(user || undefined);

  useEffect(() => {
    // Log unauthorized access attempts when user is loaded but not an admin
    if (!isLoading && user && !isAuthorized) {
      logUnauthorizedAccess(user.email || "unknown", `Admin Page Access Attempt: ${location}`);
    }
  }, [isLoading, user, isAuthorized, location]);

  // 1. Loading state while checking authentication session
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#B4C49A] mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-semibold text-gray-800">Verifying Administrator Access...</h2>
          <p className="text-sm text-gray-500 mt-1">Please wait while we authenticate your privileges.</p>
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
          <p className="text-sm text-gray-600 leading-relaxed">
            This area is restricted to authorized administrators. Please sign in with your admin credentials to access the admin portal.
          </p>
        </div>
      </div>
    );
  }

  // 3. Authenticated user, but NOT authorized as admin (403 Forbidden)
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />

          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">403 — Access Denied</h1>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            You are currently signed in as:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 mb-4 text-xs font-mono text-gray-700 break-all">
            {user.email || user.name || "Customer Account"}
          </div>
          <p className="text-xs text-red-600 font-medium mb-2">
            This account does not have administrator privileges. Please log in with an authorized administrator account.
          </p>
        </div>
      </div>
    );
  }

  // 4. Authorized admin, but secondary Admin PIN NOT yet verified
  if (!isAdminPinVerified) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200/70 p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#B4C49A] to-amber-500" />

          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
            <KeyRound className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Verification Required</h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            This area is restricted to authorized administrators. Secondary admin verification is required to access the admin panel.
          </p>

          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#B4C49A] hover:bg-[#a3b587] text-gray-900 font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <KeyRound className="w-4 h-4" />
            Enter Admin Password / PIN
          </button>
        </div>
      </div>
    );
  }

  // 5. Authorized admin AND PIN verified - render protected component
  return <>{children}</>;
}

/**
 * ProtectedAdminRoute wrapper for wouter routes.
 * Usage: <ProtectedAdminRoute component={ProductList} />
 */
export function ProtectedAdminRoute({
  component: Component,
  ...props
}: {
  component: React.ComponentType<any>;
  [key: string]: any;
}) {
  return (
    <AdminGuard>
      <Component {...props} />
    </AdminGuard>
  );
}
