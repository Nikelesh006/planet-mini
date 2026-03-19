import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Building, Home, Truck, ChevronDown, ChevronUp, HelpCircle, Package, Shield, CreditCard, RefreshCw, Globe } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: any;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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
    }
  ];

  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle, count: faqData.length },
    { id: "products", name: "Products", icon: Package, count: faqData.filter(item => item.category === "products").length },
    { id: "shipping", name: "Shipping", icon: Truck, count: faqData.filter(item => item.category === "shipping").length },
    { id: "payment", name: "Payment", icon: CreditCard, count: faqData.filter(item => item.category === "payment").length },
    { id: "returns", name: "Returns", icon: RefreshCw, count: faqData.filter(item => item.category === "returns").length }
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFAQs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? []  // Close if it's already open
        : [index]  // Open only this one, closing others
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-balck mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            We're here to help! Get in touch with our team for any questions or support.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div>
              <div className="text-center mb-8">
                
                
              </div>
              
              <div className="space-y-6">
                <div className="group bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/20 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">Email</h3>
                      <p className="text-gray-700 font-medium mb-1">hello@planetmini.com</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-r from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-secondary transition-colors">Phone</h3>
                      <p className="text-gray-700 font-medium mb-1">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Mon-Fri: 9AM-6PM EST
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/20 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">Address</h3>
                      <p className="text-gray-700 font-medium">123 Baby Street</p>
                      <p className="text-gray-700 font-medium">New York, NY 10001</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-r from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-secondary transition-colors">Business Hours</h3>
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Mon-Fri</span>
                          9AM - 6PM
                        </p>
                        <p className="text-gray-700 font-medium flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Saturday</span>
                          10AM - 4PM
                        </p>
                        <p className="text-gray-700 font-medium flex items-center gap-2">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Sunday</span>
                          Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-primary/15 to-secondary/15 rounded-3xl p-8 border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black mb-2">
                  Get in Touch
                </h2>
                <p className="text-gray-600">We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">
                      Your Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:border-secondary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 hover:border-primary/40 placeholder-gray-400 shadow-sm hover:shadow-md"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-secondary transition-colors">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary/50 rounded-2xl focus:border-secondary focus:border-primary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all duration-300 hover:border-secondary/60 placeholder-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">
                    Subject *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HelpCircle className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-primary/70 rounded-2xl focus:border-primary focus:border-secondary focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-300 hover:border-primary/80 placeholder-gray-400 shadow-md hover:shadow-lg"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-secondary transition-colors">
                    Message *
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <MessageCircle className="w-5 h-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-secondary/50 rounded-2xl focus:border-primary focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all duration-300 hover:border-primary/60 resize-none placeholder-gray-400 shadow-md hover:shadow-lg"
                      placeholder="Tell us more about your question or concern..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-gray-600">
                      Your information is secure and encrypted
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <Send className="w-4 h-4 relative z-10 text-black group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="relative z-10 text-black">Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-black">
                    Categories
                  </h2>
                </div>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`group w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
                        activeCategory === category.id
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                          : "bg-white/70 hover:bg-white text-gray-700 hover:shadow-md border border-gray-200"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeCategory === category.id
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20"
                      }`}>
                        <category.icon className={`w-6 h-6 transition-colors ${
                          activeCategory === category.id ? "text-white" : "text-primary group-hover:text-secondary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${
                          activeCategory === category.id ? "text-white" : "text-gray-900 group-hover:text-primary"
                        }`}>
                          {category.name}
                        </div>
                        <div className={`text-xs ${
                          activeCategory === category.id ? "text-white/80" : "text-gray-500"
                        }`}>
                          {category.count} questions
                        </div>
                      </div>
                      {activeCategory === category.id && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-black mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Find quick answers to common questions about our products and services.
                </p>
              </motion.div>

              <div className="space-y-6">
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      expandedItems.includes(index)
                        ? "bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/30"
                        : "bg-white border-gray-200 hover:border-primary/30"
                    }`}
                  >
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-primary/5 group-hover:to-secondary/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          expandedItems.includes(index)
                            ? "bg-gradient-to-br from-primary to-secondary"
                            : "bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20"
                        }`}>
                          <faq.icon className={`w-6 h-6 transition-colors ${
                            expandedItems.includes(index) ? "text-white" : "text-primary group-hover:text-secondary"
                          }`} />
                        </div>
                        <h3 className={`font-bold text-lg pr-4 ${
                          expandedItems.includes(index)
                            ? "text-primary"
                            : "text-gray-900 group-hover:text-primary"
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        expandedItems.includes(index)
                          ? "bg-gradient-to-br from-primary to-secondary text-white"
                          : "bg-gray-100 group-hover:bg-primary/10 text-gray-400 group-hover:text-primary"
                      }`}>
                        {expandedItems.includes(index) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                    {expandedItems.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-5"
                      >
                        <div className="pl-16 text-gray-700 leading-relaxed bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gradient-to-br from-primary to-secondary rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
              >
                <p className="text-gray-600 mb-4">
                  Still have questions? Our customer service team is here to help!
                </p>
                <a 
                  href="mailto:hello@planetmini.com" 
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
