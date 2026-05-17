import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Heart, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog.jsx";
import { Input } from "./input.jsx";
import { Button } from "./button.jsx";
import api from "../../services/api.js";
import { toast } from "sonner";

export const ProductCard = React.memo(function ProductCard({ product }) {
  const { toggleWishlist, wishlist, addToCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const isWished = wishlist.includes(product.id);

  const [buyOpen, setBuyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  const handleBuyNowDesktop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
    setLocation("/checkout");
  };

  const handleBuyNowMobile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBuyOpen(true);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const placeQuickOrder = async (e) => {
    e.preventDefault();

    if (!email.trim() || !name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        note: "",
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images?.[0] || null,
          color: null,
        }],
        subtotal: product.price,
        shipping: 0,
        total: product.price,
      };

      const res = await api.post("/orders", payload);
      const order = res.data;

      fetch(`${import.meta.env.BASE_URL || "/"}api/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order-placed", order }),
      }).catch(() => {});

      toast.success("Order placed successfully!");
      setBuyOpen(false);
      setEmail(user?.email || "");
      setName("");
      setPhone("");
      setAddress("");
      setCity("");
      setLocation("/thankyou");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white overflow-hidden">
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{product.discountPercent}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 z-10 p-1 transition-colors drop-shadow"
          aria-label="Toggle wishlist"
        >
          <Heart size={17} className={isWished ? "fill-accent text-accent" : "text-white"} />
        </button>

        <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="md:hidden absolute bottom-0 left-0 right-0 flex">
            <button onClick={handleAddToCart} className="flex-1 bg-foreground text-background py-2 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-foreground/90 transition-colors">
              <ShoppingCart size={11} />
              <span>Cart</span>
            </button>
            <button onClick={handleBuyNowMobile} className="flex-1 bg-accent text-accent-foreground py-2 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center hover:bg-accent/90 transition-colors">
              Buy Now
            </button>
          </div>

          <div className="hidden md:block absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAddToCart} className="w-full bg-foreground text-background py-2 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-1.5 hover:bg-foreground/85 transition-colors">
              <ShoppingCart size={14} /> Add to Cart
            </button>
          </div>
        </Link>

        <div className="px-1 pt-2 pb-1 flex flex-col leading-tight">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider truncate">{product.category}</span>
          <Link href={`/product/${product.id}`} className="font-medium text-xs sm:text-[13px] line-clamp-2 hover:text-accent transition-colors mt-0.5">
            {product.name}
          </Link>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-bold text-[13px] sm:text-sm text-foreground">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        <button onClick={handleBuyNowDesktop} className="sr-only" aria-hidden="true" tabIndex={-1}>Buy</button>
      </div>

      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase tracking-wide">Quick Order</DialogTitle>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {product.name} — Rs. {product.price.toLocaleString()}
            </p>
          </DialogHeader>
          <form onSubmit={placeQuickOrder} className="space-y-3 mt-2">
            <div>
              <label className="block text-xs font-medium mb-1">Email Address *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Full Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone Number *</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0300 1234567" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">City *</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Karachi" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Address *</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Street, Area" required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting ? "Placing order..." : "Place Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
});
