import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { Users, Package, ShoppingCart, Key, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";

async function getStats() {
  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: pendingOrders },
    { count: paidOrders },
    { count: cancelledOrders },
    { count: totalKeys },
    { count: activeKeys },
    { data: revenueData },
  ] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabaseAdmin.from("api_keys").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("api_keys").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("orders").select("total_price").eq("status", "paid"),
  ]);
  const totalRevenue = (revenueData || []).reduce((s, o) => s + (o.total_price || 0), 0);
  return { totalUsers: totalUsers || 0, totalProducts: totalProducts || 0, pendingOrders: pendingOrders || 0, paidOrders: paidOrders || 0, cancelledOrders: cancelledOrders || 0, totalKeys: totalKeys || 0, activeKeys: activeKeys || 0, totalRevenue };
}

export default async function AdminStatsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const s = await getStats();
  const totalOrders = s.pendingOrders + s.paidOrders + s.cancelledOrders;

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader title="STATISTIK" breadcrumb="APISTORE — ADMIN / STATISTIK" />
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <SectionHeader num={1} title="RINGKASAN PLATFORM" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-border mb-8">
          <StatCard label="TOTAL USER"    value={s.totalUsers}    color="primary" />
          <StatCard label="PRODUK AKTIF"  value={s.totalProducts}  color="secondary" />
          <StatCard label="API KEY AKTIF" value={s.activeKeys}     color="primary" />
          <StatCard label="TOTAL REVENUE" value={`Rp ${(s.totalRevenue/1000).toFixed(0)}rb`} color="secondary" />
        </div>

        <SectionHeader num={2} title="ORDER BREAKDOWN" />
        <div className="card mb-8">
          <div className="flex flex-col gap-4">
            {[
              { label: "LUNAS",   value: s.paidOrders,      color: "bg-secondary", textColor: "text-secondary" },
              { label: "PENDING", value: s.pendingOrders,   color: "bg-yellow-500", textColor: "text-yellow-500" },
              { label: "BATAL",   value: s.cancelledOrders, color: "bg-red-500",    textColor: "text-red-500" },
            ].map((item) => {
              const pct = totalOrders > 0 ? Math.round((item.value / totalOrders) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-2xs mb-1.5">
                    <span className={`font-black tracking-widest uppercase ${item.textColor}`}>{item.label}</span>
                    <span className="text-text-muted font-bold">{item.value} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden py-8 border-t border-surface-border">
          <div className="watermark">APISTORE</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
