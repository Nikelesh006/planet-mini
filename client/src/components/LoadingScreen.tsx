import { motion } from "framer-motion";
import { Package, Heart, ThumbsUp } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-xl bg-white/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center justify-center text-center"
      >
        {/* Animated Gift Box Container */}
        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10"
          >
            <Package className="w-24 h-24 text-red-500 stroke-[1.5]" />
            
            {/* Pop-out elements */}
            <motion.div
              animate={{
                y: [0, -60, -80],
                x: [0, -30, -40],
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, -15, -30],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
              className="absolute -top-4 -left-4"
            >
              <Heart className="w-10 h-10 text-red-400 fill-red-400" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, -55, -75],
                x: [0, 35, 45],
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 15, 30],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 1.2,
              }}
              className="absolute -top-2 -right-4"
            >
              <ThumbsUp className="w-10 h-10 text-blue-400 fill-blue-400" />
            </motion.div>

            {/* Extra heart for more activity */}
            <motion.div
              animate={{
                y: [0, -70, -90],
                x: [0, 5, 10],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.8,
              }}
              className="absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <Heart className="w-6 h-6 text-red-300 fill-red-300" />
            </motion.div>
          </motion.div>
          
          {/* Animated rings around the package */}
          <motion.div
            className="absolute inset-0 border-4 border-red-100 rounded-full"
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-red-50 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>

        {/* Text and Progress */}
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold text-black mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Welcome to Planet Mini
          </motion.h2>
          
          <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden border border-black/5">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 font-medium">Preparing small wonders...</p>
        </div>
      </motion.div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-red-100 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
              opacity: 0.3
            }}
            animate={{
              y: "-10%",
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}
