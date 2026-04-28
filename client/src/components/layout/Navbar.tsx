import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, X, Heart, LogOut, UserCircle, ShoppingBag as OrdersIcon, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLikes } from "@/contexts/LikeContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import { isUserAdminAuthorized } from "@/lib/admin-auth";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useProducts } from "@/hooks/useProducts";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const { state } = useCart();
  const { user, isLoading, logout } = useAuth();
  const { isAuthModalOpen, authMode, openSignInModal, openSignUpModal, closeAuthModal } = useAuthModal();
  const { likedProducts, toggleLike, isLiked } = useLikes();

  // Fetch all products for search
  const { data: allProducts } = useProducts();

  // Search algorithm - filter products based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allProducts) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    return allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      const subcategoryMatch = product.subcategory?.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);
      
      return nameMatch || categoryMatch || subcategoryMatch || descriptionMatch;
    }).slice(0, 8); // Limit to 8 results
  }, [searchQuery, allProducts]);

  // Typewriter effect for search placeholder
  const searchTerms = ["Jhablas", "Towels", "Muslin Clothes", "Combo", "Blanket", "Bed"];
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  // Recommended products data
  const recommendedProducts = [
    { id: 1, name: "Soft Cotton Jhabla", category: "Jhablas", price: 299 },
    { id: 2, name: "Premium Bath Towel", category: "Towels", price: 499 },
    { id: 3, name: "Muslin Swaddle Cloth", category: "Muslin Clothes", price: 399 },
    { id: 4, name: "Baby Care Combo", category: "Combo", price: 899 },
    { id: 5, name: "Organic Baby Bib", category: "Muslin Clothes", price: 199 },
  ];

  useEffect(() => {
    const currentTerm = searchTerms[currentTermIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentTerm.length) {
          setTypewriterText(currentTerm.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setTypewriterText(currentTerm.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentTermIndex((currentTermIndex + 1) % searchTerms.length);
        }
      }
    }, isDeleting ? 80 : 150);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentTermIndex]);
 
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!user && !isLoading) {
      openSignInModal();
    } else if (user) {
      setProfileDropdownOpen(!profileDropdownOpen);
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
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-300 text-black py-3 overflow-hidden">
        <div className="flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-base font-semibold inline-block">
              10% OFF on orders above ₹3000 | Use code: PMOFF10 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Free shipping on orders above ₹999 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; New Arrivals Every Week! &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Exclusive Combo Deals Available &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Special Baby Care Bundles &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; 10% OFF on orders above ₹3000 | Use code: PMOFF10 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Free shipping on orders above ₹999 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; New Arrivals Every Week! &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Exclusive Combo Deals Available &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Special Baby Care Bundles &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; 10% OFF on orders above ₹3000 | Use code: PMOFF10 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Free shipping on orders above ₹999 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; New Arrivals Every Week! &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Exclusive Combo Deals Available &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Special Baby Care Bundles &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; 10% OFF on orders above ₹3000 | Use code: PMOFF10 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Free shipping on orders above ₹999 &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; New Arrivals Every Week! &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Exclusive Combo Deals Available &nbsp;&nbsp;&nbsp;&nbsp; ✦ &nbsp;&nbsp;&nbsp;&nbsp; Special Baby Care Bundles
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 90s linear infinite;
        }
      `}</style>

      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800",
          isScrolled
            ? "shadow-lg py-3 top-10"
            : "shadow-md py-5 top-10"
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded-full transition-colors mr-4"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center justify-start hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img
                src="/Planet-mini-logo.png"
                alt="Planet Mini Logo"
                className="h-12 lg:h-14 w-auto object-contain block"
                draggable={false}
                onError={(e) => {
                  // Fallback to original logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-secondary to-primary flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform flex-shrink-0" style={{display: 'none'}}>
                <span className="text-sm font-bold">PM</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2 flex-1 ml-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-semibold transition-all duration-300 ease-in-out relative px-5 py-2 rounded-md whitespace-nowrap",
                    "hover:bg-gray-200 hover:text-black",
                    location === link.href
                      ? "text-black bg-gray-200"
                      : "text-gray-600"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <div className="relative hidden sm:block" ref={searchDropdownRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={typewriterText ? `Search for ${typewriterText}...` : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchDropdownOpen(true)}
                  className="pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:shadow-lg shadow-md w-64 lg:w-80 transition-all placeholder:text-gray-500"
                />
                
                {/* Search Dropdown */}
                {searchDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#9CA3AF #F3F4F6'
                    }}
                  >
                    <style>{`
                      [style*="scrollbar-width"]::-webkit-scrollbar {
                        width: 6px;
                      }
                      [style*="scrollbar-width"]::-webkit-scrollbar-track {
                        background: #F3F4F6;
                        border-radius: 3px;
                      }
                      [style*="scrollbar-width"]::-webkit-scrollbar-thumb {
                        background: #9CA3AF;
                        border-radius: 3px;
                      }
                      [style*="scrollbar-width"]::-webkit-scrollbar-thumb:hover {
                        background: #6B7280;
                      }
                    `}</style>
                    <div className="p-3">
                      {searchQuery.trim() && searchResults.length > 0 ? (
                        <>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Results</p>
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                setSearchDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                            >
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-10 h-10 rounded-md object-cover mr-3"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">₹{product.price}</p>
                              </div>
                            </Link>
                          ))}
                        </>
                      ) : searchQuery.trim() ? (
                        <p className="text-sm text-gray-500 text-center py-4">No products found</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended</p>
                          {recommendedProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={() => setSearchDropdownOpen(false)}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Mobile Search Button */}
              <button 
                className="lg:hidden p-2 text-black hover:bg-gray-200 rounded-full transition-all duration-300"
                onClick={() => setSearchDropdownOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="group p-2 text-black hover:bg-gray-200 rounded-full transition-all duration-300 transform hover:scale-110 hidden lg:block">
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
              <Link
                href="/cart"
                className="p-2 text-muted-foreground hover:bg-gray-200 rounded-full transition-all relative"
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="hidden sm:flex p-2 text-muted-foreground hover:bg-gray-200 rounded-full transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                  ) : user ? (
                    user.image ? (
                      <img src={user.image} alt="Avatar" className="w-5 h-5 rounded-full" draggable={false} />
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
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                      {user.image ? (
                        <img src={user.image} alt="Avatar" className="w-10 h-10 rounded-full object-cover" draggable={false} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{user.name || 'Planet'}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-5 h-5 text-red-500" />
                          <span className="text-gray-700">My Profile</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <OrdersIcon className="w-5 h-5 text-red-500" />
                          <span className="text-gray-700">My Orders</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>

                      <div className="h-px bg-gray-100 my-2" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
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
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-xs sm:max-w-sm bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/Planet-mini-logo.png"
                    alt="Planet Mini Logo"
                    className="h-10 w-auto object-contain"
                    draggable={false}
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-gray-100 rounded-full text-gray-600 hover:text-black hover:bg-gray-200 transition-all duration-300 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-base sm:text-lg font-semibold transition-all duration-300 relative py-4 px-4 sm:px-5 rounded-xl flex items-center gap-3",
                        "hover:bg-gray-100 hover:text-black active:bg-gray-200",
                        location === link.href 
                          ? "text-black bg-gray-100"
                          : "text-gray-700"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="h-px bg-gray-200 my-4" />
                <Link
                  href="/likes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base sm:text-lg font-semibold transition-all duration-300 relative py-4 px-4 sm:px-5 rounded-xl flex items-center gap-3",
                    "hover:bg-gray-100 hover:text-black active:bg-gray-200",
                    location === '/likes'
                      ? "text-black bg-gray-100"
                      : "text-gray-700"
                  )}
                >
                  <Heart className={`w-5 h-5 ${location === '/likes' ? 'fill-current' : ''}`} />
                  <span>Liked Products</span>
                  {likedProducts.length > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-secondary/80 to-primary text-white rounded-full text-xs font-bold px-2.5 py-1">
                      {likedProducts.length > 9 ? '9+' : likedProducts.length}
                    </span>
                  )}
                </Link>
                <div className="h-px bg-gray-200 my-4" />
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base sm:text-lg font-semibold transition-all duration-300 relative py-4 px-4 sm:px-5 rounded-xl flex items-center gap-3",
                    "hover:bg-gray-100 hover:text-black active:bg-gray-200",
                    location === '/profile'
                      ? "text-black bg-gray-100"
                      : "text-gray-700"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                  ) : user ? (
                    user.image ? (
                      <img src={user.image} alt="Avatar" className="w-6 h-6 rounded-full" draggable={false} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm sm:text-base font-medium">
                    {isLoading ? '' : user ? user.name || 'Profile' : 'Profile'}
                  </span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base sm:text-lg font-semibold transition-all duration-300 relative py-4 px-4 sm:px-5 rounded-xl flex items-center gap-3",
                    "hover:bg-gray-100 hover:text-black active:bg-gray-200",
                    location === '/orders'
                      ? "text-black bg-gray-100"
                      : "text-gray-700"
                  )}
                >
                  <OrdersIcon className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
              </nav>

              {/* Quick Actions Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 space-y-3">
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 sm:px-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 active:bg-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <span className="text-base sm:text-lg font-semibold text-gray-700">Cart</span>
                  </div>
                  {state.totalItems > 0 && (
                    <span className="bg-black text-white rounded-full text-xs font-bold px-2.5 py-1">
                      {state.totalItems > 99 ? '99+' : state.totalItems}
                    </span>
                  )}
                </Link>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 py-3 px-4 sm:px-5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 active:bg-red-100"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base sm:text-lg font-semibold">Sign Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchDropdownOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSearchDropdownOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-10 left-0 right-0 z-50 bg-white shadow-2xl p-4 lg:hidden"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={typewriterText ? `Search for ${typewriterText}...` : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-500"
                  autoFocus
                />
                <button
                  onClick={() => setSearchDropdownOpen(false)}
                  className="p-2 text-gray-600 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 max-h-80 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended</p>
                {recommendedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setSearchDropdownOpen(false)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Google Auth Modal */}
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} initialMode={authMode} />
    </>
  );
}
