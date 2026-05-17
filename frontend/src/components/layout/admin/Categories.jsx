import { useEffect, useState } from "react";
import api from "../../../services/api.js";
import { compressImage, slugify } from "../../lib/imageUtils.js";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const POLL_MS = 30000;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () =>
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});

  useEffect(() => {
    fetchCategories();
    const interval = setInterval(fetchCategories, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const onFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !imageFile) {
      toast.error("Name and image are required");
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await compressImage(imageFile, 800, 0.85);
      const res = await api.post("/categories", {
        name: name.trim(),
        slug: slugify(name),
        image: dataUrl,
        createdAt: new Date().toISOString(),
      });
      setCategories((prev) => [...prev, res.data]);
      setName("");
      setImageFile(null);
      setPreviewUrl(null);
      toast.success("Category created");
    } catch (err) {
      toast.error("Failed: " + (err?.message ?? "unknown"));
    } finally {
      setSaving(false);
    }
  };

  const doRemove = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const remove = (id) => {
    toast("Delete this category?", {
      action: { label: "Delete", onClick: () => void doRemove(id) },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 6000,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-neutral-500">{categories.length} categories</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_auto] md:p-6">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-500">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sneakers" className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-8 text-sm font-medium hover:border-[#a8e063] hover:bg-[#a8e063]/5">
            <UploadCloud className="h-5 w-5" />
            {imageFile ? imageFile.name : "Click to choose category image"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>

          <button type="submit" disabled={saving} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving..." : "Create category"}
          </button>
        </div>

        <div className="flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-40 w-40 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-neutral-100 text-xs text-neutral-400">Preview</div>
          )}
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
            <img src={c.image} alt={c.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
            <p className="mt-2 truncate text-sm font-medium">{c.name}</p>
            <button onClick={() => remove(c.id)} className="mt-2 inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">No categories yet.</div>
        )}
      </div>
    </div>
  );
}
