"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ProductFormModal from "./ProductFormModal";

export default function AdminProductRow({ product }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const lowest = product.packages?.sort((a, b) => a.price - b.price)[0];

  async function handleDelete() {
    if (!confirm(`Hapus "${product.name}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else { const d = await res.json(); alert(d.error || "Gagal."); }
    setDeleting(false);
  }

  return (
    <tr>
      <td>
        <p className="text-xs font-bold uppercase tracking-wider text-text-primary">{product.name}</p>
        <p className="text-2xs text-text-faint truncate max-w-[160px]">{product.description}</p>
      </td>
      <td><span className="badge-primary text-2xs">{product.category?.toUpperCase()}</span></td>
      <td className="text-xs text-text-muted">{product.packages?.length || 0}</td>
      <td className="text-sm font-black text-primary">
        {lowest ? `Rp ${lowest.price.toLocaleString("id-ID")}` : "—"}
      </td>
      <td>
        <span className={`text-2xs font-black tracking-widest uppercase ${product.is_active ? "text-secondary" : "text-red-500"}`}>
          {product.is_active ? "AKTIF" : "NONAKTIF"}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <ProductFormModal product={product} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger text-2xs py-1.5 px-2.5 disabled:opacity-40"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </td>
    </tr>
  );
}
