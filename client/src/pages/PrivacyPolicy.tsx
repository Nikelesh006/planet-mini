import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Lock, Eye, Bell, Database, UserCheck, Clock } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1D3557] mb-4">Privacy Policy</h1>
          <p className="text-[#4A5568] text-lg">Your privacy is our priority.</p>
          <p className="text-[#4A5568] text-lg">Learn how we protect your information.</p>
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
          transition={{ delay: 0.5 }}
        >
          <p className="text-[#4A5568] mb-6 font-medium">Privacy Concerns?</p>
          <p className="text-[#4A5568] mb-8">If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#FEE2E2] text-[#EF4444] px-8 py-4 rounded-2xl font-semibold hover:bg-[#FECACA] transition-all duration-300 transform hover:scale-105"
          >
            Contact Privacy Team
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

