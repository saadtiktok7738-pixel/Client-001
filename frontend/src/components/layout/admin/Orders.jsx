import { useEffect, useState } from "react";
import api from "../../../services/api.js";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Trash2, Pencil, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog.jsx";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const POLL_MS = 30000;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [sendingPostex, setSendingPostex] = useState(false);

  // Edit order dialog state
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchOrders = () =>
    api.get("/orders")
      .then((r) => {
        const list = [...r.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(list);
      })
      .catch(() => {});

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const visible = search.trim()
    ? filtered.filter((o) => {
        const q = search.trim().toLowerCase();
        return o.id.toLowerCase().includes(q) || (o.name || "").toLowerCase().includes(q);
      })
    : filtered;

  const toggle = (id) => {
    const n = new Set(expanded);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpanded(n);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: res.data.status } : o));
      toast.success(`Status updated to ${status}`);
      // Email notification is handled server-side in the PATCH /orders/:id/status route
    } catch {
      toast.error("Failed to update status");
    }
  };

  const doRemove = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const remove = (id) => {
    toast("Delete this order permanently?", {
      action: { label: "Delete", onClick: () => void doRemove(id) },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 6000,
    });
  };

  // Checkbox selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((o) => o.id)));
    }
  };

  // Send selected to PostEx
  const sendToPostex = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one order");
      return;
    }
    setSendingPostex(true);
    try {
      const res = await api.post("/orders/postex", { orderIds: Array.from(selected) });
      const results = res.data.results || [];
      let successCount = 0;

      results.forEach((r) => {
        if (r.success) {
          successCount++;
          setOrders((prev) => prev.map((o) =>
            o.id === r.orderId
              ? { ...o, courier: "PostEx", trackingId: r.trackingNumber, status: "shipped" }
              : o
          ));
        } else {
          const orderRef = orders.find((o) => o.id === r.orderId);
          const label = orderRef ? `#${(orderRef.shortId || orderRef.id.slice(0, 8)).toUpperCase()}` : r.orderId;
          toast.error(`${label}: ${r.error || "PostEx rejected this order"}`, { duration: 8000 });
        }
      });

      if (successCount > 0) toast.success(`${successCount} order(s) booked on PostEx successfully`);

      setSelected(new Set());
    } catch (err) {
      const data = err?.response?.data;

      // Batch validation failure — show each invalid order clearly
      if (data?.validationErrors?.length) {
        data.validationErrors.forEach((ve) => {
          toast.error(`#${ve.shortId}: ${ve.errorType}`, { duration: 10000 });
        });
        toast.error("No orders were sent — fix the above errors first.", { duration: 8000 });
      } else {
        toast.error(data?.error || "Failed to send to PostEx");
      }
    } finally {
      setSendingPostex(false);
    }
  };

  // Edit order
  const openEdit = (o) => {
    setEditOrder(o);
    setEditForm({
      name: o.name,
      email: o.email || "",
      phone: o.phone,
      address: o.address,
      city: o.city,
      note: o.note || "",
      status: o.status,
      items: o.items.map((i) => ({ ...i })),
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editOrder) return;
    setSavingEdit(true);
    try {
      const res = await api.put(`/orders/${editOrder.id}`, editForm);
      setOrders((prev) => prev.map((o) => o.id === editOrder.id ? { ...res.data, id: res.data.id || editOrder.id } : o));
      toast.success("Order updated successfully");
      setEditOrder(null);
    } catch {
      toast.error("Failed to update order");
    } finally {
      setSavingEdit(false);
    }
  };

  const updateEditItem = (idx, field, value) => {
    setEditForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: field === "quantity" || field === "price" ? Number(value) : value };
      return { ...prev, items };
    });
  };

  const removeEditItem = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-neutral-500">{orders.length} orders total</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterBtn label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUSES.map((s) => (
            <FilterBtn key={s} label={s} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Order ID or Customer Name..." className="w-full border border-neutral-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400" />
        </div>
        {selected.size > 0 && (
          <Button
            onClick={sendToPostex}
            disabled={sendingPostex}
            className="flex items-center gap-2 bg-[#a8e063] hover:bg-[#9dd055] text-black font-semibold whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            {sendingPostex ? "Sending..." : `Send ${selected.size} to PostEx`}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-neutral-500">
            {search ? "No orders match your search." : "No orders found."}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {/* Select all header */}
            <li className="px-4 py-2 bg-neutral-50 flex items-center gap-3 border-b border-neutral-200">
              <input
                type="checkbox"
                checked={visible.length > 0 && selected.size === visible.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-xs text-neutral-500">
                {selected.size > 0 ? `${selected.size} selected` : "Select all"}
              </span>
            </li>

            {visible.map((o) => {
              const open = expanded.has(o.id);
              const hasTracking = !!(o.courier && o.trackingId);
              const shortId = (o.shortId || o.id.slice(0, 8)).toUpperCase();
              const isChecked = selected.has(o.id);

              return (
                <li key={o.id}>
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(o.id)}
                      className="h-4 w-4 cursor-pointer flex-shrink-0"
                    />

                    <button onClick={() => toggle(o.id)} className="rounded-md p-1 hover:bg-neutral-100" data-testid={`button-toggle-order-${o.id}`}>
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    <div className="min-w-[120px] flex-1">
                      <p className="text-xs font-mono font-bold text-neutral-800">#{shortId}</p>
                      <p className="text-sm text-neutral-600">{o.name}</p>
                    </div>

                    <div className="hidden text-xs text-neutral-500 md:block">
                      {format(new Date(o.createdAt), "MMM d, yyyy h:mm a")}
                    </div>

                    <div className="text-sm font-bold">Rs. {o.total.toLocaleString()}</div>

                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>

                    {hasTracking && (
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        PostEx: {o.trackingId}
                      </span>
                    )}

                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="min-w-[140px] border border-neutral-300 bg-white px-3 py-2 text-xs font-medium capitalize text-neutral-800 cursor-pointer focus:outline-none focus:border-neutral-900" data-testid={`select-status-${o.id}`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => openEdit(o)}
                      className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 hover:bg-neutral-50 transition-colors"
                      data-testid={`button-edit-order-${o.id}`}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>

                    <button onClick={() => remove(o.id)} className="rounded-md p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600" data-testid={`button-delete-${o.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {open && (
                    <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Shipping</h3>
                          <p><strong>Order ID:</strong> <span className="font-mono font-bold">#{shortId}</span></p>
                          <p><strong>Name:</strong> {o.name}</p>
                          {o.email && <p><strong>Email:</strong> {o.email}</p>}
                          <p><strong>Phone:</strong> {o.phone}</p>
                          <p><strong>City:</strong> {o.city}</p>
                          <p><strong>Address:</strong> {o.address}</p>
                          {o.note && <p><strong>Note:</strong> {o.note}</p>}
                          {hasTracking && (
                            <div className="mt-2 border-t border-neutral-200 pt-2">
                              <p><strong>Courier:</strong> {o.courier}</p>
                              <p><strong>Tracking ID:</strong> {o.trackingId}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Items ({o.items.reduce((s, i) => s + i.quantity, 0)})</h3>
                          <ul className="space-y-2">
                            {o.items.map((it, idx) => (
                              <li key={idx} className="flex items-center justify-between gap-3 rounded-md bg-white p-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {it.image && <img src={it.image} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover" />}
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">{it.name}</p>
                                    <p className="text-[11px] text-neutral-500">Qty: {it.quantity}</p>
                                    {it.color && <p className="text-[11px] text-neutral-500">Color: {it.color}</p>}
                                  </div>
                                </div>
                                <span className="text-xs font-semibold whitespace-nowrap">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-3 border-t border-neutral-200 pt-2 space-y-1 text-xs text-neutral-500">
                            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {(o.subtotal ?? o.total).toLocaleString()}</span></div>
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              {(o.shipping ?? 0) === 0 ? <span className="font-semibold text-green-600">Free</span> : <span>Rs. {(o.shipping ?? 0).toLocaleString()}</span>}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 text-sm font-bold">
                            <span>Total</span><span>Rs. {o.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={(o) => !o && setEditOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6 w-full rounded-none sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase tracking-wide">
              Edit Order #{editOrder ? (editOrder.shortId || editOrder.id.slice(0, 8)).toUpperCase() : ""}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Edit customer details, items, city, and status for this order.
            </DialogDescription>
          </DialogHeader>

          {editOrder && (
            <form onSubmit={saveEdit} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Customer Name *</label>
                  <Input value={editForm.name || ""} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone *</label>
                  <Input value={editForm.phone || ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">City *</label>
                  <Input
                    value={editForm.city || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Lahore"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Address *</label>
                  <Input value={editForm.address || ""} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Note</label>
                  <Input value={editForm.note || ""} onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select value={editForm.status || "pending"} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-2 text-xs capitalize focus:outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Items</h3>
                <div className="space-y-2">
                  {(editForm.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 border border-neutral-200 rounded p-2 bg-neutral-50">
                      {item.image && <img src={item.image} alt="" className="h-10 w-10 object-cover rounded flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        {item.color && <p className="text-[11px] text-neutral-500">Color: {item.color}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-[10px] text-neutral-500">Qty</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateEditItem(idx, "quantity", e.target.value)}
                            className="w-16 h-7 text-xs px-2"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-500">Price</label>
                          <Input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateEditItem(idx, "price", e.target.value)}
                            className="w-24 h-7 text-xs px-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEditItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1 mt-3"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOrder(null)}>Cancel</Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs capitalize ${active ? "bg-black text-white" : "border border-neutral-300 bg-white text-neutral-700"}`} data-testid={`filter-${label.toLowerCase()}`}>
      {label}
    </button>
  );
}
