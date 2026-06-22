import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS, getPlan, isPlanHigher } from "@/lib/plans";
import Sidebar from "@/components/Sidebar";
import MouseGlowCard from "@/components/MouseGlowCard";
import EmptyState from "@/components/EmptyState";
import UpgradeButton from "./UpgradeButton";
import {
  Key, BarChart2, ShoppingCart, ArrowRight,
  CheckCircle2, Zap, Crown, Star, TrendingUp, Package
} from "lucide-react";

async function getDashboardData(userId) {
  const [
    { data: keys },
    { data: recentOrders },
    { count: totalKeys },
    { count: totalOrders },
    { data: products },
    { data: pendingUpgrade },
  ] = await Promise.all([
    supabaseAdmin
      .from("api_keys")
      .select("*, products(id, name, category)")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabaseAdmin
      .from("orders")
      .select("*, packages(name, quota, price, products(name, category))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin
      .from("products")
      .select("*, packages(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabaseAdmin
      .from("plan_orders")
      .select("id, plan, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single(),
  ]);

  const totalQuota = (keys || []).reduce((s, k) => s + k.quota_total, 0);
  const usedQuota  = (keys || []).reduce((s, k) => s + k.quota_used, 0);

  return {
    keys:          keys || [],
    recentOrders:  recentOrders || [],
    totalKeys:     totalKeys || 0,
    totalOrders:   totalOrders || 0,
    products:      products || [],
    credits:       Math.max(0, totalQuota - usedQuota),
    totalQuota,
    pendingUpgrade: pendingUpgrade || null,
  };
}

const catIcon = (c) => ({
  weather:"🌤️", sms:"📱", identity:"🪪",
  finance:"💳", media:"🎬", utility:"🔧",
}[c] || "⚡");

const statusBadge = {
  pending:   <span className="badge-pending text-xs">Pending</span>,
  paid:      <span className="badge-active text-xs">Paid</span>,
  cancelled: <span className="badge-inactive text-xs">Cancelled</span>,
};

const planIcon = {
  user:          <Zap size={14} />,
  premium:       <Star size={14} />,
  super_premium: <Crown size={14} />,
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const d = await getDashboardData(user.id);
  const username   = user.email?.split("@")[0] || "user";
  const currentPlan = getPlan(user.role);

  // Plan cards yang ditampilkan (hanya yang lebih tinggi dari role saat ini)
  const upgradePlans = ["premium", "super_premium"].filter((p) =>
    isPlanHigher(p, user.role)
  );

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Overview</h1>
            <p className="text-xs text-text-faint">Welcome back, {username}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs text-text-faint">Online</span>
            </div>
            {/* Current plan badge */}
            <span className={`${currentPlan.badge} text-xs flex items-center gap-1.5`}>
              {planIcon[user.role]}
              {currentPlan.name}
            </span>
            <Link href="/dashboard/keys" className="btn-primary text-xs py-1.5 px-3">
              New API Key
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Credits",   value: d.credits.toLocaleString("id-ID"), icon: Zap,         glow: "154,147,211", color: "text-primary" },
              { label: "API Keys",  value: d.totalKeys,                       icon: Key,          glow: "167,185,96",  color: "text-secondary" },
              { label: "Orders",    value: d.totalOrders,                     icon: ShoppingCart, glow: "161,151,183", color: "text-muted" },
              { label: "Plan",      value: currentPlan.name,                  icon: TrendingUp,   glow: "167,185,96",  color: "text-secondary" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <MouseGlowCard key={s.label} glowColor={s.glow} innerClass="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-faint font-medium">{s.label}</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                      <Icon size={13} className={s.color} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
                </MouseGlowCard>
              );
            })}
          </div>

          {/* ─────────────────────────────────────
              SEK.01 — UPGRADE PLAN
          ───────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-0.5">Plan</p>
                <h2 className="text-base font-semibold text-text-primary">
                  {upgradePlans.length > 0 ? "Upgrade your plan" : "You're on the highest plan"}
                </h2>
              </div>
              {/* Show current plan label */}
              <span className="text-xs text-text-faint">
                Current: <span className={currentPlan.color}>{currentPlan.name}</span>
              </span>
            </div>

            {/* Pending upgrade notice */}
            {d.pendingUpgrade && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <p className="text-xs text-amber-400">
                  Upgrade ke <span className="font-semibold capitalize">{d.pendingUpgrade.plan.replace("_", " ")}</span> sedang menunggu konfirmasi admin.
                </p>
              </div>
            )}

            {upgradePlans.length === 0 ? (
              /* Already super premium */
              <div className="card border border-secondary/20 bg-secondary/5 flex items-center gap-4 p-5">
                <Crown size={24} className="text-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary">You're on Super Premium</p>
                  <p className="text-sm text-text-muted mt-0.5">Enjoying the highest tier — all features unlocked.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgradePlans.map((planKey) => {
                  const plan = PLANS[planKey];
                  const Icon = planKey === "premium" ? Star : Crown;
                  const hasPending = d.pendingUpgrade?.plan === planKey;
                  return (
                    <MouseGlowCard
                      key={planKey}
                      glowColor={planKey === "premium" ? "154,147,211" : "167,185,96"}
                      innerClass="p-5 flex flex-col gap-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                            <Icon size={16} className={plan.color} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${plan.color}`}>{plan.name}</p>
                            <p className="text-xs text-text-faint">per month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${plan.color}`}>
                            Rp {plan.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="flex flex-col gap-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-text-muted">
                            <CheckCircle2 size={12} className={plan.color} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      {hasPending ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-xs text-amber-400 font-medium">Waiting for confirmation</span>
                        </div>
                      ) : (
                        <UpgradeButton plan={planKey} planName={plan.name} price={plan.price} />
                      )}
                    </MouseGlowCard>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────
              SEK.02 — KATALOG API
          ───────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-0.5">APIs</p>
                <h2 className="text-base font-semibold text-text-primary">Available APIs</h2>
              </div>
              <Link href="/products" className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {d.products.length === 0 ? (
              <div className="card">
                <EmptyState icon={Package} title="No APIs available" description="Check back soon — new APIs are being added." />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {d.products.map((p) => {
                  const lowest = p.packages?.sort((a,b) => a.price - b.price)[0];
                  return (
                    <Link key={p.id} href={`/products/${p.id}`}>
                      <MouseGlowCard glowColor="167,185,96" innerClass="p-4 flex flex-col gap-3 group h-full">
                        <div className="flex items-start justify-between">
                          <span className="text-xl">{catIcon(p.category)}</span>
                          <span className="badge-active text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                          <span className="badge-muted text-xs mt-1">{p.category}</span>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2 flex-1">{p.description}</p>
                        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                          <p className="text-sm font-semibold text-secondary">
                            {lowest ? `Rp ${lowest.price.toLocaleString("id-ID")}` : "Free"}
                          </p>
                          <span className="text-xs text-text-faint group-hover:text-primary transition-colors flex items-center gap-1">
                            Buy <ArrowRight size={10} />
                          </span>
                        </div>
                      </MouseGlowCard>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────
              SEK.03 — RIWAYAT ORDER
          ───────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-0.5">Orders</p>
                <h2 className="text-base font-semibold text-text-primary">Order history</h2>
              </div>
              <Link href="/dashboard/orders" className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {d.recentOrders.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={ShoppingCart}
                  title="No orders yet"
                  description="Your purchases will appear here."
                  action={
                    <Link href="/products" className="btn-primary text-xs">Browse APIs</Link>
                  }
                />
              </div>
            ) : (
              <div className="card overflow-hidden p-0">
                {/* Table header */}
                <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] bg-surface-card">
                  <div className="col-span-4"><p className="text-xs font-semibold text-text-faint">Product</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Package</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Quota</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Price</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Status</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Date</p></div>
                </div>

                {/* Rows */}
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {d.recentOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-12 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="col-span-4 flex items-center gap-2.5">
                        <span className="text-base">{catIcon(order.packages?.products?.category)}</span>
                        <p className="text-sm font-medium text-text-primary truncate">
                          {order.packages?.products?.name || "—"}
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <p className="text-xs text-text-muted">{order.packages?.name || "—"}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <p className="text-xs font-mono text-text-faint">
                          {order.packages?.quota?.toLocaleString("id-ID") || "—"}
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <p className="text-sm font-semibold text-primary">
                          Rp {order.total_price?.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="col-span-1 flex items-center">
                        {statusBadge[order.status] || <span className="badge-muted text-xs">{order.status}</span>}
                      </div>
                      <div className="col-span-1 flex items-center">
                        <p className="text-xs text-text-faint">
                          {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
