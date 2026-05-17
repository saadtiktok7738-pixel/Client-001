import React from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  User,
  Heart,
  Menu,
  X,
  Minus,
  Plus,
  Trash2,
  Truck,
  Tag,
  Headphones,
  Banknote,
  ShoppingCart,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet.jsx";
import { useData } from "../../contexts/DataContext.jsx";
import { Button } from "../../ui/button.jsx";
import { Logo } from "../../ui/logo.jsx";

const announcements = [
  { icon: Truck, text: "Free delivery all over Pakistan" },
  { icon: Tag, text: "Up to 40% off on products" },
  { icon: Headphones, text: "24/7 Support" },
  { icon: Banknote, text: "COD Available" },
];

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [, navigateTo] = useLocation();
  const accountHref = user ? (isAdmin ? "/admin" : "/profile") : "/signin";

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    removeFromCart,
    updateQuantity,
    wishlist,
  } = useCart();

  const { products: allProducts, categories: allCategories } = useData();

  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const searchSuggestions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allProducts
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return (
          name.includes(q) || cat.includes(q) || desc.includes(q)
        );
      })
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, 6);
  }, [searchQuery, allProducts]);

  const goToProduct = (id) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setLocation(`/product/${id}`);
  };

  React.useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [location]);

  const cartItemCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const headerPosition = scrolled
    ? "fixed top-0 left-0 right-0 bg-white/75 backdrop-blur-md border-b border-border/40 shadow-sm"
    : "relative bg-white border-b border-border";

  const textColor = "text-foreground";
  const logoVariant = "dark";
  const iconHover = "hover:bg-muted";

  return (
    <>
      {/* Top Sliding Announcement Bar */}
<div className="bg-foreground text-background text-xs sm:text-sm font-bold py-2.5 overflow-hidden relative w-full">
  <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap w-max">
    {[...announcements, ...announcements, ...announcements].map((a, idx) => (
      <span key={idx} className="inline-flex items-center gap-2 mx-8">
        <a.icon size={14} className="text-accent" />
        <span className="tracking-wide uppercase">{a.text}</span>
        <span className="text-accent ml-6">•</span>
      </span>
    ))}
  </div>
</div>

{/* Spacer */}
{scrolled && <div aria-hidden="true" className="h-16 sm:h-20" />}

<header className={`z-50 w-full transition-colors duration-300 ${headerPosition}`}>
  <div className={`container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 ${textColor}`}>

    {/* LEFT */}
    <div className="flex items-center flex-1">
      <button
        className="md:hidden p-2 -ml-2"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={26} strokeWidth={2.2} />
      </button>

      <nav className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide">
        <Link href="/" className="hover:text-accent transition-colors uppercase pl-4">
          Home
        </Link>
        <Link href="/catalog" className="hover:text-accent transition-colors uppercase">
          Catalog
        </Link>
      </nav>
    </div>

    {/* CENTER LOGO */}
    <Link href="/" className="flex-shrink-0 flex items-center">
  <div className="md:hidden flex items-center">
    <Logo size="md" variant={logoVariant} showText={false} />
  </div>

  <div className="hidden md:flex items-center">
    <Logo size="md" variant={logoVariant} />
  </div>
</Link>
    {/* RIGHT */}
    <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-5 flex-1">

      {/* Search */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`p-2 rounded-full ${iconHover} hover:text-accent transition-colors`}
      >
        <Search size={22} strokeWidth={2.2} />
      </button>

      {/* Account */}
      <Link
        href={accountHref}
        className={`hidden md:flex p-2 rounded-full ${iconHover} hover:text-accent transition-colors items-center`}
      >
        {user && user.avatar ? (
          <img src={user.avatar} alt={user.name || "Profile"} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <User size={22} strokeWidth={2.2} />
        )}
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className={`hidden md:flex p-2 rounded-full ${iconHover} hover:text-accent transition-colors items-center relative`}
      >
        <Heart size={22} strokeWidth={2.2} />
        {wishlist.length > 0 && (
          <span className="absolute top-0 right-0 bg-accent text-accent-foreground min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </Link>

      {/* CART SHEET */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <button
            className={`hidden md:flex p-2 rounded-full ${iconHover} hover:text-accent transition-colors relative`}
          >
            <ShoppingCart size={22} strokeWidth={2.2} />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-accent-foreground min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                <ShoppingCart size={48} className="opacity-20" />
                <p>Your cart is empty.</p>
                <Button onClick={() => { setIsCartOpen(false); setLocation('/catalog'); }}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = allProducts.find(p => p.id === item.productId);
                  if (!product) return null;

                  const itemKey = `${item.productId}-${item.color || ""}`;
                  const lineTotal = product.price * item.quantity;

                  return (
                    <div key={itemKey} className="flex gap-4 border-b pb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-24 object-cover flex-shrink-0"
                      />

                      <div className="flex-1 flex flex-col min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2">
                          {product.name}
                        </h4>

                        {item.color && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="text-sm font-bold mt-1">
                          Rs. {lineTotal.toLocaleString()}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center border">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)}
                              className="p-1 px-2 hover:bg-muted disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>

                            <span className="px-3 text-sm font-semibold min-w-[28px] text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)}
                              className="p-1 px-2 hover:bg-muted"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.productId, item.color)}
                            className="text-destructive p-2 hover:bg-destructive/10 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="pt-4 border-t mt-auto">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setIsCartOpen(false);
                  setLocation('/checkout');
                }}
              >
                Checkout
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  </div>

  {/* Search Dropdown */}
{isSearchOpen && (
  <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg animate-in slide-in-from-top-2 w-full">
    <div className="container mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 border border-border px-4 py-2 outline-none focus:border-accent text-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          data-testid="input-header-search"
        />
        <Button type="submit" data-testid="button-header-search">
          Search
        </Button>
      </form>

      {/* Live suggestion list */}
      {searchQuery.trim() && (
        <div className="mt-3 max-h-[60vh] overflow-y-auto border border-border bg-white">
          {searchSuggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products match "{searchQuery}".
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {searchSuggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => goToProduct(p.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                    data-testid={`search-suggestion-${p.id}`}
                  >
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-12 w-12 flex-shrink-0 object-cover bg-muted"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap">
                      Rs. {p.price.toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="block w-full px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-accent hover:bg-muted transition-colors"
                  data-testid="search-view-all"
                >
                  View all results for "{searchQuery.trim()}" →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  </div>
)}
</header>

{/* Mobile Slide-in Sidebar */}
{isMobileMenuOpen && (
  <div className="fixed inset-0 z-[100] flex md:hidden">
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setIsMobileMenuOpen(false)}
    />
    <aside className="relative w-[80%] max-w-xs bg-white h-full flex flex-col animate-in slide-in-from-left">
      
      <div className="p-4 flex justify-between items-center border-b">
        <Logo size="sm" />
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col py-4 overflow-y-auto">
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="px-5 py-3 text-base font-semibold uppercase tracking-wide hover:bg-muted"
        >
          Home
        </Link>

        <Link
          href="/catalog"
          onClick={() => setIsMobileMenuOpen(false)}
          className="px-5 py-3 text-base font-semibold uppercase tracking-wide hover:bg-muted"
        >
          Catalog
        </Link>

        <div className="px-5 py-2 mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Categories
        </div>

        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-5 py-2.5 text-sm font-medium hover:bg-muted hover:text-accent"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        {user ? (
          <div className="space-y-2">
            <Link
              href={isAdmin ? "/admin" : "/profile"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-3 font-semibold uppercase text-sm tracking-wide"
            >
              <User size={18} /> {isAdmin ? "Admin Panel" : "My Account"}
            </Link>

            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full border border-border py-2.5 font-semibold uppercase text-xs tracking-wide hover:bg-muted"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo("/signin");
            }}
            className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-3 font-semibold uppercase text-sm tracking-wide"
          >
            <LogIn size={18} /> Sign In
          </button>
        )}
      </div>

    </aside>
  </div>
)}
    </>
  );
}
