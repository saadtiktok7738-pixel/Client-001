import { useEffect } from "react";
import api from "../../services/api.js";

const HEARTBEAT_MS = 25000;
const SESSION_KEY = "mslal_visitor_id";

function getOrCreateVisitorId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
}

export function usePresence() {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const beat = () => {
      api.post("/presence", { visitorId }).catch(() => {});
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
