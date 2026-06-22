"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function UpgradeActions({ orderId }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(null);

  async function handleAction(action) {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/upgrade", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId, action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal memproses.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        title="Approve & upgrade user"
        className="flex items-center gap-1 px-2 py-1 rounded border border-secondary/30 text-secondary text-xs font-medium hover:bg-secondary/10 transition-colors disabled:opacity-40"
      >
        {loading === "approve"
          ? <span className="w-2.5 h-2.5 border border-secondary/30 border-t-secondary rounded-full animate-spin" />
          : <CheckCircle2 size={11} />}
        OK
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        title="Reject upgrade"
        className="flex items-center gap-1 px-2 py-1 rounded border border-red-900/40 text-red-400 text-xs font-medium hover:bg-red-950/30 transition-colors disabled:opacity-40"
      >
        {loading === "reject"
          ? <span className="w-2.5 h-2.5 border border-red-900/30 border-t-red-400 rounded-full animate-spin" />
          : <XCircle size={11} />}
        ✕
      </button>
    </div>
  );
}
