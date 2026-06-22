"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileTabs({ profile, activeTab }) {
  const router = useRouter();
  const [tab, setTab] = useState(activeTab || "edit");

  const tabs = [
    { id: "edit",   label: "EDIT PROFIL" },
    { id: "account", label: "AKUN" },
    { id: "danger",  label: "DANGER ZONE" },
  ];

  return (
    <div>
      {/* Tab nav */}
      <div className="flex border-b border-surface-border mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-2xs font-black tracking-widest uppercase border-b-2 transition-colors duration-150 ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Edit Profil */}
      {tab === "edit" && (
        <EditProfileTab profile={profile} onSaved={() => router.refresh()} />
      )}

      {/* Tab: Akun */}
      {tab === "account" && (
        <AccountTab profile={profile} />
      )}

      {/* Tab: Danger Zone */}
      {tab === "danger" && (
        <DangerTab userId={profile?.id} />
      )}
    </div>
  );
}

function EditProfileTab({ profile, onSaved }) {
  const [form, setForm]     = useState({ name: profile?.name || "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res  = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(res.ok ? "Profil berhasil disimpan." : (data.error || "Gagal."));
    setLoading(false);
    if (res.ok) onSaved?.();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleSave} className="card flex flex-col gap-4">
        <div>
          <label className="input-label">USERNAME</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            placeholder="Display name"
            className="input"
          />
          <p className="text-2xs text-text-faint mt-1">Ditampilkan sebagai nama di dashboard</p>
        </div>

        {msg && (
          <p className={`text-xs font-bold tracking-wider uppercase ${msg.includes("berhasil") ? "text-secondary" : "text-red-500"}`}>
            {msg}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={loading} className="btn-primary text-2xs disabled:opacity-40">
            {loading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
          </button>
          <button type="button" onClick={() => setForm({ name: profile?.name || "" })} className="btn-outline text-2xs">
            RESET
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="card">
        <p className="text-2xs font-bold tracking-widest uppercase text-text-muted mb-4">PREVIEW</p>
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-16 h-16 bg-surface-card border border-surface-border flex items-center justify-center">
            <span className="text-2xl font-black text-primary">
              {(form.name || profile?.email || "U")[0]?.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-text-primary">
            {(form.name || profile?.email?.split("@")[0] || "USER").toUpperCase()}
          </p>
          <p className="text-2xs text-text-faint">Belum ada bio</p>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ profile }) {
  const rows = [
    { label: "USER ID",      value: profile?.id?.substring(0, 20) + "..." },
    { label: "EMAIL",        value: profile?.email },
    { label: "USERNAME",     value: profile?.name || "—" },
    { label: "ROLE",         value: profile?.role?.toUpperCase() || "FREE" },
    { label: "STATUS",       value: "ACTIVE", color: "text-secondary" },
    { label: "2FA",          value: "NONAKTIF" },
    { label: "MEMBER SEJAK", value: profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "—" },
  ];

  return (
    <div className="card">
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <div key={row.label} className={`flex items-center justify-between py-3.5 ${i < rows.length - 1 ? "border-b border-surface-border" : ""}`}>
            <span className="text-2xs font-bold tracking-widest uppercase text-text-muted">{row.label}</span>
            <span className={`text-xs font-mono ${row.color || "text-text-primary"}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-surface-border">
        <button className="btn-outline text-2xs">UBAH PASSWORD</button>
        <button className="btn-outline text-2xs">KELOLA 2FA</button>
      </div>
    </div>
  );
}

function DangerTab({ userId }) {
  const [confirming, setConfirming] = useState(null);

  return (
    <div className="card border border-red-900/30">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-900/30">
        <span className="text-red-500 text-lg">⚠</span>
        <div>
          <p className="text-xs font-black tracking-widest uppercase text-red-500">DANGER ZONE</p>
          <p className="text-xs text-text-muted">Tindakan di sini bersifat permanen dan tidak dapat dibatalkan.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 py-4 border-b border-surface-border">
          <div>
            <p className="text-xs font-black tracking-wider uppercase text-text-primary mb-1">RESET SEMUA API KEYS</p>
            <p className="text-xs text-text-muted">
              Hapus semua API key aktif milikmu. Aplikasi yang menggunakan key ini akan berhenti bekerja.
            </p>
          </div>
          <button
            onClick={() => setConfirming("reset")}
            className="btn-outline text-2xs border-red-900 text-red-500 hover:bg-red-950 shrink-0"
          >
            KELOLA
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="text-xs font-black tracking-wider uppercase text-red-500 mb-1">HAPUS AKUN</p>
            <p className="text-xs text-text-muted">
              Hapus akun secara permanen beserta semua data, API key, dan credits. Tidak bisa dipulihkan.
            </p>
          </div>
          <button
            onClick={() => setConfirming("delete")}
            className="btn-danger shrink-0 text-2xs"
          >
            HAPUS AKUN
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mt-4 p-4 border border-red-900/50 bg-red-950/30">
          <p className="text-xs font-bold tracking-wider uppercase text-red-500 mb-3">
            {confirming === "delete" ? "KONFIRMASI HAPUS AKUN" : "KONFIRMASI RESET KEYS"}
          </p>
          <p className="text-xs text-text-muted mb-4">
            {confirming === "delete"
              ? "Akun dan semua data akan dihapus permanen."
              : "Semua API key aktif akan dihapus."}
          </p>
          <div className="flex gap-3">
            <button className="btn-danger text-2xs">KONFIRMASI</button>
            <button onClick={() => setConfirming(null)} className="btn-outline text-2xs">BATAL</button>
          </div>
        </div>
      )}
    </div>
  );
}
