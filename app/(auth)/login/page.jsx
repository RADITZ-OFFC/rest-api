"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login gagal."); return; }
      window.location.href = data.user?.role === "admin" ? "/admin" : redirect;
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-dark dot-grid flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-surface-border flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-text-primary">APISTORE</span>
        </div>

        {/* Center content */}
        <div>
          <p className="text-2xs font-bold tracking-widest uppercase text-text-faint mb-6">
            PLATFORM / REST API
          </p>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-text-primary mb-3">
            MARKETPLACE
          </h2>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)", color: "transparent" }}>
            REST API
          </h2>
          <p className="text-sm text-text-muted mt-6 max-w-xs leading-relaxed">
            Akses ratusan API siap pakai. Beli kuota, dapat API key,
            langsung integrasikan ke project kamu.
          </p>
        </div>

        {/* Bottom status */}
        <div className="flex items-center gap-2">
          <span className="dot-online" />
          <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">SEMUA SISTEM OPERASIONAL</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="topbar">
          <span>APISTORE — AUTH / LOGIN</span>
          <span>REV 2026</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-6 h-6 bg-primary flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase">APISTORE</span>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-text-primary mb-1">
              MASUK
            </h1>
            <p className="text-xs text-text-muted mb-8 tracking-wider uppercase">
              Masuk ke akun kamu untuk melanjutkan
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="input-label">EMAIL</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="kamu@email.com"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">PASSWORD</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="border border-red-900 bg-red-950/50 px-4 py-3">
                  <p className="text-xs font-bold text-red-500 tracking-wider uppercase">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-xs disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                    MEMPROSES...
                  </span>
                ) : (
                  <><ArrowRight size={13} /> MASUK</>
                )}
              </button>
            </form>

            <p className="text-xs text-text-faint mt-6 tracking-wider uppercase">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary hover:text-primary-light transition-colors">
                DAFTAR SEKARANG
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
