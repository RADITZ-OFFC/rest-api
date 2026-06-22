import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import LogsClient from "./LogsClient";

async function getUserKeys(userId) {
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("id, key, name, products(name)")
    .eq("user_id", userId);
  return data || [];
}

export default async function LogsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const keys = await getUserKeys(user.id);

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Request Logs"
          subtitle="Search and filter your API request history"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <LogsClient keys={keys} />
        </main>
      </div>
    </div>
  );
}
