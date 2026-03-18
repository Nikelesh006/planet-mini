import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LikeProvider } from "@/contexts/LikeContext";
import { useEffect } from "react";
import animations from "./utils/animations";
import "./styles/animations.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import AdminOrders from "./pages/AdminOrders";
import KnowUs from "./pages/KnowUs";
import Shop from "./pages/Shop";
import ShopStyle from "./pages/ShopStyle";
import ProductDetail from "./pages/ProductDetail";
import LikesPage from "./pages/LikesPage";
import MyOrders from "./pages/MyOrders";

import ShopCare from "./pages/ShopCare";
import ShopOffers from "./pages/ShopOffers";
import CartPage from "./pages/CartPage";
import AddAddressPage from "./pages/AddAddressPage";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import NotFound from "@/pages/not-found";
import { Layout } from "./components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/add-product" component={AddProduct} />
        <Route path="/admin/product-list" component={ProductList} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/account" component={Profile} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/orders" component={MyOrders} />
        <Route path="/know-us" component={KnowUs} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/style" component={ShopStyle} />

        <Route path="/shop/care" component={ShopCare} />
        <Route path="/shop/offers" component={ShopOffers} />
        <Route path="/cart" component={CartPage} />
        <Route path="/likes" component={LikesPage} />
        <Route path="/add-address" component={AddAddressPage} />
        <Route path="/search" component={Search} />
        <Route path="/products/:slug" component={ProductDetail} />
        <Route path="/privacy" component={Home} />
        <Route path="/terms" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    // Initialize animations when component mounts
    animations.init();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <LikeProvider>
              <Toaster />
              <Router />
            </LikeProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
