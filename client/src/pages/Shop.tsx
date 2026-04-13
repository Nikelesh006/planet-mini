import { motion } from "framer-motion";
import { Link } from "wouter";

interface ShopItem {
  name: string;
  icon: string;
  count: number;
  href: string;
  badge?: string;
}

interface ShopCategory {
  title: string;
  items: ShopItem[];
}

export default function Shop() {
  const categories: ShopCategory[] = [
    {
      title: "Shop by Style",
      items: [
        { name: "Rompers", icon: "�", count: 24, href: "/shop/style?val=rompers" },
        { name: "Overalls", icon: "👕", count: 18, href: "/shop/style?val=overalls" },
        { name: "Onesies", icon: "�", count: 32, href: "/shop/style?val=onesies" },
        { name: "Sleepwear", icon: "�", count: 28, href: "/shop/style?val=sleepwear" }
      ]
    },
    {
      title: "Home Sections",
      items: [
        { name: "Hero Section", icon: "🏠", count: 8, href: "/?section=hero" },
        { name: "Shop by Style", icon: "🎀", count: 12, href: "/?section=shop-style" },
        { name: "Shop by Age", icon: "�", count: 15, href: "/?section=shop-age" },
        { name: "Baby Care Essentials", icon: "🍼", count: 10, href: "/?section=baby-care" },
        { name: "Super Saver Offers", icon: "�", count: 6, href: "/?section=super-saver" }
      ]
    }
  ];

  return (
    <motion.div
      key="shop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            Shop All Categories
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Everything you need for your little one, all in one place
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid gap-12">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="flex items-center justify-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                  {category.title === "Super Saver Offers" && <span className="text-4xl">🎁</span>}
                  {category.title !== "Super Saver Offers" && <span className="text-4xl">✨</span>}
                  {category.title}
                  {category.title === "Super Saver Offers" && <span className="text-4xl">🎁</span>}
                  {category.title !== "Super Saver Offers" && <span className="text-4xl">✨</span>}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                    className="group h-[380px]"
                  >
                    <Link href={item.href} className="block">
                      <div className="border border-gray-200 hover:border-primary/30 transition-all duration-300 p-6 text-center h-full flex flex-col justify-between hover:scale-105">
                        {item.badge && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-800 to-pink-900 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            {item.badge}
                          </div>
                        )}
                        <div className="text-4xl mb-4 flex items-center justify-center h-20">
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{item.count} products</p>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-pink-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:from-blue-800 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Shop Now
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="p-8 lg:p-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary mb-8 text-center"
          >
            Quick Links
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/about" className="group">
              <div className="text-center p-6 group-hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-3">🏪</div>
                <h4 className="font-semibold text-primary">About Us</h4>
              </div>
            </Link>
            <Link href="/contact" className="group">
              <div className="text-center p-6 group-hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-3">📞</div>
                <h4 className="font-semibold text-primary">Contact</h4>
              </div>
            </Link>
            <Link href="/know-us" className="group">
              <div className="text-center p-6 group-hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-3">💡</div>
                <h4 className="font-semibold text-primary">Know Us</h4>
              </div>
            </Link>
            <Link href="/" className="group">
              <div className="text-center p-6 group-hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-3">🏠</div>
                <h4 className="font-semibold text-primary">Home</h4>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
