import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Package, Truck, Shield, CreditCard, RefreshCw, User, MessageCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: any;
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      question: "What materials are used in your baby clothes?",
      answer: "We use only the softest, safest materials for your baby's delicate skin. Our clothes are made from 100% organic cotton, bamboo fabric, and other hypoallergenic materials that are free from harmful chemicals and dyes.",
      category: "products",
      icon: Package
    },
    {
      question: "How do I choose the right size for my baby?",
      answer: "We offer a comprehensive size guide on each product page. Our sizes are based on both age and weight ranges. If you're between sizes, we recommend sizing up for longer wear.",
      category: "products",
      icon: Package
    },
    {
      question: "What are your shipping options and costs?",
      answer: "We offer Standard Shipping (5-7 days), Express Shipping (2-3 days), and Next Day Delivery. Shipping costs vary by location. Free shipping is available on orders over $50. We also ship internationally to 15+ countries.",
      category: "shipping",
      icon: Truck
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Buy Now Pay Later options like Klarna. All transactions are secure and encrypted.",
      category: "payment",
      icon: CreditCard
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unused items in original packaging. Simply contact our customer service to initiate a return. Refunds are processed within 5-7 business days. Exchanges for different sizes are always free!",
      category: "returns",
      icon: RefreshCw
    },
    {
      question: "How can I contact customer service?",
      answer: "Our customer service team is available Monday-Friday 9AM-6PM EST. Reach us via email at hello@planetmini.com, phone at +1 (555) 123-4567, or through our live chat feature. We typically respond within 24 hours.",
      category: "support",
      icon: MessageCircle
    }
  ];

  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle, count: faqData.length },
    { id: "products", name: "Products", icon: Package, count: faqData.filter(item => item.category === "products").length },
    { id: "shipping", name: "Shipping", icon: Truck, count: faqData.filter(item => item.category === "shipping").length },
    { id: "payment", name: "Payment", icon: CreditCard, count: faqData.filter(item => item.category === "payment").length },
    { id: "returns", name: "Returns", icon: RefreshCw, count: faqData.filter(item => item.category === "returns").length },
    { id: "support", name: "Support", icon: MessageCircle, count: faqData.filter(item => item.category === "support").length }
  ];

  const filteredFAQs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-8 lg:p-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-primary mb-6"
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
            >
              Find answers to common questions about our products, shipping, and services.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeCategory === category.id
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className={`text-sm ${activeCategory === category.id ? "text-white/80" : "text-gray-500"}`}>
                        {category.count} questions
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <faq.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {categories.find(c => c.id === faq.category)?.name}
                      </span>
                      {expandedItems.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {expandedItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <div className="pl-14 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Still Need Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center"
            >
              <HelpCircle className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our friendly customer service team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Contact Support
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Live Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
