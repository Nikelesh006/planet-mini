import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Shield, Truck, Award, Users, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div>
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-black mb-6"
            >
              About Planet Mini
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
            >
              We're dedicated to providing the softest, safest, and most adorable baby wear for your little ones.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2020, Planet Mini began with a simple mission: to create baby clothing that combines comfort, safety, and style. As parents ourselves, we understood the need for high-quality, gentle fabrics that keep babies comfortable while making parents feel confident.
            </p>
            <p className="text-gray-600 mb-6">
              Today, we're proud to serve families worldwide with our carefully curated collection of baby essentials, each piece designed with love and attention to detail.
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
            >
              Shop Our Collection
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
              <img 
                src="https://images.unsplash.com/photo-1541697960113-1ca22342bd6d?auto=format&fit=crop&q=80&w=600"
                alt="Baby clothing" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: "Made with Love",
              description: "Every piece is crafted with care and attention to detail"
            },
            {
              icon: Shield,
              title: "Safety First",
              description: "All materials are tested and certified for baby safety"
            },
            {
              icon: Truck,
              title: "Fast Delivery",
              description: "Quick and reliable shipping to your doorstep"
            },
            {
              icon: Award,
              title: "Quality Guaranteed",
              description: "Premium materials that stand the test of time"
            },
            {
              icon: Users,
              title: "Family Owned",
              description: "A small business with big dreams for your little ones"
            },
            {
              icon: Globe,
              title: "Eco-Friendly",
              description: "Sustainable practices for a better future"
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 text-center border-2 rounded-2xl transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 cursor-pointer ${
                index % 2 === 0
                  ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 hover:border-primary/50'
                  : 'bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30 hover:border-secondary/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                index % 2 === 0
                  ? 'bg-gradient-to-br from-primary to-secondary border-2 border-primary/30'
                  : 'bg-gradient-to-br from-secondary to-primary border-2 border-secondary/30'
              }`}>
                <value.icon className="w-8 h-8 text-black" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                index % 2 === 0
                  ? 'text-black hover:text-primary'
                  : 'text-black hover:text-secondary'
              }`}>{value.title}</h3>
              <p className="text-gray-600 transition-colors duration-300 hover:text-black">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "200+", label: "Products" },
              { number: "15+", label: "Countries" },
              { number: "4.9★", label: "Average Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl text-black font-bold mb-2">{stat.number}</div>
                <div className="text-black">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="p-8 lg:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Planet Mini Family
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover why thousands of parents trust us for their baby's essentials
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop"
              className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-black px-8 py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
            >
              Start Shopping
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
