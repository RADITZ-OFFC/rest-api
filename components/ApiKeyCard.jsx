"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Key, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function ApiKeyCard({ apiKey }) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quotaPercent = Math.round((apiKey.quota_used / apiKey.quota_total) * 100);
  const isLow = quotaPercent >= 80;
  const isExpired = mounted && apiKey.expires_at && new Date(apiKey.expires_at) < new Date();

  function handleCopy() {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function maskKey(key) {
    if (!key) return "";
    return key.substring(0, 8) + "••••••••••••••••" + key.slice(-4);
  }

  function formatNumber(n) {
    return n?.toLocaleString("id-ID") ?? "0";
  }

  function formatDate(dateStr) {
    if (!mounted || !dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="card border border-muted/20 hover:border-primary/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Key size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {apiKey.product?.name || "API Product"}
            </h3>
            <p className="text-xs text-text-faint mt-0.5">
              Dibuat {mounted ? new Date(apiKey.created_at).toLocaleDateString("id-ID") : ""}
            </p>
          </div>
        </div>
        <span className={isExpired || !apiKey.is_active ? "badge-inactive" : "badge-active"}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", isExpired || !apiKey.is_active ? "bg-red-400" : "bg-secondary")} />
          {isExpired ? "Expired" : apiKey.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* API Key display */}
      <div className="bg-surface-dark rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-4 border border-muted/10">
        <code className="text-sm text-text-muted font-mono flex-1 truncate">
          {showKey ? apiKey.key : maskKey(apiKey.key)}
        </code>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-text-faint hover:text-text-muted transition-colors px-2 py-1 rounded-lg hover:bg-surface-card"
          >
            {showKey ? "Hide" : "Show"}
          </button>
          <button
            onClick={handleCopy}
            className="text-text-faint hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
          >
            {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Quota progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-faint">Kuota terpakai</span>
          <span className={clsx("font-semibold", isLow ? "text-yellow-400" : "text-text-muted")}>
            {apiKey.quota_used.toLocaleString("id-ID")} / {apiKey.quota_total.toLocaleString("id-ID")} request
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={clsx(
              "progress-fill",
              isLow ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""
            )}
            style={{ width: `${Math.min(quotaPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Low quota warning */}
      {isLow && !isExpired && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertCircle size={13} className="text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-400">
            Kuota hampir habis ({quotaPercent}%). Segera beli paket baru.
          </p>
        </div>
      )}

      {/* Expired date */}
      {apiKey.expires_at && (
        <p className="text-xs text-text-faint mt-3">
          Expired:{" "}
          <span className={isExpired ? "text-red-400" : "text-text-muted"}>
            {formatDate(apiKey.expires_at)}
          </span>
        </p>
      )}
    </div>
  );
}
