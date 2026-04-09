import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
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
      <AnimatePresence>
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
