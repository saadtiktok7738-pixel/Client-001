import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import NotFound from "./components/layout/not-found.jsx";

import { AuthProvider } from "./components/contexts/AuthContext.jsx";
import { CartProvider } from "./components/contexts/CartContext.jsx";
import { DataProvider } from "./components/contexts/DataContext.jsx";

import Home from "./components/layout/Home.jsx";
import Catalog from "./components/layout/Catalog.jsx";
import Category from "./components/layout/Category.jsx";
import Search from "./components/layout/Search.jsx";
import ProductDetail from "./components/layout/ProductDetail.jsx";
import SignIn from "./components/layout/Signin.jsx";
import Profile from "./components/layout/Profile.jsx";
import Wishlist from "./components/layout/Wishlist.jsx";
import Checkout from "./components/layout/Checkout.jsx";
import ThankYou from "./components/layout/ThankYou.jsx";
import TrackOrder from "./components/layout/TrackOrder.jsx";
import Contact from "./components/layout/Contact.jsx";
import Privacy from "./components/layout/Privacy.jsx";
import Refund from "./components/layout/Refund.jsx";
import Terms from "./components/layout/Terms.jsx";

import AdminGuard from "./components/bonents/admin/AdminGuard.jsx";
import AdminLayout from "./components/bonents/admin/AdminLayout.jsx";
import AdminDashboard from "./components/layout/admin/Dashboard.jsx";
import AdminOrders from "./components/layout/admin/Orders.jsx";
import AdminBanners from "./components/layout/admin/Banners.jsx";
import AdminCategories from "./components/layout/admin/Categories.jsx";
import AdminProducts from "./components/layout/admin/Products.jsx";
import AdminProductForm from "./components/layout/admin/ProductForm.jsx";
import AdminUsers from "./components/layout/admin/Users.jsx";
import AdminShippingSettings from "./components/layout/admin/ShippingSettings.jsx";

import Loader from "./components/bonents/Loader.jsx";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return null;
}

function withAdmin(Component) {
  return () => (
    <AdminGuard>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </AdminGuard>
  );
}

function Router() {
  return (
     <>
      <ScrollToTop />
     <Switch>

      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/search" component={Search} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/signin" component={SignIn} />
      <Route path="/profile" component={Profile} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/thankyou" component={ThankYou} />
      <Route path="/track" component={TrackOrder} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refund" component={Refund} />
      <Route path="/terms" component={Terms} />

      {/* Admin */}
      <Route path="/admin" component={withAdmin(AdminDashboard)} />
      <Route path="/admin/orders" component={withAdmin(AdminOrders)} />
      <Route path="/admin/banners" component={withAdmin(AdminBanners)} />
      <Route path="/admin/categories" component={withAdmin(AdminCategories)} />
      <Route path="/admin/products" component={withAdmin(AdminProducts)} />
      <Route path="/admin/products/new" component={withAdmin(AdminProductForm)} />
      <Route path="/admin/products/:id" component={withAdmin(AdminProductForm)} />
      <Route path="/admin/users" component={withAdmin(AdminUsers)} />
      <Route path="/admin/shipping" component={withAdmin(AdminShippingSettings)} />

      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function InitialLoaderGate({ children }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showLoader && <Loader />}
      {children}
    </>
  );
}


function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <InitialLoaderGate>
                <Router />
              </InitialLoaderGate>
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </WouterRouter>
      <Toaster position="top-right" richColors closeButton expand visibleToasts={9} />
    </TooltipProvider>
  );
}

export default App;