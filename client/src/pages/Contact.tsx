import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Building, Home, Truck, ChevronDown, ChevronUp, HelpCircle, Package, Shield, CreditCard, RefreshCw, Globe, Heart, ShoppingBag } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: any;
}

export default function Contact() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      question: "How can I track my order?",
      answer: "You can track your order using the tracking link shared via email/SMS once your order is shipped.",
      category: "products",
      icon: Package
    },
    {
      question: "How can I cancel my order?",
      answer: "Yes, changes can be requested before the order is shipped. Please contact our customer support team as soon as possible.",
      category: "products",
      icon: Package
    },
    {
      question: "What if the product I ordered is out of stock?",
      answer: "In rare cases of stock unavailability, our team will contact you and process a refund or replacement based on your preference.",
      category: "products",
      icon: Package
    },
    {
      question: "What payment methods do you accept?",
      answer: " Debit Cards ,Credit Cards , UPI payments , Net Banking , Wallet Payments",
      category: "payment",
      icon: CreditCard
    },
    {
      question: "Do I have to pay shipping charges?",
      answer: "Shipping charges may vary based on order value and delivery location. Free shipping may be available on eligible orders.",
      category: "shipping",
      icon: RefreshCw
    },
    {
      question: "By when will I receive my order?",
      answer: "Orders are typically delivered within 3-7 business days, depending on your location.",
      category: "shipping",
      icon: RefreshCw
    },
    {
      question: "What if I receive a damaged item?",
      answer: "Please contact us within 48 hours of delivery with product images, and our support team will assist you with a replacement or resolution.",
      category: "returns",
      icon: RefreshCw
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship within India. International shipping may be introduced in the future.",
      category: "shipping",
      icon: RefreshCw
    },
    {
      question: "What happens if I am unavailable during delivery?",
      answer: "Our delivery partner will usually attempt re-delivery or contact you for further assistance.",
      category: "shipping",
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
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 sm:py-16 md:py-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            We're here to help! Get in touch with our team for any questions or support.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-0 sm:py-16">
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
                <div className="group bg-white rounded-2xl p-4 sm:p-6 border-2 border-black hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-5 h-5 sm:w-7 sm:h-7 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-black mb-1 group-hover:text-red-600 transition-colors">Email</h3>
                      <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">hello@planetmini.com</p>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        We respond within 24 hours
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-4 sm:p-6 border-2 border-black hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-5 h-5 sm:w-7 sm:h-7 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-black mb-1 group-hover:text-red-600 transition-colors">Phone</h3>
                      <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">+1 (555) 123-4567</p>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Mon-Fri: 9AM-6PM EST
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-4 sm:p-6 border-2 border-black hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-black mb-1 group-hover:text-red-600 transition-colors">Address</h3>
                      <p className="text-sm sm:text-base text-gray-700 font-medium">123 Baby Street</p>
                      <p className="text-sm sm:text-base text-gray-700 font-medium">New York, NY 10001</p>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-4 sm:p-6 border-2 border-black hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-black mb-1 group-hover:text-red-600 transition-colors">Business Hours</h3>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Mon-Fri</span>
                          9AM - 6PM
                        </p>
                        <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Saturday</span>
                          10AM - 4PM
                        </p>
                        <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
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
            <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-black shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                  Get in Touch
                </h2>
                <p className="text-sm sm:text-base text-gray-600">We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                      Your Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
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
                        className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-black focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-black focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-700 placeholder-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                    Subject *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HelpCircle className="w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-black focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-700 placeholder-gray-400 shadow-md hover:shadow-lg"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors">
                    Message *
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <MessageCircle className="w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-black focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-700 resize-none placeholder-gray-400 shadow-md hover:shadow-lg"
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
                    className="group relative inline-flex items-center gap-2 bg-red-100 text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 border-black"
                  >
                    <div className="absolute inset-0 bg-red-200 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <Send className="w-4 h-4 relative z-10 text-red-600 group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="relative z-10 text-red-600">Send Message</span>
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
              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-black">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black">
                    Categories
                  </h2>
                </div>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`group w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
                        activeCategory === category.id
                          ? "bg-red-100 text-red-600 shadow-lg border-2 border-black"
                          : "bg-white hover:bg-red-50 text-gray-700 hover:shadow-md border-2 border-black hover:border-gray-700"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeCategory === category.id
                          ? "bg-white/20"
                          : "bg-red-100 group-hover:bg-red-200"
                      }`}>
                        <category.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                          activeCategory === category.id ? "text-red-600" : "text-red-500 group-hover:text-red-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${
                          activeCategory === category.id ? "text-red-600" : "text-gray-900 group-hover:text-red-600"
                        }`}>
                          {category.name}
                        </div>
                        <div className={`text-xs ${
                          activeCategory === category.id ? "text-red-600/80" : "text-gray-500"
                        }`}>
                          {category.count} questions
                        </div>
                      </div>
                      {activeCategory === category.id && (
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
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
                        ? "bg-red-50 border-black"
                        : "bg-white border-black hover:border-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between transition-all duration-300 group-hover:bg-red-50"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          expandedItems.includes(index)
                            ? "bg-red-100"
                            : "bg-red-100 group-hover:bg-red-200"
                        }`}>
                          <faq.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                            expandedItems.includes(index) ? "text-red-600" : "text-red-500 group-hover:text-red-600"
                          }`} />
                        </div>
                        <h3 className={`font-bold text-base sm:text-lg pr-4 ${
                          expandedItems.includes(index)
                            ? "text-red-600"
                            : "text-gray-900 group-hover:text-red-600"
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        expandedItems.includes(index)
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 group-hover:bg-red-100 text-gray-400 group-hover:text-red-500"
                      }`}>
                        {expandedItems.includes(index) ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </button>
                    {expandedItems.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 sm:px-6 pb-4 sm:pb-5"
                      >
                        <div className="pl-12 sm:pl-16 text-gray-700 leading-relaxed bg-red-50 rounded-xl p-4 sm:p-6 border-2 border-black">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm sm:text-base text-gray-700">{faq.answer}</p>
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
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Still have questions? Our customer service team is here to help!
                </p>
                <a 
                  href="mailto:hello@planetmini.com" 
                  className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-red-200 transition-colors border-2 border-black"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Planet Mini Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-red-50 rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-red-200 shadow-xl"
        >
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
              Welcome to Planet Mini
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Your trusted destination for premium baby products and essentials
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">Premium Quality</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Carefully curated selection of baby products made from the safest, highest-quality materials for your little ones.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">Safety First</h3>
              <p className="text-sm sm:text-base text-gray-600">
                All our products meet strict safety standards and are tested to ensure they're perfect for your baby's development.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">Fast Delivery</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Quick and reliable delivery across the country, ensuring you get what you need when you need it most.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-white rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">Our Promise to Parents</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
              At Planet Mini, we understand that every parent wants the very best for their baby. That's why we've made it our mission to provide a carefully selected range of baby products that combine safety, comfort, and style. From organic cotton clothing to eco-friendly toys, every item in our collection is chosen with love and care. We work with trusted brands and innovative creators to bring you products that make parenting easier and more joyful.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                100% Safe Products
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Eco-Friendly Options
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 sm:px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Parent Approved
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Vendor Partnership Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-red-50 rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-red-200 shadow-xl"
        >
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
              Sell on Planet Mini
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Join our marketplace and reach thousands of parents looking for quality baby products
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-6">Why Partner With Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-black mb-1">Access to Targeted Audience</h4>
                    <p className="text-sm sm:text-base text-gray-600">Connect with thousands of parents actively seeking quality baby products</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-black mb-1">Easy Setup Process</h4>
                    <p className="text-sm sm:text-base text-gray-600">Simple onboarding with dedicated support to get your store running quickly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-black mb-1">Marketing Support</h4>
                    <p className="text-sm sm:text-base text-gray-600">Benefit from our marketing campaigns and brand reputation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-black mb-1">Secure Payments</h4>
                    <p className="text-sm sm:text-base text-gray-600">Reliable payment processing with timely payouts and transparent analytics</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black"
            >
              <h3 className="text-lg sm:text-xl font-bold text-black mb-6">Ready to Get Started?</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Brand Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="business@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Product Category *</label>
                  <select className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors">
                    <option value="">Select category</option>
                    <option value="clothing">Baby Clothing</option>
                    <option value="toys">Toys & Games</option>
                    <option value="feeding">Feeding & Nursing</option>
                    <option value="diapers">Diapers & Potty Training</option>
                    <option value="furniture">Baby Furniture</option>
                    <option value="health">Health & Safety</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tell us about your products</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                    placeholder="Brief description of your products and what makes them special..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-100 text-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-red-200 transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-black"
                >
                  Apply to Sell on Planet Mini
                </button>
              </form>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-black">
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">Join Our Growing Community</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                Become part of Planet Mini's trusted network of baby product vendors. Together, we're making parenting easier and more joyful for families everywhere.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">500+ Active Vendors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">10,000+ Products Listed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">98% Vendor Satisfaction</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
