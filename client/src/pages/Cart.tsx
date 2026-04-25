import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({ 1: 1, 2: 1, 3: 1 });

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-3xl font-bold text-black mb-8">Shopping Cart</h2>
              
              {/* Cart Items List */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="group flex gap-4 p-6 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=100"
                      alt="Product" 
                      className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black group-hover:text-primary transition-colors">Baby Onesie</h3>
                      <p className="text-sm text-gray-600 mb-3">Size: 6-12 months | Color: Pink</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-black">₹24.99</span>
                        <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 mb-8">
                <button 
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-primary/10 transition-colors hover:border-primary"
                  onClick={() => updateQuantity(1, quantities[1] - 1)}
                >
                  <Minus className="w-5 h-5 text-black" />
                </button>
                <input 
                  type="number" 
                  value={quantities[1]} 
                  onChange={(e) => updateQuantity(1, parseInt(e.target.value) || 1)}
                  className="w-20 h-12 text-center border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-black font-semibold"
                  min="1"
                  max="99"
                />
                <button 
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-primary/10 transition-colors hover:border-primary"
                  onClick={() => updateQuantity(1, quantities[1] + 1)}
                >
                  <Plus className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* Cart Summary */}
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="flex justify-between mb-4 p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-bold text-black">₹74.97</span>
                </div>
                <div className="flex justify-between mb-4 p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium">Shipping</span>
                  <span className="font-bold text-black">₹5.00</span>
                </div>
                <div className="flex justify-between mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/30">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-primary">₹79.97</span>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-black mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Items (3)</span>
                  <span className="font-bold text-black">3</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-bold text-black">$74.97</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Shipping</span>
                  <span className="font-bold text-black">$5.00</span>
                </div>
                <div className="flex justify-between py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/30">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-primary">$79.97</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/shop/style"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-black py-3 rounded-xl hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center font-semibold"
                >
                  Continue Shopping
                </Link>
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-center font-medium shadow-lg">
                  Clear Cart
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
