"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Key, BarChart2, FileText, Activity, Settings, Package, Users, ShoppingCart, CreditCard, Globe, Bell, LogOut, ChevronRight, Crown } from "lucide-react";

const userLinks = [
  { href: "/dashboard",           label: "Overview",       icon: LayoutDashboard },
  { href: "/dashboard/keys",      label: "API Keys",       icon: Key },
  { href: "/dashboard/endpoints", label: "Endpoints",      icon: Globe },
  { href: "/dashboard/analytics", label: "Analytics",      icon: BarChart2 },
  { href: "/dashboard/logs",      label: "Logs",           icon: FileText },
  { href: "/dashboard/usage",     label: "Usage",          icon: Activity },
  { href: "/dashboard/orders",    label: "Billing",        icon: ShoppingCart },
  { href: "/dashboard/settings",  label: "Settings",       icon: Settings },
];

const userAccountLinks = [
  { href: "/dashboard/profile",       label: "Profile",        icon: Users },
  { href: "/dashboard/notifications", label: "Notifications",  icon: Bell },
];

const adminLinks = [
  { href: "/admin",              label: "Overview",       icon: LayoutDashboard },
  { href: "/admin/products",     label: "Products",       icon: Package },
  { href: "/admin/users",        label: "Users",          icon: Users },
  { href: "/admin/transactions", label: "API Orders",     icon: CreditCard },
  { href: "/admin/upgrade",      label: "Upgrade Plans",  icon: Crown },
  { href: "/admin/stats",        label: "Statistics",     icon: BarChart2 },
];

export default function Sidebar({ user, role = "user" }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  function isActive(href) {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  }

  const mainLinks = role === "admin" ? adminLinks : userLinks;
  const accountLinks = role === "admin" ? [] : userAccountLinks;
  const username = user?.email?.split("@")[0] || "user";
  const initial = username[0]?.toUpperCase() || "U";

  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap size={13} className="text-primary" />
          </div>
          <span className="font-bold text-sm text-text-primary">ApiStore</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 pt-3">
        {/* Main */}
        <div className="flex flex-col gap-0.5">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <div className={active ? "nav-item-active" : "nav-item"}>
                  <Icon size={14} className="shrink-0" />
                  <span className="flex-1">{link.label}</span>
                  {active && <ChevronRight size={12} className="text-primary/50" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Account section */}
        {accountLinks.length > 0 && (
          <>
            <p className="nav-group-label">Account</p>
            <div className="flex flex-col gap-0.5">
              {accountLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <div className={active ? "nav-item-active" : "nav-item"}>
                      <Icon size={14} className="shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      {active && <ChevronRight size={12} className="text-primary/50" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-text-primary truncate">{username}</p>
            <p className="text-xs text-text-faint capitalize">{role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="nav-item text-red-400/60 hover:text-red-400 hover:bg-red-500/5 w-full">
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
