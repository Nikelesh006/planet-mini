import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeMessage from "./WelcomeMessage";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, showWelcomeMessage, dismissWelcomeMessage } = useAuth();

  // Only show welcome message on home screen
  const shouldShowWelcome = showWelcomeMessage && user?.name && location === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
            stagger: 0
          }}
          className="flex-1 pt-24 pb-12"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Footer Banners with Shop Now Button - Only on Home Page */}
      {location === "/" && (
        <section className="w-full relative">
          <img
            src="/footer-banner2.png"
            alt="Footer Banner 2"
            className="w-full h-auto object-cover"
            draggable={false}
          />
          <img
            src="/footer-banner.png"
            alt="Footer Banner"
            className="w-full h-auto object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link
              href="/shop/style"
              className="pointer-events-auto group bg-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Shop Now
              <svg className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      <Footer />
      
      {/* Welcome Message - Only on Home Screen */}
      {shouldShowWelcome && (
        <WelcomeMessage 
          userName={user.name || 'User'} 
          onClose={dismissWelcomeMessage} 
        />
      )}
    </div>
  );
}
