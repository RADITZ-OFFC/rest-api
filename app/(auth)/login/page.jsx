"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, User, Zap } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";

  const [form, setForm]        = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
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
      if (!res.ok) { setError(data.error || "Email atau password salah."); return; }
      window.location.href = data.user?.role === "admin" ? "/admin" : redirect;
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 60% 10%, rgba(154,147,211,0.13) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(167,185,96,0.07) 0%, transparent 50%), #0a0a0f",
      }}
    >
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingParticles count={40} />
      </div>

      {/* Dot grid */}
      <div className="fixed inset-0 dot-grid opacity-[0.18] pointer-events-none" />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes iconGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(154,147,211,0.35); }
          50%     { box-shadow: 0 0 0 10px rgba(154,147,211,0); }
        }
        @keyframes borderRotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes btnShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Logo above card */}
      <div className="relative z-10 flex justify-center mb-5"
        style={{ animation: "cardIn 0.35s ease forwards" }}>
        <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(154,147,211,0.15)", border: "1px solid rgba(154,147,211,0.3)" }}>
            <Zap size={13} style={{ color: "#9A93D3" }} />
          </div>
          <span className="text-sm font-bold text-text-primary tracking-tight">ApiStore</span>
        </Link>
      </div>

      {/* Animated gradient border wrapper */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl p-[1px]"
        style={{
          background: "linear-gradient(270deg, #9A93D3, #A197B7, #A7B960, #A197B7, #9A93D3)",
          backgroundSize: "300% 300%",
          animation: "cardIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards, borderRotate 6s ease infinite",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(154,147,211,0.06)",
        }}
      >
        {/* Inner card */}
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
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(154,147,211,0.1)",
                border: "1px solid rgba(154,147,211,0.28)",
                animation: "iconGlow 3s ease-in-out infinite",
              }}
            >
              <User size={26} style={{ color: "#9A93D3" }} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5">Masuk</h1>
            <p className="text-sm text-text-muted">Selamat datang kembali di ApiStore</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input
                name="email" type="email" autoComplete="email" required
                placeholder="email@example.com"
                value={form.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={e => e.target.style.border = "1px solid rgba(154,147,211,0.55)"}
                onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">Password</label>
                <Link href="#" className="text-sm" style={{ color: "#9A93D3" }}>Lupa password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPass ? "text" : "password"}
                  autoComplete="current-password" required
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-faint outline-none transition-all duration-200 pr-12"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.target.style.border = "1px solid rgba(154,147,211,0.55)"}
                  onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
              <div className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0"
                style={{
                  background: remember ? "#9A93D3" : "rgba(255,255,255,0.05)",
                  border: remember ? "1px solid #9A93D3" : "1px solid rgba(255,255,255,0.15)",
                }}>
                {remember && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-text-muted select-none">Ingat saya</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="group w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 mt-1 disabled:opacity-50 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #9A93D3 0%, #8880c4 100%)",
                boxShadow: "0 4px 24px rgba(154,147,211,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "btnShimmer 1.5s ease-in-out infinite",
                }} />
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Masuk...</>
              ) : (
                <><span className="relative z-10">Masuk Sekarang</span><ArrowRight size={15} className="relative z-10" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#9A93D3" }}>
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
