"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2 } from "lucide-react";

const categories = ["weather", "sms", "identity", "finance", "media", "utility"];

export default function ProductFormModal({ product = null }) {
  const router  = useRouter();
  const isEdit  = !!product;
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    name:        product?.name        || "",
    description: product?.description || "",
    category:    product?.category    || "utility",
    base_url:    product?.base_url    || "",
    is_active:   product?.is_active   ?? true,
  });

  const [packages, setPackages] = useState(
    product?.packages?.length > 0
      ? product.packages.map((p) => ({ name: p.name, price: p.price, quota: p.quota, duration_days: p.duration_days || "" }))
      : [{ name: "", price: "", quota: "", duration_days: "" }]
  );

  function handlePkg(idx, field, val) {
    setPackages((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validPkgs = packages.filter((p) => p.name && p.price && p.quota).map((p) => ({
      name: p.name, price: Number(p.price), quota: Number(p.quota),
      duration_days: p.duration_days ? Number(p.duration_days) : null,
    }));

    try {
      const url    = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, packages: validPkgs }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal."); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Koneksi bermasalah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-2xs">
        <Plus size={11} /> {isEdit ? "EDIT" : "TAMBAH PRODUK"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-surface border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border sticky top-0 bg-surface z-10">
              <h2 className="text-xs font-black tracking-widest uppercase">
                {isEdit ? "EDIT PRODUK" : "TAMBAH PRODUK BARU"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-text-faint hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">NAMA PRODUK *</label>
                  <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Weather API" className="input" />
                </div>
                <div>
                  <label className="input-label">KATEGORI *</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="select">
                    {categories.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">DESKRIPSI *</label>
                <textarea required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="input resize-none" />
              </div>
              <div>
                <label className="input-label">BASE URL</label>
                <input value={form.base_url} onChange={(e) => setForm((p) => ({ ...p, base_url: e.target.value }))} placeholder="https://api.example.com/v1" className="input font-mono" />
              </div>
              <div className="flex items-center gap-3">
                <label className="input-label mb-0">STATUS AKTIF</label>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className={`w-10 h-5 relative transition-colors duration-150 ${form.is_active ? "bg-secondary" : "bg-surface-border"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white transition-all duration-150 ${form.is_active ? "left-5.5" : "left-0.5"}`} />
                </button>
                <span className={`text-2xs font-bold uppercase tracking-widest ${form.is_active ? "text-secondary" : "text-text-faint"}`}>
                  {form.is_active ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>

              {/* Packages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="input-label mb-0">PAKET HARGA</label>
                  <button type="button" onClick={() => setPackages((p) => [...p, { name: "", price: "", quota: "", duration_days: "" }])} className="text-2xs font-bold tracking-widest uppercase text-primary hover:underline">
                    + TAMBAH
                  </button>
                </div>
                {packages.map((pkg, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 mb-2 p-3 bg-surface-card border border-surface-border">
                    <div>
                      <label className="input-label">NAMA</label>
                      <input value={pkg.name} onChange={(e) => handlePkg(idx, "name", e.target.value)} placeholder="Starter" className="input text-xs py-2" />
                    </div>
                    <div>
                      <label className="input-label">HARGA (RP)</label>
                      <input type="number" value={pkg.price} onChange={(e) => handlePkg(idx, "price", e.target.value)} placeholder="5000" className="input text-xs py-2" />
                    </div>
                    <div>
                      <label className="input-label">KUOTA</label>
                      <input type="number" value={pkg.quota} onChange={(e) => handlePkg(idx, "quota", e.target.value)} placeholder="100" className="input text-xs py-2" />
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1">
                        <label className="input-label">HARI</label>
                        <input type="number" value={pkg.duration_days} onChange={(e) => handlePkg(idx, "duration_days", e.target.value)} placeholder="30" className="input text-xs py-2" />
                      </div>
                      {packages.length > 1 && (
                        <button type="button" onClick={() => setPackages((p) => p.filter((_, i) => i !== idx))} className="self-end mb-0 p-2 text-red-500 hover:bg-red-950/30">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="text-xs font-bold tracking-wider uppercase text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 justify-center text-2xs">BATAL</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center text-2xs disabled:opacity-40">
                  {loading ? "MENYIMPAN..." : isEdit ? "SIMPAN" : "TAMBAH PRODUK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
