import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api.js";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend,
} from "recharts";
import {
  format, eachDayOfInterval, startOfDay, endOfDay, subDays, parseISO,
} from "date-fns";
import { DollarSign, ShoppingBag, TrendingUp, Package, Activity, Search } from "lucide-react";
import { Button } from "../../ui/button.jsx";

const ACTIVE_WINDOW_MS = 60000;
const POLL_MS = 30000;

const STATUS_CARD_CONFIG = [
  { key: "delivered", label: "Delivered Orders", color: "bg-green-50 border-green-200 text-green-800", dot: "bg-green-500" },
  { key: "processing", label: "Processing Orders", color: "bg-blue-50 border-blue-200 text-blue-800", dot: "bg-blue-500" },
  { key: "shipped", label: "Shipped Orders", color: "bg-purple-50 border-purple-200 text-purple-800", dot: "bg-purple-500" },
  { key: "pending", label: "Pending Orders", color: "bg-yellow-50 border-yellow-200 text-yellow-800", dot: "bg-yellow-500" },
  { key: "cancelled", label: "Cancelled Orders", color: "bg-red-50 border-red-200 text-red-800", dot: "bg-red-500" },
];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [from, setFrom] = useState(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    return format(subDays(new Date(), isMobile ? 6 : 29), "yyyy-MM-dd");
  });
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));

  // Separate date range for status analytics
  const [analyticsFrom, setAnalyticsFrom] = useState(format(subDays(new Date(), 29), "yyyy-MM-dd"));
  const [analyticsTo, setAnalyticsTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [analyticsFrom2, setAnalyticsFrom2] = useState(format(subDays(new Date(), 29), "yyyy-MM-dd"));
  const [analyticsTo2, setAnalyticsTo2] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    const fetchOrders = () => api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
    const fetchPresence = () => api.get("/presence/count").then((r) => setLiveVisitors(r.data.count || 0)).catch(() => {});

    fetchOrders();
    fetchPresence();

    const ordersInterval = setInterval(fetchOrders, POLL_MS);
    const presenceInterval = setInterval(fetchPresence, 15000);
    const tick = setInterval(() => setNow(Date.now()), 10000);

    return () => {
      clearInterval(ordersInterval);
      clearInterval(presenceInterval);
      clearInterval(tick);
    };
  }, []);

  const fromDate = useMemo(() => startOfDay(parseISO(from)), [from]);
  const toDate = useMemo(() => endOfDay(parseISO(to)), [to]);

  const filtered = useMemo(
    () => orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= fromDate.getTime() && t <= toDate.getTime() && o.status !== "cancelled";
    }),
    [orders, fromDate, toDate]
  );

  const series = useMemo(() => {
    if (toDate < fromDate) return [];
    const days = eachDayOfInterval({ start: fromDate, end: toDate });
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const dayOrders = filtered.filter((o) => format(new Date(o.createdAt), "yyyy-MM-dd") === key);
      return {
        date: format(d, "MMM d"),
        sales: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders: dayOrders.length,
      };
    });
  }, [filtered, fromDate, toDate]);

  const totals = useMemo(() => {
    const sales = filtered.reduce((s, o) => s + (o.total || 0), 0);
    const count = filtered.length;
    const avg = count > 0 ? sales / count : 0;
    const items = filtered.reduce((s, o) => s + o.items.reduce((x, i) => x + i.quantity, 0), 0);
    return { sales, count, avg, items };
  }, [filtered]);

  const setRange = (days) => {
    setFrom(format(subDays(new Date(), days - 1), "yyyy-MM-dd"));
    setTo(format(new Date(), "yyyy-MM-dd"));
  };

  // Status analytics
  const analyticsData = useMemo(() => {
    const af = startOfDay(parseISO(analyticsFrom2));
    const at = endOfDay(parseISO(analyticsTo2));
    const rangeOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= af.getTime() && t <= at.getTime();
    });

    return STATUS_CARD_CONFIG.map(({ key, label, color, dot }) => {
      const matching = rangeOrders.filter((o) => o.status === key);
      const count = matching.length;
      const total = matching.reduce((s, o) => s + (o.total || 0), 0);
      return { key, label, color, dot, count, total };
    });
  }, [orders, analyticsFrom2, analyticsTo2]);

  const handleAnalyticsSearch = () => {
    setAnalyticsFrom2(analyticsFrom);
    setAnalyticsTo2(analyticsTo);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 md:px-4 md:py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <Activity className="h-4 w-4 text-neutral-700" />
          <span className="text-xs md:text-sm font-semibold text-neutral-800">
            Live Visitors: <span className="text-green-600">{liveVisitors}</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[10px] md:text-[11px] text-neutral-500">Active in the last 60s</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center justify-between sm:block">
            <h1 className="text-lg md:text-2xl font-bold">Dashboard</h1>
            <div className="flex gap-1 sm:hidden">
              {[7, 30, 90].map((d) => (
                <button key={d} onClick={() => setRange(d)} className="border border-neutral-300 bg-white px-2 py-1 text-[11px]">{d}d</button>
              ))}
            </div>
          </div>
          <p className="hidden sm:block text-xs md:text-sm text-neutral-500">Sales & order trends for the selected range.</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">From</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-[120px] border border-neutral-300 bg-white px-2 py-1 text-[11px] md:px-3 md:py-2 md:text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">To</label>
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-[120px] border border-neutral-300 bg-white px-2 py-1 text-[11px] md:px-3 md:py-2 md:text-sm" />
          </div>
          <div className="hidden sm:flex gap-1">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setRange(d)} className="border border-neutral-300 bg-white px-2 py-1 text-[11px] md:px-3 md:py-2 md:text-xs">{d}d</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard icon={<DollarSign className="h-4 w-4" />} label="Sales" value={`Rs. ${totals.sales.toLocaleString()}`} />
        <KpiCard icon={<ShoppingBag className="h-4 w-4" />} label="Orders" value={totals.count.toString()} />
        <KpiCard icon={<TrendingUp className="h-4 w-4" />} label="Avg. Order" value={`Rs. ${Math.round(totals.avg).toLocaleString()}`} />
        <KpiCard icon={<Package className="h-4 w-4" />} label="Items Sold" value={totals.items.toString()} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-3 md:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs md:text-sm font-semibold">Sales & Orders over time</h2>
        </div>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" fill="#000" />
              <Line yAxisId="left" dataKey="sales" stroke="#56ab2f" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Analytics Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3 md:p-6 space-y-4">
        <h2 className="text-sm md:text-base font-bold">Order Status Analytics</h2>
        <p className="text-xs text-neutral-500">Filter orders by date range and view status breakdown.</p>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">From</label>
            <input
              type="date"
              value={analyticsFrom}
              max={analyticsTo}
              onChange={(e) => setAnalyticsFrom(e.target.value)}
              className="w-[130px] border border-neutral-300 bg-white px-2 py-1.5 text-[11px] md:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">To</label>
            <input
              type="date"
              value={analyticsTo}
              min={analyticsFrom}
              onChange={(e) => setAnalyticsTo(e.target.value)}
              className="w-[130px] border border-neutral-300 bg-white px-2 py-1.5 text-[11px] md:text-sm"
            />
          </div>
          <Button onClick={handleAnalyticsSearch} className="flex items-center gap-1.5 h-9">
            <Search className="h-3.5 w-3.5" />
            Search
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {analyticsData.map(({ key, label, color, dot, count, total }) => (
            <div key={key} className={`rounded-xl border p-3 md:p-4 ${color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{count}</p>
              <p className="text-[11px] md:text-xs mt-1 opacity-80">
                {count === 1 ? "1 order" : `${count} orders`}
              </p>
              <p className="text-xs md:text-sm font-semibold mt-1">
                Rs. {total.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 md:p-4">
      <div className="flex items-center justify-between text-neutral-500">
        <span className="text-[10px] uppercase">{label}</span>
        <span>{icon}</span>
      </div>
      <p className="mt-2 text-sm md:text-2xl font-bold">{value}</p>
    </div>
  );
}
