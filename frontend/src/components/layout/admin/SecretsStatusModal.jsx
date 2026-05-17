import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  X,
  RefreshCw,
} from "lucide-react";

//async function fetchConfigStatus() {
//  const token = localStorage.getItem("token");
  //const res = await fetch("/api/admin/config-status", {
  //  headers: { Authorization: `Bearer ${token}` },
//  });
  //if (!res.ok) throw new Error("Failed to fetch config status");
  //return res.json();
//}
async function fetchConfigStatus() {
  const res = await api.get("/admin/config-status");
  return res.data;
}

export default function SecretsStatusModal({ open, onClose }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await fetchConfigStatus();
      setData(result);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!open) return null;

  const required = data?.secrets?.filter((s) => s.required) ?? [];
  const optional = data?.secrets?.filter((s) => !s.required) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-black px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#a8e063]" />
            <h2 className="text-base font-semibold text-white">
              Environment Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status banner */}
        {data && (
          <div
            className={`flex items-center gap-2.5 px-6 py-3 text-sm font-medium ${
              data.healthy
                ? "bg-[#a8e063]/20 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {data.healthy ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                All required secrets are configured — your app is ready.
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                {data.missingCount} required secret
                {data.missingCount > 1 ? "s are" : " is"} missing — some
                features may not work.
              </>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-5">
          {isLoading && (
            <div className="py-8 text-center text-sm text-neutral-400">
              Checking configuration…
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-sm text-red-500">
              Could not load configuration status.
            </div>
          )}

          {data && (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Required
                </p>
                <ul className="space-y-2">
                  {required.map((s) => (
                    <SecretRow key={s.key} secret={s} />
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Optional
                </p>
                <ul className="space-y-2">
                  {optional.map((s) => (
                    <SecretRow key={s.key} secret={s} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4 bg-neutral-50">
          <p className="text-xs text-neutral-400">
            Add secrets via Replit → Secrets tab
          </p>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function SecretRow({ secret }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
      {secret.configured ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      ) : secret.required ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-semibold text-neutral-800">
            {secret.key}
          </span>
          {secret.configured ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              Set
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                secret.required
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {secret.required ? "Missing" : "Not set"}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">{secret.description}</p>
      </div>
    </li>
  );
}
