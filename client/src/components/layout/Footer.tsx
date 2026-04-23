import { Link } from "wouter";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-red-50 dark:bg-red-50 mt-auto pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img 
                src="/Planet-mini-logo.png" 
                alt="Planet Mini Logo" 
                className="h-12 w-auto object-contain transform hover:scale-105 transition-transform"
                draggable={false}
                onError={(e) => {
                  // Fallback to original logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-sm transform hover:scale-105 transition-transform" style={{display: 'none'}}>
                <span className="text-sm font-bold">PM</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Crafting soft, sustainable, and adorable moments for your little ones.
              Welcome to the planet where every mini matters.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Shop</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/shop/age" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shop by Age</Link></li>
              <li><Link href="/shop/care" className="text-muted-foreground hover:text-primary transition-colors text-sm">Baby Care Essentials</Link></li>
              <li><Link href="/shop/new" className="text-muted-foreground hover:text-primary transition-colors text-sm">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4">Support</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQs</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-red-200 dark:border-red-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Planet Mini. All rights reserved.</p>
          <p className="text-muted-foreground text-sl">Powered by <a href="https://codecraftnet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Code Craft</a></p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
