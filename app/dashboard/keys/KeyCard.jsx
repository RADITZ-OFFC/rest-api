"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";

export default function KeyCard({ apiKey }) {
  const router = useRouter();
  const [copied,   setCopied]   = useState(false);
  const [show,     setShow]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pct       = apiKey.quota_total > 0 ? Math.round((apiKey.quota_used / apiKey.quota_total) * 100) : 0;
  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
  const isLow     = pct >= 80;

  function handleCopy() {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Delete key "${apiKey.name || apiKey.key.substring(0, 12)}..."?`)) return;
    setDeleting(true);
    await fetch(`/api/keys/${apiKey.id}`, { method: "DELETE" });
    router.refresh();
  }

  const maskKey = (k) => k ? k.substring(0, 10) + "•".repeat(12) + k.slice(-4) : "";

  return (
    <div className={`card border transition-all duration-200 ${
      !apiKey.is_active || isExpired
        ? "border-red-900/20 opacity-60"
        : isLow
        ? "border-amber-500/20"
        : "border-white/[0.06] hover:border-white/10"
    }`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <p className="text-sm font-semibold text-text-primary">
              {apiKey.name || apiKey.products?.name || "API Key"}
            </p>
            {isExpired || !apiKey.is_active ? (
              <span className="badge-inactive text-xs">Inactive</span>
            ) : (
              <span className="badge-active text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Active
              </span>
            )}
            {isLow && !isExpired && (
              <span className="badge-pending text-xs flex items-center gap-1">
                <AlertTriangle size={10} /> Low quota
              </span>
            )}
          </div>

          {/* Key value */}
          <div className="flex items-center gap-2 mb-3">
            <code className="font-mono text-xs text-text-faint flex-1 truncate bg-surface-card rounded px-2.5 py-1.5">
              {show ? apiKey.key : maskKey(apiKey.key)}
            </code>
            <button
              onClick={() => setShow(!show)}
              className="text-text-faint hover:text-text-muted transition-colors p-1.5 rounded hover:bg-white/5"
            >
              {show ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              onClick={handleCopy}
              className="text-text-faint hover:text-primary transition-colors p-1.5 rounded hover:bg-primary/10"
            >
              {copied ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Quota progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-faint">Quota used</span>
              <span className={`font-medium ${isLow ? "text-amber-400" : "text-text-muted"}`}>
                {apiKey.quota_used.toLocaleString()} / {apiKey.quota_total.toLocaleString()} req
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={isLow ? "h-full rounded-full bg-amber-500 transition-all duration-700" : "progress-fill"}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-2 shrink-0 items-end">
          {apiKey.products?.name && (
            <p className="text-xs text-text-faint">{apiKey.products.name}</p>
          )}
          {apiKey.expires_at && (
            <p className={`text-xs ${isExpired ? "text-red-400" : "text-text-faint"}`}>
              Expires {new Date(apiKey.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          <p className="text-xs text-text-faint">
            Created {new Date(apiKey.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger text-xs py-1.5 px-3 mt-1"
          >
            <Trash2 size={12} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
