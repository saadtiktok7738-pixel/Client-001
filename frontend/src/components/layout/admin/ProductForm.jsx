import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import api from "../../../services/api.js";
import { compressImage } from "../../lib/imageUtils.js";
import { ArrowLeft, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const NAME_MAX_WORDS = 150;
const DESC_MAX_WORDS = 750;

const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

export default function ProductForm() {
  const [, params] = useRoute("/admin/products/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const isNew = !id || id === "new";

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [isHot, setIsHot] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isLimitedOffer, setIsLimitedOffer] = useState(false);
  const [stock, setStock] = useState("50");
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

  const addColor = () => {
    const v = colorInput.trim();
    if (!v) return;
    if (colors.some((c) => c.toLowerCase() === v.toLowerCase())) { setColorInput(""); return; }
    setColors((prev) => [...prev, v]);
    setColorInput("");
  };

  const removeColor = (idx) => setColors((prev) => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    api.get(`/products/${id}`)
      .then((r) => {
        const p = r.data;
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(String(p.price || ""));
        setOriginalPrice(String(p.originalPrice || ""));
        setDiscountPercent(String(p.discountPercent || ""));
        setCategory(p.category || "");
        setImages(p.images || []);
        setIsHot(!!p.isHot);
        setIsNewArrival(!!p.isNewArrival);
        setIsLimitedOffer(!!p.isLimitedOffer);
        setStock(String(p.stock || 50));
        setColors(Array.isArray(p.colors) ? p.colors : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Product not found");
        setLocation("/admin/products");
      });
  }, [id, isNew, setLocation]);

  const onUploadImage = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await compressImage(f, 1200, 0.85));
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) added`);
    } catch (err) {
      toast.error("Image error: " + (err?.message || "unknown"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");
    if (!description.trim()) return toast.error("Description is required");

    const priceN = Number(price);
    if (!priceN || priceN <= 0) return toast.error("Valid price required");
    if (originalPrice && Number(originalPrice) < priceN) return toast.error("Cutted price must be ≥ price");
    if (discountPercent) {
      const d = Number(discountPercent);
      if (d < 1 || d > 100) return toast.error("Discount must be between 1–100");
    }
    if (!category) return toast.error("Select a category");
    if (!images.length) return toast.error("Add at least one image");

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: priceN,
        originalPrice: originalPrice ? Number(originalPrice) : priceN,
        discountPercent: discountPercent ? Number(discountPercent) : 0,
        images,
        colors,
        stock: Number(stock) || 0,
        isHot,
        isNewArrival,
        isLimitedOffer,
      };

      if (isNew) {
        await api.post("/products", payload);
        toast.success("Product created");
      } else {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      }

      setLocation("/admin/products");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "unknown";
      toast.error("Save failed: " + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-neutral-500">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <button onClick={() => setLocation("/admin/products")} className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <h1 className="text-2xl font-bold">{isNew ? "New product" : "Edit product"}</h1>

      <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Field label={`Name (${wordCount(name)}/${NAME_MAX_WORDS} words)`}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </Field>

          <Field label={`Description (${wordCount(description)}/${DESC_MAX_WORDS} words)`}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Price (Rs)">
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Cutted price (optional)">
              <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Discount % (1–100, optional)">
              <input type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm">
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Stock">
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <Field label="Colors (optional)">
            <div className="flex gap-2">
              <input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
              />
              <button type="button" onClick={addColor} className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium">Add</button>
            </div>
            {colors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2 py-0.5 text-xs">
                    {c}
                    <button type="button" onClick={() => removeColor(i)} className="text-neutral-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Images">
            <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-neutral-300 px-4 py-6 text-sm">
              <UploadCloud className="h-5 w-5" />
              {uploading ? "Processing..." : "Add images"}
              <input type="file" multiple accept="image/*" className="hidden" onChange={onUploadImage} />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} className="h-24 w-full rounded-md object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute right-1 top-1 bg-black/70 p-1 text-white">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </Field>
        </div>

        <div className="space-y-5">
          <button type="submit" disabled={saving} className="w-full rounded-full bg-[#a8e063] px-5 py-3 text-sm font-semibold">
            {saving ? "Saving..." : isNew ? "Create product" : "Save changes"}
          </button>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
            <p className="text-xs font-semibold uppercase text-neutral-500">Flags</p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isHot} onChange={(e) => setIsHot(e.target.checked)} className="accent-black" />
              Hot Selling
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-black" />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isLimitedOffer} onChange={(e) => setIsLimitedOffer(e.target.checked)} className="accent-black" />
              Limited Offer
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
