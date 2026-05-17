import React from "react";
import { Link, useLocation } from "wouter";
import { Home, LayoutGrid, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";

export function MobileBottomBar() {
  const [location] = useLocation();
  const { cart, wishlist, setIsCartOpen } = useCart();

  const cartItemCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const items = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Catalog", icon: LayoutGrid, href: "/catalog" },
    { label: "Wishlist", icon: Heart, href: "/wishlist", badge: wishlist.length },
    {
      label: "Cart",
      icon: ShoppingCart,
      href: null,
      badge: cartItemCount,
      onClick: () => setIsCartOpen(true),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white text-foreground border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 gap-1 px-2 py-1">
        {items.map((item) => {
          const isActive = item.href && location === item.href;
          const Icon = item.icon;

          const content = (
            <div
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 relative transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={2.1} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
                {item.label}
              </span>
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}