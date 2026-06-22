import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Globe, ArrowRight, Copy } from "lucide-react";

async function getProducts() {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, category, description, base_url")
    .eq("is_active", true);
  return data || [];
}

const catIcon = (c) => ({
  weather:"🌤️", sms:"📱", identity:"🪪",
  finance:"💳", media:"🎬", utility:"🔧",
}[c] || "⚡");

export default async function EndpointsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  if (!user) redirect("/login");

  const products = await getProducts();

  return (
    <div className="flex min-h-screen bg-surface-dark">
      <Sidebar user={user} role="user" />
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Endpoints"
          subtitle="API documentation and integration guides"
          right={
            <span className="text-xs text-text-faint">{products.length} endpoints active</span>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Auth header info */}
          <div className="card border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Globe size={14} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary mb-1">Authentication</p>
                <p className="text-xs text-text-muted mb-3">
                  Add your API key as a header to every request:
                </p>
                <code className="font-mono text-xs bg-surface-dark border border-white/[0.06] px-3 py-2 rounded-lg block text-secondary">
                  X-API-Key: sk-xxxxxxxxxxxxxxxxxxxx
                </code>
              </div>
              <Link href="/dashboard/keys" className="btn-primary text-xs py-1.5 px-3 shrink-0">
                Get key
              </Link>
            </div>
          </div>

          {/* Endpoints list */}
          {products.length === 0 ? (
            <div className="card">
              <EmptyState icon={Globe} title="No endpoints yet" description="API products will appear here." />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((p) => (
                <div key={p.id} className="card hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{catIcon(p.category)}</span>
                        <h3 className="text-sm font-semibold text-text-primary">{p.name}</h3>
                        <span className="badge-muted text-xs">{p.category}</span>
                        <span className="badge-active text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mb-4 leading-relaxed">{p.description}</p>

                      {p.base_url && (
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs text-text-faint font-medium">Base URL</span>
                          <code className="font-mono text-xs text-secondary bg-surface-card border border-white/[0.06] px-3 py-1.5 rounded-lg">
                            {p.base_url}
                          </code>
                        </div>
                      )}

                      {/* Example */}
                      <div className="bg-surface-card border border-white/[0.06] rounded-xl p-4">
                        <p className="text-xs font-medium text-text-faint mb-2">Example request</p>
                        <pre className="text-xs font-mono leading-5 text-text-muted overflow-x-auto">
<span className="text-primary">curl</span>{" "}
<span className="text-text-faint">-X GET \{"\n"}  </span>
<span className="text-secondary">"{p.base_url || `https://api.apistore.id/v1/${p.name.toLowerCase().replace(/\s/g, "-")}`}"</span>
{" "}\{"\n"}  <span className="text-primary">-H</span>{" "}
<span className="text-secondary">"X-API-Key: sk-xxxxxxxxxxxx"</span>
                        </pre>
                      </div>
                    </div>

                    <Link
                      href={`/products/${p.id}`}
                      className="btn-primary text-xs shrink-0"
                    >
                      Buy access <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
