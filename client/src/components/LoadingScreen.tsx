import { motion } from "framer-motion";
import { Rocket, Star } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-lg border-white/50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-center"
      >
        {/* Premium but Baby-friendly Planet/Orbit Animation */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 mb-12 flex items-center justify-center">
          
          {/* Central Planet */}
          <motion.div 
            className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-full z-20 shadow-[0_0_40px_rgba(236,72,153,0.3)] overflow-hidden border border-black/5"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.05, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 2, times: [0, 0.7, 1], ease: "easeOut" }}
          >
            {/* Crater details for a cute planet look */}
            <div className="absolute top-4 right-5 w-4 h-4 bg-white/30 rounded-full" />
            <div className="absolute bottom-5 left-4 w-5 h-5 bg-white/30 rounded-full" />
            <div className="absolute top-10 left-6 w-3 h-3 bg-white/30 rounded-full" />
          </motion.div>

          {/* First orbit ring - Rocket */}
          <motion.div
            className="absolute inset-0 border border-gray-300/80 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ 
              scale: { duration: 1.5, ease: "easeOut" },
              opacity: { duration: 1.5, ease: "easeOut" },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" } 
            }}
          >
            {/* Orbiting Rocket */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 text-blue-500">
               <Rocket className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Second orbit ring - Stars */}
          <motion.div
            className="absolute inset-8 border border-gray-200/80 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: -360 }}
            transition={{ 
              scale: { duration: 1.5, delay: 0.2, ease: "easeOut" },
              opacity: { duration: 1.5, delay: 0.2, ease: "easeOut" },
              rotate: { duration: 15, repeat: Infinity, ease: "linear" } 
            }}
          >
             {/* Orbiting Star 1 */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-yellow-600">
               <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400/80" strokeWidth={1.5} />
             </div>
             {/* Orbiting Star 2 */}
             <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-yellow-500">
               <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-300/80" strokeWidth={1.5} />
             </div>
          </motion.div>
          
          {/* Soft central glow */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full blur-3xl z-0"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Elegant Typography */}
        <div className="text-center overflow-hidden flex flex-col items-center">
          <motion.h1
            className="text-base md:text-xl uppercase tracking-[0.4em] text-gray-800 font-medium mb-4 ml-[0.4em] drop-shadow-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            Planet Mini
          </motion.h1>
          
          {/* Very thin expanding line */}
          <motion.div 
            className="h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
            style={{ minWidth: "160px" }}
          />

          {/* Baby-friendly loading text */}
          <motion.p
            className="mt-4 text-xs md:text-sm text-gray-500 font-medium tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ 
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 } 
            }}
          >
            Loading content... gathering cute little things
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
