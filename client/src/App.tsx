import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/AdminDashboard";
import KnowUs from "./pages/KnowUs";
import Shop from "./pages/Shop";
import ShopStyle from "./pages/ShopStyle";
import ShopAge from "./pages/ShopAge";
import ShopCare from "./pages/ShopCare";
import ShopOffers from "./pages/ShopOffers";
import Cart from "./pages/Cart";
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
        <Route path="/account" component={Profile} />
        <Route path="/profile" component={Profile} />
        <Route path="/know-us" component={KnowUs} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/style" component={ShopStyle} />
        <Route path="/shop/age" component={ShopAge} />
        <Route path="/shop/care" component={ShopCare} />
        <Route path="/shop/offers" component={ShopOffers} />
        <Route path="/cart" component={Cart} />
        <Route path="/search" component={Search} />
        <Route path="/products/:slug" component={Home} />
        <Route path="/privacy" component={Home} />
        <Route path="/terms" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
