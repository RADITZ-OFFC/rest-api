import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ShoppingCart, ArrowRight } from "lucide-react";

async function getOrders(userId) {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("*, packages(name, quota, price, duration_days, products(id, name, category))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
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

export default async function OrdersPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const orders = await getOrders(user.id);
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Billing"
          subtitle={`${orders.length} total orders · ${pending} pending confirmation`}
          right={
            <Link href="/products" className="btn-primary text-xs py-1.5 px-3">
              Buy more <ArrowRight size={13} />
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Pending notice */}
          {pending > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <p className="text-xs text-amber-400 font-medium">
                {pending} order{pending > 1 ? "s" : ""} waiting for admin confirmation.
              </p>
            </div>
          )}

          {/* Orders list */}
          {orders.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="Your API purchases will appear here."
                action={
                  <Link href="/products" className="btn-primary text-xs">
                    Browse APIs
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order.id} className="card hover:border-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Product info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-surface-card border border-white/[0.06] flex items-center justify-center text-xl shrink-0">
                        {catIcon(order.packages?.products?.category)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {order.packages?.products?.name || "—"}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {order.packages?.name} · {order.packages?.quota?.toLocaleString("id-ID")} requests
                          {order.packages?.duration_days ? ` · ${order.packages.duration_days} days` : ""}
                        </p>
                        <p className="text-xs text-text-faint mt-0.5 font-mono">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Price & status */}
                    <div className="flex items-center gap-4 shrink-0">
                      <p className="text-base font-bold text-primary">
                        Rp {order.total_price?.toLocaleString("id-ID")}
                      </p>
                      {statusBadge[order.status] || <span className="badge-muted text-xs">{order.status}</span>}
                      <p className="text-xs text-text-faint">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Pending info */}
                  {order.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <p className="text-xs text-amber-400">
                        ⏳ Waiting for admin confirmation. Usually processed within 24 hours.
                      </p>
                    </div>
                  )}

                  {/* Paid — show API key link */}
                  {order.status === "paid" && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <p className="text-xs text-secondary">✓ Payment confirmed — API key is active.</p>
                      <Link href="/dashboard/keys" className="text-xs text-primary hover:underline">
                        View key →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
