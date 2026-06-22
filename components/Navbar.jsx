"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Zap, Menu, X, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar({ user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const links = [
    { href: "/products",  label: "Plugins" },
    { href: "/docs",      label: "Docs" },
    { href: "/pricing",   label: "Pricing" },
    { href: "/changelog", label: "Changelog" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap size={13} className="text-primary" />
          </div>
          <span className="font-bold text-sm text-text-primary tracking-tight">ApiStore</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-150 ${
                pathname === l.href || pathname.startsWith(l.href)
                  ? "text-text-primary bg-white/5 font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5 transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{user.email?.split("@")[0]}</span>
                <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 bg-surface-card border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                    <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={13} />Dashboard
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                      <LogOut size={13} />Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-surface-dark px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="px-3 py-2.5 text-sm text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/[0.06] pt-3 mt-1 flex gap-2">
            {user ? (
              <Link href="/dashboard" className="btn-primary flex-1 justify-center text-sm"
                onClick={() => setMobileOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-outline flex-1 justify-center text-sm"
                  onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link href="/register" className="btn-primary flex-1 justify-center text-sm"
                  onClick={() => setMobileOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
