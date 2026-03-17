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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
              
              {/* Cart Items List */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=100"
                      alt="Product" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Baby Onesie</h3>
                      <p className="text-sm text-gray-600">Size: 6-12 months | Color: Pink</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary">₹24.99</span>
                        <button className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button 
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() => updateQuantity(1, quantities[1] - 1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="number" 
                  value={quantities[1]} 
                  onChange={(e) => updateQuantity(1, parseInt(e.target.value) || 1)}
                  className="w-16 h-10 text-center border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  min="1"
                  max="99"
                />
                <button 
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() => updateQuantity(1, quantities[1] + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹74.97</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">₹5.00</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary">₹79.97</span>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center"
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
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Items (3)</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">$74.97</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary">$79.97</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link 
                  href="/shop"
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Continue Shopping
                </Link>
                <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-center">
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
