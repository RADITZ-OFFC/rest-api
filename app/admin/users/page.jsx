import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

async function getUsers() {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function AdminUsersPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") redirect("/login");

  const users = await getUsers();

  return (
    <DashboardLayout user={user} role="admin">
      <PageHeader title="KELOLA USER" breadcrumb="APISTORE — ADMIN / USERS" right={<span className="text-2xs font-bold tracking-widest uppercase text-text-faint">{users.length} USERS</span>} />
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <SectionHeader num={1} title="DAFTAR USER" right={`${users.filter((u) => u.role === "user").length} MEMBER`} />
        <div className="card">
          {users.length === 0 ? (
            <EmptyState icon={Users} title="BELUM ADA USER" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ROLE</th>
                    <th>BERGABUNG</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-primary">
                              {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-text-primary">{u.name || "—"}</p>
                            <p className="text-2xs text-text-faint">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`text-2xs font-black tracking-widest uppercase ${u.role === "admin" ? "text-primary" : "text-text-muted"}`}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs text-text-faint">
                        {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="relative overflow-hidden py-8 border-t border-surface-border mt-8">
          <div className="watermark">APISTORE</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
