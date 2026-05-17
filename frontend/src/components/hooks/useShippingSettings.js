import { useEffect, useState } from "react";
import api from "../../services/api.js";

const DEFAULT = { type: "free", cost: 0 };

export function useShippingSettings() {
  const [settings, setSettings] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/shipping")
      .then((res) => setSettings(res.data || DEFAULT))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async (next) => {
    const res = await api.put("/shipping", next);
    setSettings(res.data);
  };

  const shippingCost = settings.type === "free" ? 0 : (settings.cost || 0);

  return { settings, loading, shippingCost, saveSettings };
}
