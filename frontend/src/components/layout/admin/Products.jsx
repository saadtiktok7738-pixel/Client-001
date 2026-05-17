import { useEffect, useState } from "react";
import { Link } from "wouter";
import api from "../../../services/api.js";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const POLL_MS = 30000;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProducts = () =>
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const doRemove = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const remove = (id) => {
    toast("Delete this product?", {
      action: { label: "Delete", onClick: () => void doRemove(id) },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 6000,
    });
  };

  const toggleFlag = async (p, flag) => {
    const newVal = !p[flag];
    try {
      const res = await api.patch(`/products/${p.id}/flag`, { flag, value: newVal });
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, [flag]: res.data[flag] } : x));
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update";
      toast.error(msg);
    }
  };

  const filtered = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    hot: products.filter((p) => p.isHot).length,
    new: products.filter((p) => p.isNewArrival).length,
    offer: products.filter((p) => p.isLimitedOffer).length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Products</h1>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center border border-orange-300 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-700">Hot {counts.hot}/8</span>
              <span className="inline-flex items-center border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">New {counts.new}/8</span>
              <span className="inline-flex items-center border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">Offer {counts.offer}/1</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{products.length} products</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="border border-neutral-300 px-3 py-2 text-sm" />
          <Link href="/admin/products/new" className="inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-center">Hot</th>
              <th className="px-4 py-3 text-center">New</th>
              <th className="px-4 py-3 text-center">Offer</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} className="h-10 w-10 rounded-md object-cover" alt={p.name} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">Rs. {p.price.toLocaleString()}</div>
                  {p.originalPrice > p.price && <div className="text-xs text-neutral-400 line-through">Rs. {p.originalPrice.toLocaleString()}</div>}
                </td>
                <td className="px-4 py-3 text-center"><Toggle on={!!p.isHot} onClick={() => toggleFlag(p, "isHot")} /></td>
                <td className="px-4 py-3 text-center"><Toggle on={!!p.isNewArrival} onClick={() => toggleFlag(p, "isNewArrival")} /></td>
                <td className="px-4 py-3 text-center"><Toggle on={!!p.isLimitedOffer} onClick={() => toggleFlag(p, "isLimitedOffer")} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="rounded-md border border-neutral-300 p-1.5"><Edit2 className="h-4 w-4" /></Link>
                    <button onClick={() => remove(p.id)} className="rounded-md border border-red-300 p-1.5 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-neutral-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${on ? "bg-[#56ab2f]" : "bg-neutral-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
