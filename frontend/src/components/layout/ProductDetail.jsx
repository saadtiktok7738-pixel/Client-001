import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useRoute, useLocation } from "wouter";
import { useData } from "../contexts/DataContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog.jsx";
import { Minus, Plus, ShoppingCart, Zap, Truck, Headphones, RefreshCcw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../../services/api.js";
import { Helmet } from "react-helmet-async";

const ALL_REVIEWS = [
  { name: "Ali", text: "Nice product, very satisfied!", stars: 5 },
  { name: "Ahmed", text: "Good quality and fast delivery.", stars: 5 },
  { name: "Sara", text: "Exactly as described. Highly recommend!", stars: 4 },
  { name: "Usman", text: "Great value for money.", stars: 5 },
  { name: "Fatima", text: "Love the quality! Will buy again.", stars: 5 },
  { name: "Bilal", text: "Fast shipping, product as shown.", stars: 4 },
  { name: "Maria", text: "Amazing quality, worth every penny.", stars: 5 },
  { name: "Hassan", text: "Good product, very happy with purchase.", stars: 4 },
  { name: "Zara", text: "Excellent! Better than I expected.", stars: 5 },
  { name: "Omar", text: "Highly recommended. Great quality.", stars: 5 },
  { name: "Sana", text: "Delivery was fast. Product is great.", stars: 5 },
  { name: "Tariq", text: "Genuine product. Will order again.", stars: 4 },
];

function getReviewsForProduct(productId) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) & 0x7fffffff;
  }
  const picked = [];
  const used = new Set();
  for (let i = 0; i < 4; i++) {
    let idx = (hash + i * 7) % ALL_REVIEWS.length;
    while (used.has(idx)) idx = (idx + 1) % ALL_REVIEWS.length;
    used.add(idx);
    picked.push(ALL_REVIEWS[idx]);
  }
  return picked;
}

function ProductDetailSkeleton() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="aspect-square bg-gray-200" />
            <div className="flex gap-2 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-200" />
              ))}
            </div>
          </div>
          <div>
            <div className="h-3 w-24 bg-gray-200 mb-3" />
            <div className="h-6 w-3/4 bg-gray-200 mb-4" />
            <div className="h-6 w-32 bg-gray-200 mb-6" />
            <div className="flex gap-6 mb-6">
              <div>
                <div className="h-3 w-16 bg-gray-200 mb-2" />
                <div className="flex">
                  <div className="w-10 h-10 bg-gray-200" />
                  <div className="w-10 h-10 bg-gray-200" />
                  <div className="w-10 h-10 bg-gray-200" />
                </div>
              </div>
              <div>
                <div className="h-3 w-20 bg-gray-200 mb-2" />
                <div className="flex gap-2">
                  <div className="w-14 h-7 bg-gray-200" />
                  <div className="w-14 h-7 bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mb-6">
              <div className="h-12 w-full bg-gray-200" />
              <div className="h-12 w-full bg-gray-200" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200" />
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="h-4 w-32 bg-gray-200 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-gray-200" />
                      <div className="h-3 w-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-8">
          <div className="h-5 w-48 bg-gray-200 mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200" />
            <div className="h-3 w-5/6 bg-gray-200" />
            <div className="h-3 w-4/6 bg-gray-200" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id;

  const { products } = useData();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const contextProduct = products.find((p) => p.id === id);
  const [localProduct, setLocalProduct] = useState(contextProduct || null);
  const [localLoading, setLocalLoading] = useState(!contextProduct);
  const directFetchedRef = useRef(false);

  useEffect(() => {
    directFetchedRef.current = false;
  }, [id]);

  useEffect(() => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setLocalProduct(found);
      setLocalLoading(false);
      return;
    }
    if (!id || directFetchedRef.current) return;
    directFetchedRef.current = true;
    setLocalLoading(true);
    api.get(`/products/${id}`)
      .then((res) => setLocalProduct(res.data))
      .catch(() => {})
      .finally(() => setLocalLoading(false));
  }, [id, products]);

  const product = localProduct;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyName, setBuyName] = useState("");
  const [buyPhone, setBuyPhone] = useState("");
  const [buyEmail, setBuyEmail] = useState("");
  const [buyAddress, setBuyAddress] = useState("");
  const [buyCity, setBuyCity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product?.colors?.[0]) setSelectedColor(product.colors[0]);
  }, [product?.id]);

  useEffect(() => {
    if (user?.email && !buyEmail) setBuyEmail(user.email);
  }, [user]);

  const stockQty = useMemo(() => product?.stock || 0, [product?.stock]);
  const inStock = useMemo(() => stockQty > 0, [stockQty]);
  const stockLabel = useMemo(() => {
    if (stockQty === 0) return "Out of stock";
    if (stockQty <= 5) return `Only ${stockQty} left`;
    return "Limited stock";
  }, [stockQty]);
  const reviews = useMemo(
    () => (product ? getReviewsForProduct(product.id) : []),
    [product?.id]
  );

  const handleAddToCart = useCallback(() => {
    addToCart(product?.id, quantity, selectedColor);
    toast.success("Added to cart!");
  }, [addToCart, product?.id, quantity, selectedColor]);

  if (localLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const placeBuyNowOrder = async (e) => {
    e.preventDefault();
    if (!buyEmail.trim() || !buyName.trim() || !buyPhone.trim() || !buyAddress.trim() || !buyCity.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: buyName.trim(),
        phone: buyPhone.trim(),
        email: buyEmail.trim(),
        address: buyAddress.trim(),
        city: buyCity.trim(),
        note: "",
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || null,
          color: selectedColor,
        }],
        subtotal: product.price * quantity,
        shipping: 0,
        total: product.price * quantity,
      };

      const res = await api.post("/orders", payload);
      const order = res.data;

      fetch(`${import.meta.env.BASE_URL || "/"}api/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order-placed", order }),
      }).catch(() => {});

      fetch(`${import.meta.env.BASE_URL || "/"}api/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "customer-order-placed", order, customerEmail: buyEmail.trim() }),
      }).catch(() => {});

      toast.success("Order placed successfully!");
      setBuyOpen(false);
      setBuyName("");
      setBuyPhone("");
      setBuyEmail(user?.email || "");
      setBuyAddress("");
      setBuyCity("");
      setLocation(`/thankyou?orderId=${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} - Buy Online in Pakistan | Bag Breez` : "Product | Bag Breez"}</title>
        <meta name="description" content={product ? `Buy ${product.name} online in Pakistan at best price. ${product.category} available at Bag Breez with free delivery, COD, and fast shipping across Pakistan.` : "View product details at Bag Breez — Pakistan's best bags and girls fashion store."} />
        <meta name="keywords" content={product ? `${product.name}, ${product.category} Pakistan, buy ${product.name} online, Bag Breez, fashion Pakistan, online shopping Pakistan` : "Bag Breez products, bags Pakistan, girls fashion online"} />
        <meta property="og:title" content={product ? `${product.name} | Bag Breez` : "Product | Bag Breez"} />
        <meta property="og:description" content={product ? `Buy ${product.name} at best price from Bag Breez. Free delivery & COD available across Pakistan.` : "Shop premium fashion products at Bag Breez Pakistan."} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Bag Breez" />
        {product?.images?.[0] && <meta property="og:image" content={product.images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product ? `${product.name} | Bag Breez` : "Product | Bag Breez"} />
        <meta name="twitter:description" content={product ? `Shop ${product.name} now at Bag Breez. Free delivery & COD across Pakistan.` : "Shop fashion products at Bag Breez Pakistan."} />
        {product?.images?.[0] && <meta name="twitter:image" content={product.images[0]} />}
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left: Images */}
            <div>
              <div className="aspect-square bg-muted overflow-hidden relative">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-0.5 text-xs font-bold rounded-full shadow">
                    -{product.discountPercent}%
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.images.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-16 h-16 border-2 overflow-hidden transition-all flex-shrink-0 ${selectedImage === idx ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">{product.category}</span>
              <h1 className="text-xl md:text-2xl font-bold mt-1 mb-3 leading-snug">{product.name}</h1>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-2xl font-bold">Rs. {product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <p className={`text-sm font-medium mb-4 ${inStock ? "text-green-600" : "text-red-500"}`}>{stockLabel}</p>

              <div className="flex items-start gap-6 mb-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quantity</p>
                  <div className="flex items-center border border-border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-muted transition-colors"><Minus size={14} /></button>
                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-muted transition-colors" disabled={!inStock}><Plus size={14} /></button>
                  </div>
                </div>
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Color: <span className="font-normal">{selectedColor}</span></p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors.map((color) => (
                        <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 border text-xs font-medium transition-colors ${selectedColor === color ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={!inStock}>
                  <ShoppingCart size={18} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button size="lg" variant="outline" className="flex-1 gap-2 border-foreground hover:bg-foreground hover:text-background transition-colors" onClick={() => inStock && setBuyOpen(true)} disabled={!inStock}>
                  <Zap size={18} /> Buy Now
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { icon: <Truck size={18} />, label: "Fast Delivery" },
                  { icon: <Headphones size={18} />, label: "24/7 Support" },
                  { icon: <RefreshCcw size={18} />, label: "Easy Returns" },
                ].map((item) => (
                  <div key={item.label} className="border border-border p-2.5 flex flex-col items-center gap-1.5 text-center">
                    <span className="text-accent">{item.icon}</span>
                    <span className="text-[10px] sm:text-[11px] font-medium leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold mb-3">Customer Reviews</h3>
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold flex-shrink-0">{r.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold">{r.name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.stars }).map((_, j) => (
                              <Star key={j} size={9} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <h2 className="font-bold text-base md:text-lg mb-4">Product Description</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{product.description}</p>
          </div>
        </div>

        {/* Buy Now Modal */}
        <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold uppercase tracking-wide">Quick Order</DialogTitle>
              <p className="text-xs text-muted-foreground line-clamp-1">{product.name} — Rs. {(product.price * quantity).toLocaleString()}</p>
            </DialogHeader>
            <form onSubmit={placeBuyNowOrder} className="space-y-3 mt-2">
              <div>
                <label className="block text-xs font-medium mb-1">Email Address *</label>
                <Input type="email" value={buyEmail} onChange={(e) => setBuyEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Full Name *</label>
                <Input value={buyName} onChange={(e) => setBuyName(e.target.value)} placeholder="Enter your full name" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Phone Number *</label>
                <Input value={buyPhone} onChange={(e) => setBuyPhone(e.target.value)} placeholder="e.g. 0300 1234567" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">City *</label>
                <Input value={buyCity} onChange={(e) => setBuyCity(e.target.value)} placeholder="e.g. Karachi" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Address *</label>
                <Input value={buyAddress} onChange={(e) => setBuyAddress(e.target.value)} placeholder="House, Street, Area" required />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-11" disabled={submitting}>
                  {submitting ? "Placing order..." : "Place Order"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}
