"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ProductFormModal from "./ProductFormModal";

export default function ProductRow({ product }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const lowestPkg = product.packages?.sort((a, b) => a.price - b.price)[0];

  async function handleDelete() {
    if (!confirm(`Hapus produk "${product.name}"? Semua paket akan ikut terhapus.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus produk.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr>
      <td>
        <div>
          <p className="font-medium text-text-primary">{product.name}</p>
          <p className="text-xs text-text-faint truncate max-w-[180px]">
            {product.description}
          </p>
        </div>
      </td>
      <td>
        <span className="badge-primary">{product.category}</span>
      </td>
      <td className="text-text-muted text-sm">
        {product.packages?.length || 0} paket
      </td>
      <td className="text-primary font-semibold text-sm">
        {lowestPkg ? `Rp ${lowestPkg.price.toLocaleString("id-ID")}` : "—"}
      </td>
      <td>
        <span className={product.is_active ? "badge-active" : "badge-inactive"}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-secondary" : "bg-red-400"}`} />
          {product.is_active ? "Aktif" : "Nonaktif"}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <ProductFormModal product={product} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50"
          >
            {deleting ? (
              <span className="w-3 h-3 rounded-full border border-red-400/30 border-t-red-400 animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}
