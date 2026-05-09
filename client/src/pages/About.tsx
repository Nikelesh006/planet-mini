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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
            >
              About Planet Mini
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto"
            >
              We're dedicated to providing the softest, safest, and most adorable baby wear for your little ones.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-0 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              At Planet Mini, we believe baby clothing should be created with the same love, care, and protection that parents give their little ones every single day. That’s why Planet Mini was thoughtfully built by people who understand what parents truly look for — softness for delicate skin, safety you can trust, comfort for every moment, and quality that lasts.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              From a baby’s first cuddle to their first tiny steps, we design every piece to make children feel cozy, happy, and free to move comfortably. Our collections are made for newborns, infants, toddlers, and growing kids using premium fabrics that are gentle, breathable, and perfect for everyday wear.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              At Planet Mini, safety always comes first. Our products are manufactured in OEKO-TEX® certified factories, and every fabric is carefully tested to ensure it is free from harmful substances and safe for sensitive baby skin. We pay close attention to every detail — from fabric selection and stitching to finishing and fit — because we know parents never compromise when it comes to their children.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Backed by the manufacturing expertise of Tricircle Group, Planet Mini combines trusted craftsmanship with modern quality standards to create baby and kids wear that parents can confidently choose. As parents ourselves, we understand that clothing is not just about style — it’s about comfort during naps, softness during cuddles, and protection throughout every precious moment of childhood.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Our vision is to build a trusted baby wear brand loved by families for its commitment to safety, premium quality, thoughtful design, and parent-inspired comfort. Every outfit we create carries warmth, care, and the belief that little ones deserve the very best from the very beginning.
            </p>
            <p className="text-xl font-bold  mb-8 italic">
              At Planet Mini, every tiny stitch is made with a parent’s heart.
            </p>
            <Link 
              href="/shop/style"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Shop Our Collection
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-100 to-gray-100">
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">Our Values</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
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
              className="p-6 text-center border-2 border-gray-300 bg-white rounded-2xl transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 cursor-pointer hover:border-gray-500"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 bg-gradient-to-br from-gray-500 to-gray-600 border-2 border-gray-300">
                <value.icon className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold mb-2 transition-colors duration-300 text-black hover:text-gray-700">{value.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 transition-colors duration-300 hover:text-black">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Planet Mini Family
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover why thousands of parents trust us for their baby's essentials
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop/style"
              className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
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
