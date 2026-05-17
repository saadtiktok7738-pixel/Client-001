import { useState, useEffect } from "react";
import { useShippingSettings } from "../../hooks/useShippingSettings.js";
import { Button } from "../../ui/button.jsx";
import { Input } from "../../ui/input.jsx";
import { toast } from "sonner";
import { Truck } from "lucide-react";

export default function ShippingSettings() {
  const { settings, loading, saveSettings } = useShippingSettings();

  const [type, setType] = useState(settings.type);
  const [cost, setCost] = useState(settings.cost.toString());
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when Firestore data loads
  useEffect(() => {
    setType(settings.type);
    setCost(settings.cost.toString());
  }, [settings.type, settings.cost]);

  const handleSave = async () => {
    const parsed = parseFloat(cost);
    if (type === "custom" && (isNaN(parsed) || parsed < 0)) {
      toast.error("Please enter a valid shipping cost");
      return;
    }
    setSaving(true);
    try {
      await saveSettings({ type, cost: type === "free" ? 0 : parsed });
      toast.success("Shipping settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-neutral-500">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-5 w-5" /> Shipping Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure the shipping cost applied to every customer order.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5">
        {/* Option 1 — Free Shipping */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="shippingType"
            value="free"
            checked={type === "free"}
            onChange={() => setType("free")}
            className="mt-0.5 accent-black"
          />
          <div>
            <p className="font-semibold text-sm">Free Shipping</p>
            <p className="text-xs text-neutral-500">No shipping charge added to orders.</p>
          </div>
        </label>

        {/* Option 2 — Custom Cost */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="shippingType"
            value="custom"
            checked={type === "custom"}
            onChange={() => setType("custom")}
            className="mt-0.5 accent-black"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm">Custom Shipping Cost</p>
            <p className="text-xs text-neutral-500 mb-2">
              A fixed amount added to every order total.
            </p>

            {type === "custom" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-600">Rs.</span>
                <Input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-36 h-9"
                />
              </div>
            )}
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          Current:{" "}
          <span className="font-semibold text-neutral-700">
            {settings.type === "free"
              ? "Free Shipping"
              : `Rs. ${settings.cost.toLocaleString()}`}
          </span>
        </p>
        <Button onClick={handleSave} disabled={saving} className="h-9 px-6">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}