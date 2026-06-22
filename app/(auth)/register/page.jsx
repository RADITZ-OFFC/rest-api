"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const checks = [
    { label: "Minimal 8 karakter", valid: form.password.length >= 8 },
    { label: "Huruf besar",        valid: /[A-Z]/.test(form.password) },
    { label: "Mengandung angka",   valid: /[0-9]/.test(form.password) },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Password tidak cocok."); return; }
    if (form.password.length < 8)       { setError("Password minimal 8 karakter."); return; }

    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registrasi gagal."); return; }
      window.location.href = "/dashboard";
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-dark dot-grid flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-surface-border flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-text-primary">APISTORE</span>
        </div>

        <div>
          <p className="text-2xs font-bold tracking-widest uppercase text-text-faint mb-6">
            DAFTAR GRATIS — TANPA KARTU KREDIT
          </p>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-text-primary mb-3">
            MULAI
          </h2>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)", color: "transparent" }}>
            SEKARANG
          </h2>

          <div className="mt-8 flex flex-col gap-3">
            {[
              "100 kredit gratis saat daftar",
              "1 API key gratis",
              "Akses semua endpoint gratis",
              "Tidak perlu kartu kredit",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-secondary shrink-0" />
                <span className="text-xs text-text-muted tracking-wider uppercase">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="dot-online" />
          <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">SEMUA SISTEM OPERASIONAL</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        <div className="topbar">
          <span>APISTORE — AUTH / REGISTER</span>
          <span>REV 2026</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-6 h-6 bg-primary flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase">APISTORE</span>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-text-primary mb-1">
              DAFTAR
            </h1>
            <p className="text-xs text-text-muted mb-8 tracking-wider uppercase">
              Buat akun gratis dalam 30 detik
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="input-label">NAMA LENGKAP</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input"
                />
              </div>

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
                {form.password && (
                  <div className="mt-2 flex gap-3">
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-1">
                        {c.valid
                          ? <CheckCircle2 size={10} className="text-secondary" />
                          : <Circle size={10} className="text-text-faint" />
                        }
                        <span className="text-2xs text-text-faint uppercase tracking-wider">{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">KONFIRMASI PASSWORD</label>
                <input
                  name="confirm"
                  type={showPass ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input ${form.confirm && form.confirm !== form.password ? "border-red-900" : form.confirm && form.confirm === form.password ? "border-secondary/50" : ""}`}
                />
              </div>

              {error && (
                <div className="border border-red-900 bg-red-950/50 px-4 py-3">
                  <p className="text-xs font-bold text-red-500 tracking-wider uppercase">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-xs disabled:opacity-40 mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                    MENDAFTARKAN...
                  </span>
                ) : (
                  <><ArrowRight size={13} /> DAFTAR SEKARANG</>
                )}
              </button>

              <p className="text-2xs text-text-faint text-center tracking-wider uppercase">
                Dengan mendaftar kamu menyetujui{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              </p>
            </form>

            <p className="text-xs text-text-faint mt-6 tracking-wider uppercase">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
                MASUK DI SINI
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
