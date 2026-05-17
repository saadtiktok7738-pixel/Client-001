import { useState, useEffect } from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../../services/api.js";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { toast } from "sonner";
import { LogOut, Package, Search } from "lucide-react";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet-async";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [orders, setOrders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/signin"); return; }
    setName(user.name || "");
    api.get("/orders/my").then((r) => setOrders(r.data)).catch(console.error);
  }, [user, setLocation]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Profile | Bag Breez</title>
        <meta name="description" content="Manage your account, view orders, and update your profile on Bag Breez." />
      </Helmet>
      <Layout>
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-12 flex flex-col md:flex-row gap-6 md:gap-12">
          <div className="w-full md:w-1/3 max-w-md">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-4 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 border-b pb-2">Account Details</h2>

              <form onSubmit={handleSaveProfile} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Email</label>
                  <Input value={user.email || ""} disabled className="bg-muted" />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>

            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-6">My Orders</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 md:py-16 bg-white border border-dashed">
                <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {orders.map((order) => {
                  const statusClass = STATUS_COLORS[order.status] || "bg-neutral-100 text-neutral-800";
                  const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
                  const orderRef = (order.shortId || order.orderId || order.id || "").toString().slice(0, 8).toUpperCase();

                  return (
                    <div key={order.id} className="bg-white border shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 md:py-3 border-b">
                        <div className="min-w-0">
                          <div className="text-[11px] md:text-xs text-muted-foreground">
                            Order <span className="font-semibold text-foreground">#{orderRef}</span>
                          </div>
                          <div className="text-[11px] md:text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href={`/track?orderId=${order.shortId || order.orderId || order.id}`}
                            className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide border border-border px-2 py-0.5 hover:bg-muted transition-colors"
                          >
                            <Search size={10} /> Track
                          </Link>
                          <span className={`px-2 py-0.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${statusClass}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <ul className="divide-y">
                        {(order.items || []).map((it, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 px-3 md:px-4 py-2.5 md:py-3">
                            {it.image && (
                              <img src={it.image} alt="" className="h-11 w-11 md:h-14 md:w-14 flex-shrink-0 object-cover bg-muted" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs md:text-sm font-medium line-clamp-2">{it.name}</div>
                              <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
                                Qty {it.quantity} · Rs. {it.price.toLocaleString()}
                              </div>
                              {it.color && (
                                <div className="text-[11px] md:text-xs text-muted-foreground">Color: {it.color}</div>
                              )}
                            </div>
                            <div className="text-xs md:text-sm font-semibold whitespace-nowrap">
                              Rs. {(it.price * it.quantity).toLocaleString()}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="px-3 md:px-4 py-2.5 md:py-3 border-t bg-muted/30 space-y-1">
                        <div className="text-[11px] md:text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Ship to:</span>{" "}
                          {order.name}, {order.address}, {order.city}
                        </div>
                        <div className="text-[11px] md:text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Phone:</span> {order.phone}
                        </div>
                        {order.note && (
                          <div className="text-[11px] md:text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Note:</span> {order.note}
                          </div>
                        )}
                        {(order.courier || order.trackingId) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5">
                              Tracking
                            </span>
                            {order.courier && (
                              <span className="text-[11px] md:text-xs text-foreground">
                                <span className="font-semibold">Courier:</span> {order.courier}
                              </span>
                            )}
                            {order.trackingId && (
                              <span className="text-[11px] md:text-xs text-foreground">
                                <span className="font-semibold">ID:</span>{" "}
                                <span className="font-mono select-all">{order.trackingId}</span>
                              </span>
                            )}
                          </div>
                        )}
                        <div className="pt-1.5 md:pt-2 mt-1 border-t space-y-0.5">
                          {(order.shipping ?? 0) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] md:text-xs text-muted-foreground">Shipping</span>
                              <span className="text-[11px] md:text-xs text-muted-foreground">
                                Rs. {(order.shipping ?? 0).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] md:text-xs text-muted-foreground">
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            <span className="text-sm md:text-base font-bold">
                              Total: Rs. {order.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
