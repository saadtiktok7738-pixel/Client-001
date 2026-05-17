import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingBag,
  Image as ImageIcon,
  Tag,
  Package,
  Users,
  LogOut,
  Truck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
];

export default function AdminLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href, exact) =>
    exact ? location === href : location === href || location.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-neutral-200 bg-black text-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            data-testid="link-admin-home"
          >
            Bag Breez<span className="text-[#a8e063]">.</span>
            <span className="ml-2 text-xs font-normal text-white/60">Admin</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[#a8e063] text-black font-semibold"
                    : "text-white/80 hover:bg-white/10"
                }`}
                data-testid={`link-admin-${item.label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          {user && (
            <p
              className="mt-2 truncate px-3 text-[10px] text-white/40"
              title={user.email || ""}
            >
              {user.email}
            </p>
          )}
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex w-full flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center justify-between bg-white px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="p-2"
            data-testid="button-admin-menu"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
              <span className="block h-0.5 w-5 bg-black" />
            </div>
          </button>

          <span className="font-semibold">Admin</span>
          <span className="w-9" />
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 text-sm md:text-base">
          <div className="[&_h1]:text-lg [&_h1]:sm:text-xl [&_h1]:md:text-2xl [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:md:text-xl [&_h3]:text-sm [&_h3]:sm:text-base [&_table]:text-xs [&_table]:sm:text-sm [&_td]:py-2 [&_th]:py-2 [&_.card]:p-3 [&_.card]:sm:p-4 [&_.card]:md:p-6 space-y-4 md:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
