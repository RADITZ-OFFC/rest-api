import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import KeyCard from "./KeyCard";
import CreateKeyForm from "./CreateKeyForm";
import { Key, Plus, ShoppingCart } from "lucide-react";

async function getUserKeys(userId) {
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("*, products(id, name, category, base_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

async function getUserProducts(userId) {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("product_id, packages(products(id, name))")
    .eq("user_id", userId)
    .eq("status", "paid");

  const seen = new Set();
  const products = [];
  (orders || []).forEach((o) => {
    const p = o.packages?.products;
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      products.push(p);
    }
  });
  return products;
}

export default async function KeysPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const [keys, products] = await Promise.all([
    getUserKeys(user.id),
    getUserProducts(user.id),
  ]);

  const activeKeys   = keys.filter((k) => k.is_active);
  const inactiveKeys = keys.filter((k) => !k.is_active);

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="API Keys"
          subtitle={`${activeKeys.length} active · ${inactiveKeys.length} inactive`}
          right={
            <Link href="/products" className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5">
              <ShoppingCart size={13} /> Buy more quota
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Create key form */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Create new key</h2>
            <CreateKeyForm products={products} userId={user.id} />
          </div>

          {/* Keys list */}
          {keys.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Key}
                title="No API keys yet"
                description="Create your first key above, or buy an API package to get started."
                action={
                  <Link href="/products" className="btn-primary text-xs">
                    Browse APIs
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Active */}
              {activeKeys.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <p className="text-xs font-semibold text-text-muted">Active keys ({activeKeys.length})</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {activeKeys.map((k) => <KeyCard key={k.id} apiKey={k} />)}
                  </div>
                </div>
              )}

              {/* Inactive */}
              {inactiveKeys.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-faint" />
                    <p className="text-xs font-semibold text-text-faint">Inactive keys ({inactiveKeys.length})</p>
                  </div>
                  <div className="flex flex-col gap-3 opacity-60">
                    {inactiveKeys.map((k) => <KeyCard key={k.id} apiKey={k} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
