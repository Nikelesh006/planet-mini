import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ShopOffers() {
  const offers = [
    {
      name: "3-Pack Onesies",
      description: "Essential onesies pack for everyday comfort",
      icon: "👕",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400",
      originalPrice: 45.00,
      salePrice: 29.99,
      discount: "33% OFF",
      badge: null,
      savings: "Save $15"
    },
    {
      name: "3-Pack Jablas",
      description: "Traditional baby wear set",
      icon: "🧥",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=400",
      originalPrice: 55.00,
      salePrice: 39.99,
      discount: "27% OFF",
      badge: null,
      savings: "Save $15"
    },
    {
      name: "3-Pack Diapers",
      description: "Ultra-absorbent diapers for all-day protection",
      icon: "🚀",
      image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400",
      originalPrice: 35.00,
      salePrice: 19.99,
      discount: "43% OFF",
      badge: "BEST OFFER",
      savings: "Save $15"
    },
    {
      name: "5-Pack Nappies",
      description: "Soft and gentle nappies for sensitive skin",
      icon: "📦",
      image: "https://images.unsplash.com/photo-1541697960113-1ca22342bd6d?auto=format&fit=crop&q=80&w=400",
      originalPrice: 40.00,
      salePrice: 24.99,
      discount: "38% OFF",
      badge: null,
      savings: "Save $15"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-pink-100/70 via-blue-100/60 to-pink-100/50 backdrop-blur-md border border-white/20 shadow-xl">
          <div className="p-8 lg:p-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-primary mb-6 flex items-center justify-center gap-3"
            >
              <span className="text-4xl">🎁</span>
              Super Saver Offers
              <span className="text-4xl">🎁</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Amazing deals on baby essentials. Limited time offers!
            </motion.p>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all duration-300">
                {offer.badge && (
                  <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                    {offer.badge}
                  </div>
                )}
                <div className="aspect-[3/4]">
                  <img 
                    src={offer.image} 
                    alt={offer.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-3xl mb-2">{offer.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{offer.name}</h3>
                    <p className="text-sm text-white/90 mb-3">{offer.description}</p>
                    
                    {/* Pricing */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold">₹{offer.salePrice}</span>
                        <span className="text-sm line-through text-white/70">₹{offer.originalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          {offer.discount}
                        </span>
                        <span className="text-xs text-white/80">{offer.savings}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/shop/offers?val=${offer.name.toLowerCase().replace(' ', '-').replace('-pack', '-pack')}`}
                      className="w-full bg-white text-primary px-3 py-2 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors text-center block"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-red-100/50 to-pink-100/50 backdrop-blur-sm border border-white/20 p-8 lg:p-16">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-primary mb-4"
            >
              🎉 Limited Time Special Offer 🎉
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-6"
            >
              Use code <span className="font-bold text-primary">BABY2024</span> for an additional 10% off on all offers!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="text-sm text-muted-foreground">
                ⏰ Offer ends in: <span className="font-bold text-primary">3 days</span>
              </div>
              <div className="text-sm text-muted-foreground">
                🚚 Free shipping on orders over $50
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/20 backdrop-blur-sm border border-white/10 p-8 lg:p-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary mb-8 text-center"
          >
            Why Shop Our Offers?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-semibold text-primary mb-2">Best Prices</h4>
              <p className="text-sm text-muted-foreground">Unbeatable value for money</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏷️</div>
              <h4 className="font-semibold text-primary mb-2">Quality Guaranteed</h4>
              <p className="text-sm text-muted-foreground">Premium products at great prices</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h4 className="font-semibold text-primary mb-2">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">Quick shipping to your doorstep</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
