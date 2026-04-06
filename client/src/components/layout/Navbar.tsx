import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, X, Heart, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLikes } from "@/contexts/LikeContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { isUserAdminAuthorized } from "@/lib/admin-auth";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state } = useCart();
  const { user, isLoading, logout } = useAuth();
  const { isAuthModalOpen, authMode, openSignInModal, openSignUpModal, closeAuthModal } = useAuthModal();
  const { likedProducts, toggleLike, isLiked } = useLikes();
 
  const handleProfileClick = () => {
    if (!user && !isLoading) {
      openSignInModal(); // Open sign in modal by default
    } else if (user) {
      window.location.href = '/profile'; // Navigate to profile when logged in
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highly secure admin access - only authorized emails can see admin link
  const isAdminUser = isUserAdminAuthorized(user || undefined);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop by Style", href: "/shop/style" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    // Only show Admin link to authorized users
    ...(isAdminUser ? [{ label: "Admin", href: "/admin" }] : [])
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-orange-50",
          isScrolled 
            ? "shadow-lg py-3" 
            : "shadow-md py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center justify-start hover:opacity-80 transition-opacity"
            >
              <img 
                src="/Planet-mini-logo.png" 
                alt="Planet Mini Logo" 
                className="h-12 w-auto object-contain transform hover:scale-105 transition-transform"
                onError={(e) => {
                  // Fallback to original logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-secondary to-primary flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform" style={{display: 'none'}}>
                <span className="text-sm font-bold">PM</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-4">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-all duration-300 ease-in-out relative px-4 py-2 rounded-lg overflow-hidden group",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary before:to-secondary before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out",
                    "hover:before:opacity-100 hover:text-white hover:shadow-lg hover:transform hover:-translate-y-0.5",
                    location === link.href 
                      ? "text-black bg-gradient-to-r from-primary to-secondary shadow-lg border border-primary/30"
                      : "text-black hover:text-white"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="group p-2 text-black hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-secondary/80 rounded-full transition-all duration-300 transform hover:scale-110">
                <Search className="w-5 h-5" />
              </button>
              <button className="group p-2 text-black hover:text-white hover:bg-gradient-to-r hover:from-secondary/80 hover:to-primary rounded-full transition-all duration-300 transform hover:scale-110">
                <Link href="/likes" className="block relative">
                  {likedProducts.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-secondary/80 to-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-lg"
                    >
                      {likedProducts.length > 9 ? '9+' : likedProducts.length}
                    </motion.div>
                  )}
                  <Heart 
                    className={`w-5 h-5 transition-colors ${
                      location === '/likes' 
                        ? 'text-white fill-current' 
                        : likedProducts.some(p => String(p.id) === '1') // Sample product ID - you can make this dynamic
                          ? 'text-primary fill-current' 
                          : 'text-black'
                    }`} 
                  />
                </Link>
              </button>
              <button
                onClick={handleProfileClick}
                className="hidden sm:flex p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                ) : user ? (
                  user.image ? (
                    <img src={user.image} alt="Avatar" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isLoading ? '' : user ? user.name || 'Profile' : 'Profile'}
                </span>
              </button>
              <Link
                href="/cart"
                className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {state.totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-background"
                  >
                    {state.totalItems > 99 ? '99+' : state.totalItems}
                  </motion.div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-card shadow-2xl p-6 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-gradient-to-r from-blue-100 to-pink-100 rounded-full text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                      location === link.href 
                        ? "text-white bg-gradient-to-r from-blue-500 to-pink-500 shadow-lg" 
                        : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-4" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProfileClick();
                  }}
                  className="text-lg font-semibold py-3 px-4 rounded-xl text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                  ) : user ? (
                    user.image ? (
                      <img src={user.image} alt="Avatar" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoading ? '' : user ? user.name || 'Profile' : 'Profile'}
                  </span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Google Auth Modal */}
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} initialMode={authMode} />
    </>
  );
}
