import { useData } from "../contexts/DataContext.jsx";
import { WifiOff, AlertCircle } from "lucide-react";

export function OfflineBanner() {
  const { offline, errorMessage } = useData();

  if (!offline && !errorMessage) return null;

  const isQuota = errorMessage?.includes("quota");

  return (
    <div
      className={`w-full text-xs px-4 py-2 flex items-center gap-2 ${
        isQuota
          ? "bg-red-50 text-red-700 border-b border-red-200"
          : "bg-yellow-50 text-yellow-800 border-b border-yellow-200"
      }`}
      role="alert"
    >
      {isQuota ? <AlertCircle size={13} /> : <WifiOff size={13} />}
      <span>
        {errorMessage ?? "You are offline. Showing cached data."}
      </span>
    </div>
  );
}