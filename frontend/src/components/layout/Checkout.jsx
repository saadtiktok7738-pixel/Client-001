import { useState, useEffect } from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { useShippingSettings } from "../hooks/useShippingSettings.js";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { useLocation } from "wouter";
import api from "../../services/api.js";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { products } = useData();
  const { shippingCost, settings: shippingSettings } = useShippingSettings();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) setLocation("/");
  }, [cart.length]);

  if (cart.length === 0) return null;

  const orderTotal = cartTotal + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!email.trim() || !name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const items = cart
        .map((c) => {
          const p = products.find((x) => x.id === c.productId);
          if (!p) return null;
          return {
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: c.quantity,
            image: p.images?.[0] ?? null,
            color: c.color ?? null,
          };
        })
        .filter(Boolean);

      if (items.length === 0) {
        toast.error("Your cart items could not be loaded. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      const safeShipping = Number(shippingCost) || 0;
      const safeTotal = cartTotal + safeShipping;

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        note: note.trim() || "",
        items,
        subtotal: cartTotal,
        shipping: safeShipping,
        total: safeTotal,
      };

      const res = await api.post("/orders", payload);
      const order = res.data;

      setLocation(`/thankyou?orderId=${order.shortId || order.id}`);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order creation error:", error);
      const serverMsg = error?.response?.data?.error;
      toast.error(serverMsg || "Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout | Bag Breez - Fast & Secure Order Placement</title>
        <meta name="description" content="Complete your order at Bag Breez. Secure checkout with COD available. Fast delivery across all cities in Pakistan." />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Checkout | Bag Breez" />
        <meta property="og:description" content="Complete your Bag Breez order securely. COD & fast delivery across Pakistan." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bag Breez" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Checkout | Bag Breez" />
        <meta name="twitter:description" content="Complete your Bag Breez order. COD & fast delivery across Pakistan." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-12 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Contact</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. you@example.com" data-testid="input-email" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-1 pt-2 border-t border-border">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name" data-testid="input-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 0300 1234567" data-testid="input-phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Enter your city"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Complete Address *</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="House, Street, Area" data-testid="input-address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Note (optional)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full border border-input bg-transparent px-3 py-2 text-sm" placeholder="Any special instructions..." data-testid="input-note" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <span className="font-bold block mb-2">Payment Method</span>
                <div className="flex items-center gap-2 text-sm">
                  <input type="radio" checked readOnly id="cod" />
                  <label htmlFor="cod">Cash on Delivery (COD)</label>
                </div>
              </div>
            </form>
          </div>

          <div className="w-full md:w-1/2">
            <div className="bg-muted/50 p-6 md:p-8 rounded-lg border">
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-2">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <span className="block font-medium line-clamp-1">{product.name}</span>
                          <span className="text-muted-foreground">Qty: {item.quantity}</span>
                          {item.color && <span className="text-muted-foreground block">Color: {item.color}</span>}
                        </div>
                      </div>
                      <span className="font-bold">Rs. {(product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingSettings.type === "free" ? (
                    <span className="text-accent font-bold">FREE</span>
                  ) : (
                    <span>Rs. {shippingCost.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-bold border-t border-border pt-4 mb-8">
                <span>Total</span>
                <span>Rs. {orderTotal.toLocaleString()}</span>
              </div>

              <Button type="submit" form="checkout-form" size="lg" className="w-full text-base md:text-lg h-11 md:h-14" disabled={isProcessing} data-testid="button-place-order">
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
