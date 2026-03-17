import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search as SearchIcon, X, Filter, Plus, ShoppingCart } from "lucide-react";

export default function Search() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                PM
              </div>
              <span>Planet Mini</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/search" className="text-primary font-semibold">
                Search
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-primary transition-colors">
                Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for baby clothes, accessories, and more..."
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  border: '1px solid rgb(209 213 219)',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem',
                  outline: 'none'
                }}
                autoFocus
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              All Products
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Onesies
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Sleepwear
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Ages 0-6m
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Under $25
            </button>
          </div>
        </motion.div>

        {/* Search Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group h-[380px] flex flex-col"
            >
              <div className="aspect-square relative flex items-center justify-center">
                <img 
                  src={`https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=300&h=300&random=${item}`}
                  alt="Product" 
                  className="object-contain w-full h-full max-w-full max-h-full transform transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -20%
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-gray-900 mb-2">Baby Onesie</h3>
                <p className="text-sm text-gray-600 mb-3">Soft and comfortable for everyday wear</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">$19.99</span>
                  <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}
