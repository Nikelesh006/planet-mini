import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, User, X } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = useCart((state) => state.getTotolItems());
  const { user, isLoading } = useAuth();
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthModal();
 
  const handleProfileClick = () => {
    if (!user && !isLoading) {
      openAuthModal(); // Open Google login modal
    } else if (user) {
      window.location.href = '/profile'; // Navigate to profile when logged in
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop by Style", href: "/shop/style" },
    { label: "Shop by Age", href: "/shop/age" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"
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
              className="flex items-center gap-2 text-2xl font-display font-bold text-foreground hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-primary-foreground shadow-sm">
                PM
              </div>
              <span>Planet Mini</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-blue-500 relative group",
                    location === link.href ? "text-blue-500" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all">
                <Search className="w-5 h-5" />
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
                {cartItemsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-background"
                  >
                    {cartItemsCount}
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
                <span className="text-xl font-display font-bold">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-semibold py-3 px-4 rounded-xl transition-colors",
                      location === link.href ? "bg-blue-50 text-blue-500" : "text-muted-foreground hover:bg-muted"
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
                  className="text-lg font-semibold py-3 px-4 rounded-xl text-muted-foreground hover:bg-muted transition-colors flex items-center gap-3"
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
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}
