import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, FileText, Scale, Lock, Clock, Info } from "lucide-react";

export default function TermsOfService() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 sm:py-16 md:py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Please read these terms carefully before using Planet Mini.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium border-2 border-black"
          >
            <Clock className="w-4 h-4" />
            Last updated: May 2026
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <section.icon className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 group-hover:text-red-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-red-50 rounded-3xl p-8 border-2 border-black text-center"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">Questions about our Terms?</h3>
          <p className="text-gray-700 mb-8">
            If you have any questions regarding these Terms of Service, please contact our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-8 py-4 rounded-2xl font-semibold hover:bg-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-black"
          >
            Contact Support
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
