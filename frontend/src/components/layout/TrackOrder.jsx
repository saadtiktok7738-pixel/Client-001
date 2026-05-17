import { useState, useEffect } from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Helmet } from "react-helmet-async";
import api from "../../services/api.js";
import {
  Search, Package, Truck, CheckCircle2, XCircle, Clock, MapPin, Phone, User
} from "lucide-react";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABELS = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  pending: <Clock size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
};

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <XCircle size={16} /> This order has been cancelled.
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-accent -z-0 transition-all duration-500"
          style={{ width: currentIdx === 0 ? "0%" : `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "bg-accent border-accent text-accent-foreground" : "bg-white border-muted text-muted-foreground"} ${active ? "ring-2 ring-accent/30" : ""}`}>
                {done ? <CheckCircle2 size={14} /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const paramId = new URLSearchParams(window.location.search).get("orderId") || "";

  const [orderId, setOrderId] = useState(paramId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (rawId) => {
    const cleaned = rawId.replace(/^#/, "").trim();
    setOrderId(cleaned);
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setSearched(false);

    try {
      const res = await api.get("/orders/track", { params: { id: cleaned } });
      setOrder(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (paramId) fetchOrder(paramId);
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrder(orderId);
  };

  return (
    <>
      <Helmet>
        <title>Track Order | Bag Breez</title>
        <meta name="description" content="Track your order status in real-time on Bag Breez using your Order ID." />
        <meta name="keywords" content="track order, order tracking, Bag Breez, delivery status, order status" />
        <meta property="og:title" content="Track Order | Bag Breez" />
        <meta property="og:description" content="Check your order status and delivery updates on Bag Breez." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bag Breez" />
        <meta name="twitter:title" content="Track Order | Bag Breez" />
        <meta name="twitter:description" content="Track your order status on Bag Breez." />
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-2xl">
          <form onSubmit={handleTrack} className="flex gap-2 mb-8">
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order ID"
              className="flex-1 h-11"
              data-testid="input-order-id"
            />
            <Button type="submit" disabled={loading || !orderId.trim()} className="h-11 px-5 gap-2" data-testid="button-track">
              <Search size={16} />
              {loading ? "Searching..." : "Track"}
            </Button>
          </form>

          {searched && notFound && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Package size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-base mb-1">Order not found</p>
              <p className="text-sm text-muted-foreground">Double-check your Order ID and try again.</p>
            </div>
          )}

          {order && (
            <div className="space-y-5">
              <div className="border border-border p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Order ID</p>
                    <p className="font-mono font-bold text-sm">#{(order.shortId || order.id || "").slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_ICONS[order.status]}
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="pt-2">
                  <StatusTimeline status={order.status} />
                </div>
              </div>

              {order.courier && order.trackingId && (
                <div className="border border-purple-200 bg-purple-50 p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck size={16} className="text-purple-600" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-purple-800">Tracking Info</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Courier</p>
                      <p className="font-semibold">{order.courier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Tracking ID</p>
                      <p className="font-semibold font-mono">{order.trackingId}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-border p-5 md:p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin size={14} className="text-accent" /> Shipping Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-muted-foreground mt-0.5" />
                    <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{order.name}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={14} className="text-muted-foreground mt-0.5" />
                    <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{order.phone}</p></div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin size={14} className="text-muted-foreground mt-0.5" />
                    <div><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{order.address}, {order.city}</p></div>
                  </div>
                </div>
              </div>

              <div className="border border-border p-5 md:p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Package size={14} className="text-accent" /> Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover bg-muted flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold whitespace-nowrap">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {!searched && (
            <p className="text-center text-xs text-muted-foreground">
              Use the <strong>Track</strong> button next to any order in your Profile, or enter the Order ID shown on your confirmation page.
            </p>
          )}
        </div>
      </Layout>
    </>
  );
}
