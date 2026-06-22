"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export default function TransactionActions({ orderId }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(null);

  async function handleAction(action) {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      if (res.ok) router.refresh();
      else {
        const d = await res.json();
        alert(d.error || "Gagal.");
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
        title="Setujui & aktifkan API key"
        className="flex items-center gap-1 px-2 py-1 border border-secondary/30 text-secondary text-2xs font-bold tracking-widest uppercase hover:bg-secondary/10 transition-colors disabled:opacity-40"
      >
        {loading === "approve"
          ? <span className="w-2.5 h-2.5 border border-secondary/30 border-t-secondary rounded-full animate-spin" />
          : <CheckCircle2 size={10} />
        }
        OK
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        title="Tolak order"
        className="flex items-center gap-1 px-2 py-1 border border-red-900/50 text-red-500 text-2xs font-bold tracking-widest uppercase hover:bg-red-950/30 transition-colors disabled:opacity-40"
      >
        {loading === "reject"
          ? <span className="w-2.5 h-2.5 border border-red-900/30 border-t-red-500 rounded-full animate-spin" />
          : <XCircle size={10} />
        }
        TOLAK
      </button>
    </div>
  );
}
