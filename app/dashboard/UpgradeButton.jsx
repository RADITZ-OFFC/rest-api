"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function UpgradeButton({ plan, planName, price }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/upgrade", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat upgrade request.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        <span className="text-xs text-secondary font-medium">
          Request terkirim — menunggu konfirmasi admin.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="btn-primary w-full justify-center text-sm disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <>
            Upgrade to {planName}
            <ArrowRight size={13} />
          </>
        )}
      </button>
      <p className="text-xs text-text-faint text-center">
        Rp {price.toLocaleString("id-ID")}/month · confirmed manually by admin
      </p>
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
