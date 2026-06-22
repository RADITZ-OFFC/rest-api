import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getPlan } from "@/lib/plans";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import ProfileTabs from "./ProfileTabs";
import { Crown, Star, Zap } from "lucide-react";

async function getUserProfile(userId) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("id", userId)
    .single();
  return data;
}

async function getUserStats(userId) {
  const [{ count: keys }, { count: orders }] = await Promise.all([
    supabaseAdmin.from("api_keys").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  return { keys: keys || 0, orders: orders || 0 };
}

const planIcon = { user: Zap, premium: Star, super_premium: Crown };

export default async function ProfilePage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const [profile, stats] = await Promise.all([getUserProfile(user.id), getUserStats(user.id)]);
  const plan    = getPlan(profile?.role || "user");
  const PlanIcon = planIcon[profile?.role || "user"];
  const tab     = searchParams?.tab || "edit";

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader title="Profile" subtitle="Manage your account settings" />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Profile header card */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-muted/30 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-primary">
                  {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary">
                  {profile?.name || profile?.email?.split("@")[0]}
                </h2>
                <p className="text-sm text-text-muted">{profile?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`${plan.badge} text-xs flex items-center gap-1.5`}>
                    <PlanIcon size={11} />
                    {plan.name}
                  </span>
                  <span className="badge-active text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Active
                  </span>
                  <span className="text-xs text-text-faint">
                    Member since {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Upgrade CTA */}
              {profile?.role !== "super_premium" && (
                <a href="/dashboard" className="btn-primary text-xs py-2 px-4 shrink-0">
                  ✦ Upgrade plan
                </a>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/[0.06]">
              {[
                { label: "API Keys",   value: stats.keys },
                { label: "Orders",     value: stats.orders },
                { label: "Plan",       value: plan.name,   color: plan.color },
                { label: "2FA",        value: "Off",       color: "text-text-faint" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl font-bold ${s.color || "text-text-primary"}`}>{s.value}</p>
                  <p className="text-xs text-text-faint mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <ProfileTabs profile={profile} activeTab={tab} />
        </main>
      </div>
    </div>
  );
}
