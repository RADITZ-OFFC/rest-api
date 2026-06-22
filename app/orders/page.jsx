import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ShoppingCart, Package } from "lucide-react";

async function getUserOrders(userId) {
  const { data } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      packages (
        name, quota, price, duration_days,
        products ( id, name, category )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

const statusColor = {
  pending: "badge-pending",
  paid: "badge-active",
  cancelled: "badge-inactive",
};

const statusLabel = {
  pending: "Menunggu Konfirmasi",
  paid: "Lunas",
  cancelled: "Dibatalkan",
};

const categoryIcon = {
  weather: "🌤️", sms: "📱", identity: "🪪",
  finance: "💳", media: "🎬", utility: "🔧", default: "⚡",
};

export default async function OrdersPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const orders = await getUserOrders(user.id);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar role="user" user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <PageHeader
          title="Riwayat Order"
          subtitle={`${orders.length} total order · ${pendingCount} menunggu konfirmasi`}
          action={
            <Link href="/products" className="btn-primary text-sm">
              <Package size={14} />
              Order Baru
            </Link>
          }
        />

        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Belum ada order"
            description="Order pertama kamu akan muncul di sini setelah kamu membeli paket API."
            action={
              <Link href="/products" className="btn-primary">
                <Package size={14} /> Browse Produk
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const icon =
                categoryIcon[order.packages?.products?.category] || categoryIcon.default;
              return (
                <div
                  key={order.id}
                  className="card border border-muted/20 hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Product info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-dark border border-muted/20 flex items-center justify-center text-2xl shrink-0">
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {order.packages?.products?.name || "Produk"}
                        </p>
                        <p className="text-sm text-text-muted">
                          Paket: {order.packages?.name} ·{" "}
                          {order.packages?.quota?.toLocaleString("id-ID")} request
                          {order.packages?.duration_days
                            ? ` · ${order.packages.duration_days} hari`
                            : ""}
                        </p>
                        <p className="text-xs text-text-faint mt-0.5">
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Price + status */}
                    <div className="flex flex-col md:items-end gap-2 md:shrink-0">
                      <p className="text-lg font-bold text-primary">
                        Rp {order.total_price?.toLocaleString("id-ID")}
                      </p>
                      <span className={statusColor[order.status] || "badge-inactive"}>
                        {statusLabel[order.status] || order.status}
                      </span>
                      <p className="text-xs text-text-faint">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Pending notice */}
                  {order.status === "pending" && (
                    <div className="mt-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-400">
                      ⏳ Order kamu sedang menunggu konfirmasi admin. Biasanya
                      diproses dalam 1x24 jam.
                    </div>
                  )}

                  {/* Paid notice */}
                  {order.status === "paid" && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-secondary">
                        ✅ API key sudah aktif di dashboard kamu.
                      </p>
                      <Link
                        href="/dashboard/keys"
                        className="text-xs text-primary hover:underline"
                      >
                        Lihat API Key →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
