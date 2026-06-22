import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import UpgradeActions from "../transactions/UpgradeActions";
import { Crown, Star, Zap } from "lucide-react";

async function getUpgradeOrders(status) {
  let q = supabaseAdmin
    .from("plan_orders")
    .select("*, users(id, name, email, role)")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return data || [];
}

const planIcon  = { premium: Star, super_premium: Crown };
const planColor = { premium: "text-primary", super_premium: "text-secondary" };
const planBg    = { premium: "bg-primary/5 border-primary/20", super_premium: "bg-secondary/5 border-secondary/20" };

const statusBadge = {
  pending:  <span className="badge-pending text-xs">Pending</span>,
  approved: <span className="badge-active text-xs">Approved</span>,
  rejected: <span className="badge-inactive text-xs">Rejected</span>,
};

const roleDisplay = {
  user:          { label: "Free",          color: "text-text-faint" },
  premium:       { label: "Premium",       color: "text-primary" },
  super_premium: { label: "Super Premium", color: "text-secondary" },
  admin:         { label: "Admin",         color: "text-amber-400" },
};

export default async function AdminUpgradePage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const activeStatus = searchParams?.status || "pending";
  const orders = await getUpgradeOrders(activeStatus);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const filters = [
    { label: "Pending",  value: "pending",  count: null },
    { label: "Approved", value: "approved", count: null },
    { label: "Rejected", value: "rejected", count: null },
    { label: "All",      value: "all",      count: null },
  ];

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader
        title="Upgrade Plans"
        subtitle="Review and confirm user plan upgrade requests"
        right={
          pendingCount > 0 ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-400 font-medium">{pendingCount} pending</span>
            </span>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <a
              key={f.value}
              href={`/admin/upgrade?status=${f.value}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                activeStatus === f.value
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-text-muted hover:text-text-primary border-white/[0.06] hover:border-white/10"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Crown}
              title="No upgrade requests"
              description={
                activeStatus === "pending"
                  ? "No pending upgrade requests at the moment."
                  : "No upgrade requests found for this filter."
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const PlanIcon  = planIcon[order.plan] || Zap;
              const color     = planColor[order.plan] || "text-primary";
              const cardStyle = planBg[order.plan] || "bg-surface border-white/[0.06]";
              const curRole   = roleDisplay[order.users?.role] || { label: "Free", color: "text-text-faint" };

              return (
                <div key={order.id} className={`rounded-xl border p-5 ${cardStyle}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Plan info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-11 h-11 rounded-xl border ${cardStyle} flex items-center justify-center shrink-0`}>
                        <PlanIcon size={18} className={color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-bold capitalize ${color}`}>
                            {order.plan.replace("_", " ")}
                          </p>
                          {statusBadge[order.status]}
                        </div>
                        <p className="text-sm font-bold text-primary">
                          Rp {order.price?.toLocaleString("id-ID")} / month
                        </p>
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {order.users?.name || "—"}
                      </p>
                      <p className="text-xs text-text-muted">{order.users?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-faint">Current plan:</span>
                        <span className={`text-xs font-semibold ${curRole.color}`}>
                          {curRole.label}
                        </span>
                        <span className="text-text-faint text-xs">→</span>
                        <span className={`text-xs font-semibold capitalize ${color}`}>
                          {order.plan.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Date & action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-xs text-text-faint">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      {order.status === "pending" ? (
                        <UpgradeActions orderId={order.id} />
                      ) : (
                        <p className="text-xs text-text-faint">
                          {order.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          {order.processed_at && ` · ${new Date(order.processed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* User note */}
                  {order.note && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <p className="text-xs text-text-faint">
                        Note: <span className="text-text-muted">{order.note}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
