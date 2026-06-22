import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getPlan } from "@/lib/plans";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Activity, Zap, TrendingUp, TrendingDown } from "lucide-react";

async function getUsageData(userId) {
  const { data: keys } = await supabaseAdmin
    .from("api_keys")
    .select("id, quota_total, quota_used, products(name)")
    .eq("user_id", userId);

  const totalCredits = (keys || []).reduce((s, k) => s + k.quota_total, 0);
  const usedCredits  = (keys || []).reduce((s, k) => s + k.quota_used, 0);
  const remaining    = Math.max(0, totalCredits - usedCredits);

  const { data: logs, count: totalRequests } = await supabaseAdmin
    .from("usage_logs")
    .select("status_code", { count: "exact" })
    .in("api_key_id", (keys || []).map((k) => k.id))
    .limit(500);

  const success = (logs || []).filter((l) => l.status_code && l.status_code < 400).length;
  const failed  = (logs || []).filter((l) => l.status_code && l.status_code >= 400).length;

  return {
    totalCredits,
    usedCredits,
    remaining,
    totalRequests: totalRequests || 0,
    success,
    failed,
    keys: keys || [],
  };
}

export default async function UsagePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const data    = await getUsageData(user.id);
  const plan    = getPlan(user.role);
  const pct     = data.totalCredits > 0
    ? Math.round((data.remaining / data.totalCredits) * 100)
    : 100;

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Usage"
          subtitle="Credit consumption and request statistics"
          right={
            <span className={`text-xs font-semibold ${plan.color}`}>
              Plan: {plan.name}
            </span>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Credit balance */}
          <div className="card border border-primary/20">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs text-text-faint font-medium mb-1">Credit balance</p>
                <p className="text-4xl font-bold text-primary">
                  {data.remaining.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-text-faint mt-1">
                  of {data.totalCredits.toLocaleString("id-ID")} total capacity
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-faint mb-1">Daily limit</p>
                <p className="text-sm font-semibold text-text-primary">
                  {plan.credits.toLocaleString("id-ID")} / day
                </p>
              </div>
            </div>
            <div className="progress-bar h-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  pct < 20 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "progress-fill"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-text-faint">{100 - pct}% used</span>
              <span className={`font-medium ${pct < 20 ? "text-red-400" : "text-text-muted"}`}>
                {pct}% remaining
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Requests" value={data.totalRequests}  icon={Activity}     color="primary" />
            <StatCard label="Successful"     value={data.success}        icon={TrendingUp}   color="secondary" />
            <StatCard label="Failed"         value={data.failed}         icon={TrendingDown} color="red" />
            <StatCard label="Credits Used"   value={data.usedCredits.toLocaleString("id-ID")} icon={Zap} color="muted" />
          </div>

          {/* Per key breakdown */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-5">Usage per key</h2>

            {data.keys.length === 0 ? (
              <EmptyState icon={Activity} title="No API keys" description="Create an API key to start tracking usage." />
            ) : (
              <div className="flex flex-col gap-5">
                {data.keys.map((k) => {
                  const kPct = k.quota_total > 0 ? Math.round((k.quota_used / k.quota_total) * 100) : 0;
                  return (
                    <div key={k.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-text-primary">
                          {k.products?.name || "API Key"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {k.quota_used.toLocaleString()} / {k.quota_total.toLocaleString()} req
                        </p>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={kPct >= 80 ? "h-full rounded-full bg-amber-500 transition-all" : "progress-fill"}
                          style={{ width: `${kPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
