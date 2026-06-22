import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Notifications"
          subtitle="Order updates and system alerts"
          right={<span className="text-xs text-text-faint">All caught up</span>}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="card">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="Order confirmations and alerts will appear here."
            />
          </div>
        </main>
      </div>
    </div>
  );
}
