import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import TransactionActions from "./TransactionActions";
import UpgradeActions from "./UpgradeActions";
import { ShoppingCart, Crown } from "lucide-react";

async function getTransactions(status) {
  let q = supabaseAdmin
    .from("orders")
    .select("*, users(id, name, email), packages(name, quota, price, duration_days, products(id, name, category))")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return data || [];
}

async function getUpgradeOrders(status) {
  let q = supabaseAdmin
    .from("plan_orders")
    .select("*, users(id, name, email, role)")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return data || [];
}

const statusColor = { pending: "badge-pending", paid: "badge-active", cancelled: "badge-inactive", approved: "badge-active", rejected: "badge-inactive" };
const statusLabel = { pending: "Pending", paid: "Paid", cancelled: "Cancelled", approved: "Approved", rejected: "Rejected" };

export default async function AdminTransactionsPage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const activeTab    = searchParams?.tab || "api";
  const activeStatus = searchParams?.status || "all";

  const [transactions, upgradeOrders] = await Promise.all([
    getTransactions(activeStatus),
    getUpgradeOrders(activeStatus),
  ]);

  const pendingApiCount     = transactions.filter((t) => t.status === "pending").length;
  const pendingUpgradeCount = upgradeOrders.filter((t) => t.status === "pending").length;

  const tabs = [
    { id: "api",     label: "API Orders",     count: pendingApiCount,     icon: ShoppingCart },
    { id: "upgrade", label: "Upgrade Orders", count: pendingUpgradeCount, icon: Crown },
  ];

  const statusFilters = [
    { label: "All",      value: "all" },
    { label: "Pending",  value: "pending" },
    { label: "Approved / Paid", value: "paid" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader title="Transactions" subtitle="Manage API orders and plan upgrade requests" />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-white/[0.06] pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`/admin/transactions?tab=${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                    {tab.count}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Status filters */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <a
              key={f.value}
              href={`/admin/transactions?tab=${activeTab}&status=${f.value}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeStatus === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-primary border border-white/[0.06] hover:border-white/10"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>

        {/* ── API ORDERS TAB ── */}
        {activeTab === "api" && (
          <div className="card overflow-hidden p-0">
            {transactions.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No transactions" description="API orders will appear here." className="py-12" />
            ) : (
              <>
                <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] bg-surface-card">
                  <div className="col-span-3"><p className="text-xs font-semibold text-text-faint">User</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Product</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Package</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Quota</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Price</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Status</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Date</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Action</p></div>
                </div>
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-12 px-5 py-3.5 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-text-primary truncate">{tx.users?.name || "—"}</p>
                        <p className="text-xs text-text-faint truncate">{tx.users?.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-text-muted truncate">{tx.packages?.products?.name || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-text-faint">{tx.packages?.name || "—"}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-xs font-mono text-text-faint">{tx.packages?.quota?.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm font-semibold text-primary">Rp {tx.total_price?.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="col-span-1">
                        <span className={`${statusColor[tx.status] || "badge-muted"} text-xs`}>
                          {statusLabel[tx.status] || tx.status}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <p className="text-xs text-text-faint">
                          {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="col-span-1">
                        {tx.status === "pending"
                          ? <TransactionActions orderId={tx.id} />
                          : <span className="text-xs text-text-faint">—</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── UPGRADE ORDERS TAB ── */}
        {activeTab === "upgrade" && (
          <div className="card overflow-hidden p-0">
            {upgradeOrders.length === 0 ? (
              <EmptyState icon={Crown} title="No upgrade orders" description="Plan upgrade requests will appear here." className="py-12" />
            ) : (
              <>
                <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] bg-surface-card">
                  <div className="col-span-4"><p className="text-xs font-semibold text-text-faint">User</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Current Plan</p></div>
                  <div className="col-span-2"><p className="text-xs font-semibold text-text-faint">Request Plan</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Price</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Status</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Date</p></div>
                  <div className="col-span-1"><p className="text-xs font-semibold text-text-faint">Action</p></div>
                </div>
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {upgradeOrders.map((uo) => (
                    <div key={uo.id} className="grid grid-cols-12 px-5 py-3.5 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="col-span-4">
                        <p className="text-sm font-medium text-text-primary truncate">{uo.users?.name || "—"}</p>
                        <p className="text-xs text-text-faint truncate">{uo.users?.email}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="badge-muted text-xs capitalize">{uo.users?.role?.replace("_", " ") || "free"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-xs font-semibold capitalize ${uo.plan === "super_premium" ? "text-secondary" : "text-primary"}`}>
                          {uo.plan.replace("_", " ")}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm font-semibold text-primary">Rp {uo.price?.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="col-span-1">
                        <span className={`${statusColor[uo.status] || "badge-muted"} text-xs`}>
                          {statusLabel[uo.status] || uo.status}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <p className="text-xs text-text-faint">
                          {new Date(uo.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="col-span-1">
                        {uo.status === "pending"
                          ? <UpgradeActions orderId={uo.id} />
                          : <span className="text-xs text-text-faint">—</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
