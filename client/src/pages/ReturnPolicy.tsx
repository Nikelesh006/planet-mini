import { motion } from "framer-motion";
import { useEffect } from "react";
import { Package, ShieldCheck, AlertCircle, Video, RefreshCw, Mail, Phone, Heart } from "lucide-react";

export default function ReturnPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12 relative"
          {...fadeIn}
        >
          <div className="flex justify-center mb-4">
             <img 
                src="/Planet-mini-logo.png" 
                alt="Planet Mini Logo" 
                className="h-16 w-auto object-contain"
              />
          </div>
          <p className="text-[#FF7B9C] font-medium tracking-wide mb-2 uppercase text-sm">Premium Baby & Kids Wear</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1D3557] mb-4">Refund & Return Policy</h1>
          <p className="text-[#4A5568] text-lg">Your trust means everything to us.</p>
          <p className="text-[#4A5568] text-lg flex items-center justify-center gap-2">
            Please read our policy carefully. <Heart className="w-5 h-5 text-[#FF7B9C] fill-[#FF7B9C]" />
          </p>
          
          {/* Baby Image Placeholder (Stylized like the original) */}
          <div className="absolute -top-10 -right-4 hidden lg:block w-48 h-48 opacity-20 pointer-events-none">
             {/* You could add an image here if available, using an icon for now */}
             <Heart className="w-full h-full text-[#FF7B9C]" />
          </div>
        </motion.div>

        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-[#FFF1F1] p-6 rounded-2xl border border-[#FFE4E4]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFDADA] rounded-full flex items-center justify-center text-[#E63946]">
                <span className="text-xl font-bold">₹</span>
              </div>
              <h3 className="font-bold text-[#E63946] text-lg">No Refunds</h3>
            </div>
            <p className="text-[#555] text-sm leading-relaxed">
              As a small business, we do not offer refunds on purchases. This policy helps us maintain competitive pricing while continuing to deliver premium-quality baby and kids wear.
            </p>
          </motion.div>

          <motion.div 
            className="bg-[#F1F9F1] p-6 rounded-2xl border border-[#E4F4E4]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#DDF1DD] rounded-full flex items-center justify-center text-[#2D6A4F]">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#2D6A4F] text-lg">No Returns</h3>
            </div>
            <p className="text-[#555] text-sm leading-relaxed">
              We do not accept returns once products are sold. However, exchanges or replacements may be provided under specific conditions.
            </p>
          </motion.div>

          <motion.div 
            className="bg-[#FFF9F1] p-6 rounded-2xl border border-[#FEF2E4]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FEEBC8] rounded-full flex items-center justify-center text-[#D97706]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#D97706] text-lg">Exceptions</h3>
            </div>
            <p className="text-[#555] text-sm leading-relaxed">
              If you receive an incorrect, damaged, or defective item due to our error, we will gladly arrange a replacement at no additional cost. Please contact us within <span className="text-[#E63946] font-bold">2 days</span> of receiving your order to report the issue.
            </p>
          </motion.div>
        </div>

        {/* Unboxing Video Section */}
        <motion.div 
          className="bg-[#EEF4FB] p-8 rounded-3xl border border-[#DCE8F6] mb-8"
          {...fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-24 h-24 flex-shrink-0">
               <div className="w-full h-full relative">
                  <Package className="w-full h-full text-[#3182CE]" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#E63946] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                  </div>
               </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Important: Unboxing Video Requirement</h2>
              <p className="text-[#4A5568] mb-6">
                To ensure a smooth replacement process and protect against fraudulent claims, we require a continuous, uninterrupted unboxing video for all requests related to:
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E2E8F0]">
                  <AlertCircle className="w-5 h-5 text-[#3182CE]" />
                  <span className="text-sm font-medium text-[#4A5568]">Damaged products</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E2E8F0]">
                  <Package className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-sm font-medium text-[#4A5568]">Missing items</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E2E8F0]">
                  <RefreshCw className="w-5 h-5 text-[#D97706]" />
                  <span className="text-sm font-medium text-[#4A5568]">Incorrect products received</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Guidelines */}
        <motion.div 
          className="bg-[#FFF5F5] p-8 rounded-3xl border border-[#FFEAEA] mb-8"
          {...fadeIn}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FFDADA] rounded-full flex items-center justify-center text-[#E63946]">
                  <Video className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-[#E63946]">Video Guidelines</h2>
              </div>
              <ul className="space-y-4">
                {[
                  "The video must clearly show the complete unboxing process from the sealed package to the product inside.",
                  "The package label and product should be clearly visible throughout the video.",
                  "The video should not be edited, paused, or cut at any point.",
                  "Replacement requests related to damage, missing items, or incorrect products cannot be processed without a valid unboxing video."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#E63946] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[#4A5568] text-sm leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-64 flex-shrink-0 flex items-center justify-center">
              <div className="relative p-2 bg-[#1A1A1A] rounded-xl shadow-xl w-full aspect-video md:aspect-square flex items-center justify-center">
                 <div className="w-full h-full border border-gray-700 rounded-lg overflow-hidden relative bg-[#333]">
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                       <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                       <span className="text-[10px] text-white font-mono uppercase">REC</span>
                    </div>
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                       <Package className="w-12 h-12 text-gray-400" />
                       <div className="w-16 h-1 bg-gray-600 rounded"></div>
                    </div>
                 </div>
                 {/* Tripod legs */}
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-6 flex justify-between px-4 pointer-events-none">
                    <div className="w-1 h-8 bg-[#444] rotate-[20deg] origin-top"></div>
                    <div className="w-1 h-8 bg-[#444] -rotate-[20deg] origin-top"></div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exchange Policy */}
        <motion.div 
          className="bg-[#F2FAF2] p-8 rounded-3xl border border-[#E6F4E6] mb-12"
          {...fadeIn}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#DDF1DD] rounded-full flex items-center justify-center text-[#2D6A4F]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-[#2D6A4F]">Exchange Policy</h2>
              </div>
              <ul className="space-y-4">
                {[
                  "Exchanges are only applicable for damaged, defective, or incorrect items received.",
                  "Products must be unused, unwashed, and in their original packaging with tags intact.",
                  "Exchange requests must be raised within 2 days of delivery."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#2D6A4F] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[#4A5568] text-sm leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-64 flex-shrink-0">
               <div className="bg-white p-4 rounded-xl shadow-md border border-[#E6F4E6] flex flex-col items-center">
                  <div className="space-y-1 mb-4">
                    <div className="w-40 h-8 bg-[#E6F4E6] rounded"></div>
                    <div className="w-40 h-8 bg-[#DDF1DD] rounded"></div>
                    <div className="w-40 h-8 bg-[#E6F4E6] rounded"></div>
                  </div>
                  <div className="w-full border-t border-dashed border-gray-300 pt-3 flex flex-col items-center">
                    <div className="bg-[#FFF5F5] px-4 py-1 rounded text-[10px] font-bold text-[#E63946] mb-1">Planet Mini</div>
                    <Heart className="w-3 h-3 text-[#E63946] fill-[#E63946]" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          className="text-center bg-white/50 p-8 rounded-3xl border border-[#E2E8F0]"
          {...fadeIn}
          transition={{ delay: 0.7 }}
        >
          <p className="text-[#4A5568] mb-6 font-medium">For any questions or assistance regarding our policy, please contact us at:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <a href="mailto:tricirclegroup@gmail.com" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#FFDADA] rounded-full flex items-center justify-center text-[#E63946] group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-[#1D3557] font-bold group-hover:text-[#E63946] transition-colors">tricirclegroup@gmail.com</span>
            </a>
            <div className="hidden md:block w-px h-12 bg-gray-200"></div>
            <a href="tel:123456789" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#DDF1DD] rounded-full flex items-center justify-center text-[#2D6A4F] group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-[#1D3557] font-bold group-hover:text-[#2D6A4F] transition-colors">123456789</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
