"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, UserPlus, CheckCircle2, Circle, Zap } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";

export default function RegisterPage() {
  const [form, setForm]        = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  const checks = [
    { label: "Min. 8 karakter", valid: form.password.length >= 8 },
    { label: "Huruf besar",     valid: /[A-Z]/.test(form.password) },
    { label: "Angka",           valid: /[0-9]/.test(form.password) },
  ];

  const allChecks      = checks.every((c) => c.valid);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allChecks)      { setError("Password tidak memenuhi syarat."); return; }
    if (!passwordsMatch) { setError("Password tidak cocok."); return; }
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 70% 5%, rgba(167,185,96,0.12) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(154,147,211,0.09) 0%, transparent 50%), #0a0a0f",
      }}
    >
      <div className="fixed inset-0 pointer-events-none">
        <FloatingParticles count={40} />
      </div>
      <div className="fixed inset-0 dot-grid opacity-[0.18] pointer-events-none" />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes iconGlowGreen {
          0%,100% { box-shadow: 0 0 0 0 rgba(167,185,96,0.35); }
          50%     { box-shadow: 0 0 0 10px rgba(167,185,96,0); }
        }
        @keyframes borderRotateGreen {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes btnShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Logo */}
      <div className="relative z-10 flex justify-center mb-5"
        style={{ animation: "cardIn 0.35s ease forwards" }}>
        <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(167,185,96,0.12)", border: "1px solid rgba(167,185,96,0.3)" }}>
            <Zap size={13} style={{ color: "#A7B960" }} />
          </div>
          <span className="text-sm font-bold text-text-primary tracking-tight">ApiStore</span>
        </Link>
      </div>

      {/* Animated gradient border */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl p-[1px]"
        style={{
          background: "linear-gradient(270deg, #A7B960, #A197B7, #9A93D3, #A197B7, #A7B960)",
          backgroundSize: "300% 300%",
          animation: "cardIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards, borderRotateGreen 6s ease infinite",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(167,185,96,0.05)",
        }}
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(17,16,23,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(167,185,96,0.09)",
                border: "1px solid rgba(167,185,96,0.28)",
                animation: "iconGlowGreen 3s ease-in-out infinite",
              }}>
              <UserPlus size={26} style={{ color: "#A7B960" }} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5">Daftar</h1>
            <p className="text-sm text-text-muted">Buat akun ApiStore gratis sekarang</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Nama Lengkap</label>
              <input name="name" type="text" autoComplete="name" required
                placeholder="John Doe" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={e => e.target.style.border = "1px solid rgba(167,185,96,0.55)"}
                onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input name="email" type="email" autoComplete="email" required
                placeholder="email@example.com" value={form.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={e => e.target.style.border = "1px solid rgba(167,185,96,0.55)"}
                onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"}
                  autoComplete="new-password" required
                  placeholder="••••••••" value={form.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200 pr-12"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.target.style.border = "1px solid rgba(167,185,96,0.55)"}
                  onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength */}
              {form.password && (
                <div>
                  <div className="flex gap-1 mt-2.5">
                    {[0, 1, 2].map((i) => {
                      const count = checks.filter((c) => c.valid).length;
                      return (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: i < count
                              ? count === 3 ? "#A7B960" : count === 2 ? "#9A93D3" : "#f59e0b"
                              : "rgba(255,255,255,0.08)",
                          }} />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-1">
                        {c.valid
                          ? <CheckCircle2 size={11} style={{ color: "#A7B960" }} />
                          : <Circle size={11} className="text-text-faint" />}
                        <span className="text-xs" style={{ color: c.valid ? "#A7B960" : "#4a4760" }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Konfirmasi Password</label>
              <input name="confirm" type={showPass ? "text" : "password"}
                autoComplete="new-password" required
                placeholder="••••••••" value={form.confirm} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: form.confirm
                    ? passwordsMatch ? "1px solid rgba(167,185,96,0.55)" : "1px solid rgba(239,68,68,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={e => { if (!form.confirm || passwordsMatch) e.target.style.border = "1px solid rgba(167,185,96,0.55)"; }}
                onBlur={e => { if (!form.confirm) e.target.style.border = "1px solid rgba(255,255,255,0.08)"; }}
              />
              {form.confirm && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">Password tidak cocok</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit"
              disabled={loading || !allChecks || !passwordsMatch}
              className="group w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 mt-1 disabled:opacity-40 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #A7B960 0%, #96a750 100%)",
                boxShadow: "0 4px 24px rgba(167,185,96,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                color: "#13121a",
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "btnShimmer 1.5s ease-in-out infinite",
                }} />
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: "rgba(19,18,26,0.2)", borderTopColor: "#13121a" }} />
                  <span className="relative z-10">Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Daftar Sekarang</span>
                  <ArrowRight size={15} className="relative z-10" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#9A93D3" }}>
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
