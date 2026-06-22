"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Key } from "lucide-react";

export default function CreateKeyForm({ products, userId }) {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", description: "", productId: "", expiresAt: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Key name is required."); return; }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res  = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create key."); return; }

      setSuccess(data.key?.key || "");
      setForm({ name: "", description: "", productId: "", expiresAt: "" });
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="input-label">Key name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Production App"
            className="input"
          />
        </div>
        <div>
          <label className="input-label">Description (optional)</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What is this key for?"
            className="input"
          />
        </div>
        <div>
          <label className="input-label">Link to product (optional)</label>
          <select name="productId" value={form.productId} onChange={handleChange} className="select">
            <option value="">— None —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Expires at (optional)</label>
          <input
            name="expiresAt"
            type="datetime-local"
            value={form.expiresAt}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
          <p className="text-xs font-semibold text-secondary mb-1">API key created successfully</p>
          <code className="font-mono text-xs text-text-primary break-all select-all">{success}</code>
          <p className="text-xs text-text-faint mt-2">⚠ Copy and save this key now — it won't be shown again in full.</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mb-4">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Creating...
          </span>
        ) : (
          <><Plus size={14} /> Create key</>
        )}
      </button>
    </form>
  );
}
