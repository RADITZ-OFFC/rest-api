"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

export default function BuyPackageForm({ packages, productId, user }) {
  const router = useRouter();
  const [selected, setSelected] = useState(packages[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedPackage = packages.find((p) => p.id === selected);

  async function handleBuy() {
    if (!user) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    if (!selected) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Coba lagi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <div className="w-14 h-14 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-secondary" />
        </div>
        <h3 className="font-semibold text-text-primary">Order Berhasil!</h3>
        <p className="text-sm text-text-muted">
          Order kamu sedang diproses. Admin akan mengkonfirmasi pembayaran dan mengaktifkan API key kamu.
        </p>
        <Link href="/orders" className="btn-primary w-full justify-center mt-2">
          Lihat Riwayat Order
        </Link>
        <Link href="/dashboard" className="btn-ghost w-full justify-center text-sm">
          Ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Package options */}
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => setSelected(pkg.id)}
          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
            selected === pkg.id
              ? "border-primary bg-primary/10 shadow-glow"
              : "border-muted/20 bg-surface-dark hover:border-muted/40"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-text-primary text-sm">{pkg.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {pkg.quota.toLocaleString("id-ID")} request
                {pkg.duration_days ? ` · ${pkg.duration_days} hari` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">
                Rp {pkg.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-text-faint">
                ~Rp {Math.round(pkg.price / pkg.quota).toLocaleString("id-ID")}/req
              </p>
            </div>
          </div>
        </button>
      ))}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Buy button */}
      {user ? (
        <button
          onClick={handleBuy}
          disabled={loading || !selected}
          className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              Memproses...
            </span>
          ) : (
            <>
              <ShoppingCart size={16} />
              Beli Sekarang
            </>
          )}
        </button>
      ) : (
        <Link
          href={`/login?redirect=/products/${productId}`}
          className="btn-primary w-full justify-center mt-2"
        >
          Login untuk Membeli
        </Link>
      )}

      {selectedPackage && (
        <p className="text-xs text-text-faint text-center">
          Konfirmasi pembayaran dilakukan manual oleh admin.
        </p>
      )}
    </div>
  );
}
