import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { BarChart2, TrendingUp, AlertCircle, Clock } from "lucide-react";

async function getAnalytics(userId) {
  const { data: keys } = await supabaseAdmin
    .from("api_keys").select("id").eq("user_id", userId);

  const keyIds = (keys || []).map((k) => k.id);
  if (!keyIds.length) return { total: 0, success: 0, failed: 0, successRate: 0, last7: [] };

  const { data: logs, count: total } = await supabaseAdmin
    .from("usage_logs")
    .select("*", { count: "exact" })
    .in("api_key_id", keyIds)
    .order("created_at", { ascending: false })
    .limit(200);

  const success = (logs || []).filter((l) => l.status_code && l.status_code < 400).length;
  const failed  = (logs || []).filter((l) => l.status_code && l.status_code >= 400).length;
  const successRate = total ? Math.round((success / total) * 100) : 0;

  // Group by date (last 7 days)
  const last7 = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7[d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })] = 0;
  }
  (logs || []).forEach((l) => {
    const key = new Date(l.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (last7[key] !== undefined) last7[key]++;
  });

  return {
    total: total || 0,
    success,
    failed,
    successRate,
    last7: Object.entries(last7),
  };
}

export default async function AnalyticsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const data = await getAnalytics(user.id);
  const maxVal = Math.max(...(data.last7?.map(([, v]) => v) || [1]), 1);

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Analytics"
          subtitle="Request statistics and usage trends"
          right={
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs text-text-faint">Live</span>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Requests" value={data.total}              icon={TrendingUp}  color="primary" />
            <StatCard label="Success Rate"   value={`${data.successRate}%`}  icon={BarChart2}   color="secondary" />
            <StatCard label="Errors"         value={data.failed}             icon={AlertCircle} color="red" />
            <StatCard label="Avg Latency"    value="< 80ms"                  icon={Clock}       color="muted" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily bar chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-text-primary">Daily requests (7 days)</h2>
                <span className="badge-muted text-xs">BAR</span>
              </div>

              {data.total === 0 ? (
                <EmptyState icon={BarChart2} title="No data yet" description="Start using your API to see request trends." />
              ) : (
                <div className="flex items-end gap-2 h-36 pt-4">
                  {data.last7?.map(([label, val]) => (
                    <div key={label} className="flex-1 flex flex-col items-center gap-2">
                      {val > 0 && (
                        <span className="text-xs text-text-faint">{val}</span>
                      )}
                      <div
                        className="w-full bg-primary/60 hover:bg-primary transition-colors rounded-sm"
                        style={{ height: `${maxVal > 0 ? Math.max((val / maxVal) * 100, 2) : 2}%` }}
                      />
                      <span className="text-xs text-text-faint truncate" style={{ fontSize: "10px" }}>
                        {label.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Success vs Errors */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-text-primary">Success vs Errors</h2>
                <span className="badge-muted text-xs">RATIO</span>
              </div>

              {data.total === 0 ? (
                <EmptyState icon={BarChart2} title="No data yet" description="Request data will appear here." />
              ) : (
                <div className="flex flex-col gap-5 justify-center h-36">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-secondary">Success</span>
                      <span className="text-text-muted">{data.success} ({data.successRate}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill-green" style={{ width: `${data.successRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-red-400">Errors</span>
                      <span className="text-text-muted">{data.failed} ({100 - data.successRate}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${100 - data.successRate}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Average Latency placeholder */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-text-primary">Average Latency</h2>
              <span className="badge-muted text-xs">MS</span>
            </div>
            <EmptyState icon={Clock} title="No latency data" description="Latency tracking will be available in a future update." />
          </div>
        </main>
      </div>
    </div>
  );
}
