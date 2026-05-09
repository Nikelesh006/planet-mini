import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Lock, Eye, Bell, Database, UserCheck, Clock } from "lucide-react";

export default function PrivacyPolicy() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Our Commitment to You",
      icon: Eye,
      content: "Welcome to Planet Mini! We're honored that you've chosen us for your little one's needs. We value the trust you place in us and are dedicated to keeping your information safe and sound. This policy explains how we look after your details with the same care we put into our products."
    },
    {
      title: "2. The Details We Collect",
      icon: Database,
      content: "To help your orders reach you smoothly, we collect a few essential details like your name, delivery address, and contact info. For payments, we use trusted partners who handle your financial data with top-tier security, so we never see or store your full card details ourselves."
    },
    {
      title: "3. Making Your Experience Better",
      icon: UserCheck,
      content: "We use your information to make shopping easier—processing your orders, keeping you updated on your delivery, and occasionally sharing special offers we think you'll love. Our goal is to provide a seamless and joyful experience every time you visit."
    },
    {
      title: "4. Keeping Your Data Safe",
      icon: Shield,
      content: "We've built strong digital walls to protect your information. Only the team members who absolutely need to see your details to help with your order can access them. We're constantly updating our security to stay ahead of the curve and keep your data private."
    },
    {
      title: "5. You're in Control",
      icon: Lock,
      content: "It's your data, and we respect that. You can update your information anytime through your account settings. If you ever want to see what data we have or have questions about how it's used, just reach out—we're happy to help you manage your privacy."
    },
    {
      title: "6. Always Improving",
      icon: Bell,
      content: "As we find even better ways to serve you, we might update this policy. We'll always post the newest version here and keep you informed. We're committed to being transparent about how we protect your family's information as we grow together."
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
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Your privacy is our priority. Learn how we protect your information.
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
          <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">Privacy Concerns?</h3>
          <p className="text-gray-700 mb-8">
            If you have any questions about this privacy policy or our privacy practices, please contact us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-8 py-4 rounded-2xl font-semibold hover:bg-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-black"
          >
            Contact Privacy Team
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
