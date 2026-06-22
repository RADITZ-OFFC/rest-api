import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import TransactionActions from "./transactions/TransactionActions";
import UpgradeActions from "./transactions/UpgradeActions";
import { ShoppingCart, ArrowRight, Users, Package, Key, TrendingUp, Crown } from "lucide-react";

async function getAdminData() {
  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: pendingOrders },
    { count: paidOrders },
    { count: activeKeys },
    { data: revenueData },
    { data: recentOrders },
    { count: pendingUpgrades },
    { data: recentUpgrades },
  ] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).neq("role", "admin"),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
    supabaseAdmin.from("api_keys").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("orders").select("total_price").eq("status", "paid"),
    supabaseAdmin
      .from("orders")
      .select("*, users(name, email), packages(name, quota, price, products(name, category))")
      .order("created_at", { ascending: false })
      .limit(8),
    supabaseAdmin.from("plan_orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin
      .from("plan_orders")
      .select("*, users(name, email, role)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (revenueData || []).reduce((s, o) => s + (o.total_price || 0), 0);

  return {
    totalUsers:     totalUsers     || 0,
    totalProducts:  totalProducts  || 0,
    pendingOrders:  pendingOrders  || 0,
    paidOrders:     paidOrders     || 0,
    activeKeys:     activeKeys     || 0,
    totalRevenue,
    recentOrders:   recentOrders   || [],
    pendingUpgrades: pendingUpgrades || 0,
    recentUpgrades: recentUpgrades  || [],
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

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const d = await getAdminData();

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader
        title="Overview"
        subtitle="Platform summary and pending actions"
        right={
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-text-faint">Online</span>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Total Users"     value={d.totalUsers}    icon={Users}       color="primary" />
          <StatCard label="Active Products" value={d.totalProducts} icon={Package}     color="secondary" />
          <StatCard label="Active Keys"     value={d.activeKeys}    icon={Key}         color="muted" />
          <StatCard label="Orders Paid"     value={d.paidOrders}    icon={ShoppingCart} color="secondary" />
          <StatCard
            label="Revenue"
            value={`Rp ${(d.totalRevenue / 1000).toFixed(0)}k`}
            icon={TrendingUp}
            color="primary"
          />
        </div>

        {/* Alert banners */}
        <div className="flex flex-col gap-3">
          {d.pendingOrders > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <p className="text-xs text-amber-400 font-medium">
                  {d.pendingOrders} API order{d.pendingOrders > 1 ? "s" : ""} waiting for confirmation
                </p>
              </div>
              <Link href="/admin/transactions" className="btn-primary text-xs py-1.5 px-3">
                Review <ArrowRight size={11} />
              </Link>
            </div>
          )}

          {d.pendingUpgrades > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2.5">
                <Crown size={13} className="text-primary shrink-0" />
                <p className="text-xs text-primary font-medium">
                  {d.pendingUpgrades} plan upgrade request{d.pendingUpgrades > 1 ? "s" : ""} waiting for confirmation
                </p>
              </div>
              <Link href="/admin/upgrade" className="btn-primary text-xs py-1.5 px-3">
                Review <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent API orders */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-text-primary">Recent API orders</h2>
              <Link href="/admin/transactions" className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {d.recentOrders.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No orders yet" />
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {d.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="text-lg shrink-0">{catIcon(order.packages?.products?.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {order.users?.name || order.users?.email?.split("@")[0] || "—"}
                      </p>
                      <p className="text-xs text-text-faint truncate">
                        {order.packages?.products?.name} · {order.packages?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        Rp {order.total_price?.toLocaleString("id-ID")}
                      </span>
                      {statusBadge[order.status]}
                      {order.status === "pending" && (
                        <TransactionActions orderId={order.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending upgrade requests */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-text-primary">Upgrade requests</h2>
              <Link href="/admin/upgrade" className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {d.recentUpgrades.length === 0 ? (
              <EmptyState icon={Crown} title="No pending upgrades" description="Plan upgrade requests will appear here." />
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {d.recentUpgrades.map((upg) => (
                  <div key={upg.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Crown size={14} className={upg.plan === "super_premium" ? "text-secondary" : "text-primary"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {upg.users?.name || upg.users?.email?.split("@")[0] || "—"}
                      </p>
                      <p className="text-xs text-text-faint">
                        {upg.users?.role?.replace("_", " ") || "free"} →{" "}
                        <span className={upg.plan === "super_premium" ? "text-secondary" : "text-primary"}>
                          {upg.plan.replace("_", " ")}
                        </span>
                        {" · "}Rp {upg.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <UpgradeActions orderId={upg.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
