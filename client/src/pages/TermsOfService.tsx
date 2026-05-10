import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, FileText, Scale, Lock, Clock, Info } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const sections = [
    {
      title: "1. Welcome to our Community",
      icon: Scale,
      content: "By joining the Planet Mini family and using our website, you're agreeing to these friendly guidelines. We've kept them simple so we can all enjoy a safe and happy shopping experience together. These terms help us maintain the high quality of service you expect from us."
    },
    {
      title: "2. Using our Website",
      icon: FileText,
      content: "We're happy to share our materials with you for your personal use while you shop for your little ones. We just ask that you use them as intended—for browsing and ordering—and avoid copying or using them for other commercial purposes so we can keep our content unique and special."
    },
    {
      title: "3. Our Products & Pricing",
      icon: Info,
      content: "We take great care in selecting our products. While we try our best to keep everything in stock and prices steady, sometimes changes happen. If a product becomes unavailable or a price needs adjustment, we'll always aim to provide the best possible alternatives or updates."
    },
    {
      title: "4. Your Planet Mini Account",
      icon: Lock,
      content: "Creating an account helps us personalize your experience. We simply ask that you keep your information updated so your orders reach you safely. Your account security is a team effort—while we protect our systems, we appreciate you keeping your password private too."
    },
    {
      title: "5. Delivering Joy (Shipping)",
      icon: Clock,
      content: "We know you're excited to receive your items! We usually get orders moving within 3-7 business days. For more details on delivery and how we handle returns with care, please visit our FAQ section. We're here to make sure every delivery brings a smile."
    },
    {
      title: "6. Staying in Touch",
      icon: Shield,
      content: "As we grow and improve, we might occasionally update these guidelines. We'll always keep the latest version right here for you to see. These terms follow the local guidelines of India to ensure a fair and transparent relationship with all our wonderful customers."
    }
  ];

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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1D3557] mb-4">Terms of Service</h1>
          <p className="text-[#4A5568] text-lg">Please read these terms carefully before using Planet Mini.</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-[#FEE2E2] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-[#EF4444]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1D3557] mb-4">{section.title}</h2>
                  <p className="text-[#4A5568] text-lg leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div 
          className="mt-12 text-center bg-white/50 p-8 rounded-3xl border border-[#E2E8F0]"
          {...fadeIn}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[#4A5568] mb-6 font-medium">Questions about our Terms?</p>
          <p className="text-[#4A5568] mb-8">If you have any questions regarding these Terms of Service, please contact our support team.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#FEE2E2] text-[#EF4444] px-8 py-4 rounded-2xl font-semibold hover:bg-[#FECACA] transition-all duration-300 transform hover:scale-105"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

