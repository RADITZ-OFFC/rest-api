import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

export default async function SettingsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader title="Settings" subtitle="Configure your preferences and notifications" />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Notifications */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-5">Notifications</h2>
            <div className="flex flex-col divide-y divide-white/[0.04]">
              {[
                { label: "Email on order confirmed", desc: "Receive an email when your purchase is approved",      on: true },
                { label: "Low quota alert",          desc: "Get notified when your quota drops below 20%",          on: true },
                { label: "New device login",         desc: "Alert when a new device signs into your account",       on: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{s.label}</p>
                    <p className="text-xs text-text-faint mt-0.5">{s.desc}</p>
                  </div>
                  <div className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors ${s.on ? "bg-secondary" : "bg-white/10"}`}
                    style={{ height: "22px" }}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.on ? "left-5.5" : "left-0.5"}`}
                      style={{ left: s.on ? "22px" : "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-2">Webhook URL</h2>
            <p className="text-xs text-text-faint mb-4">Receive event notifications to your server endpoint.</p>
            <div className="flex gap-3">
              <input
                placeholder="https://yourapp.com/webhook"
                className="input flex-1"
              />
              <button className="btn-primary text-sm shrink-0">Save</button>
            </div>
          </div>

          {/* API config */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-2">Default rate limit</h2>
            <p className="text-xs text-text-faint mb-4">Your current plan allows up to {30} req/min.</p>
            <select className="select max-w-xs">
              <option>30 req/min (Free)</option>
              <option>120 req/min (Pro)</option>
              <option>300 req/min (VVIP)</option>
            </select>
          </div>
        </main>
      </div>
    </div>
  );
}
