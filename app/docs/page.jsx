import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, ExternalLink } from "lucide-react";

async function getProducts() {
  const { data } = await supabaseAdmin
    .from("products").select("id, name, category, description, base_url").eq("is_active", true);
  return data || [];
}

const catIcon = (c) => ({ weather:"🌤️",sms:"📱",identity:"🪪",finance:"💳",media:"🎬",utility:"🔧" }[c]||"⚡");

export default async function DocsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full py-16">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-12">
            <div className="flex items-center gap-3">
              <span className="section-tag">DOC</span>
              <span className="label-meta">/ DOKUMENTASI API</span>
            </div>
            <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">
              BASE URL: api.apistore.id
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-text-primary">API</h1>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
              style={{ WebkitTextStroke: "2px rgba(154,147,211,0.3)", color:"transparent" }}>
              DOCUMENTATION
            </h1>
            <p className="text-sm text-text-muted mt-4 max-w-lg leading-relaxed">
              Dokumentasi lengkap untuk semua endpoint ApiStore. Cari, pelajari, dan integrasikan langsung dari sini.
            </p>
          </div>
        </ScrollReveal>

        {/* Auth section */}
        <ScrollReveal delay={150}>
          <div className="card border border-primary/20 mb-8">
            <p className="text-2xs font-bold tracking-widest uppercase text-primary mb-3">AUTENTIKASI</p>
            <p className="text-xs text-text-muted mb-4">
              Semua endpoint membutuhkan API key di header request. Generate key dari dashboard kamu.
            </p>
            <div className="bg-surface-dark border border-surface-border p-4">
              <pre className="text-xs font-mono">
<span className="text-text-faint">X-API-Key: </span>
<span className="text-secondary">sk-xxxxxxxxxxxxxxxxxxxx</span>
              </pre>
            </div>
            {!user && (
              <div className="mt-4">
                <Link href="/register" className="btn-primary text-2xs">
                  DAFTAR & DAPAT API KEY <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Endpoints list */}
        <ScrollReveal delay={200}>
          <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-6">
            <p className="text-2xs font-black tracking-widest uppercase text-text-muted">
              DAFTAR ENDPOINT
            </p>
            <span className="text-2xs text-text-faint">{products.length} endpoint aktif</span>
          </div>
        </ScrollReveal>

        {products.length === 0 ? (
          <ScrollReveal delay={250}>
            <div className="border border-surface-border p-12 text-center">
              <p className="text-2xs font-bold tracking-widest uppercase text-text-faint">DOKUMENTASI SEGERA HADIR</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 60}>
                <div className="card border border-surface-border hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{catIcon(p.category)}</span>
                        <h3 className="text-xs font-black tracking-wider uppercase text-text-primary">{p.name}</h3>
                        <span className="badge-primary text-2xs">{p.category?.toUpperCase()}</span>
                        <span className="badge-active text-2xs"><span className="dot-online" />AKTIF</span>
                      </div>
                      <p className="text-xs text-text-muted mb-4 leading-relaxed">{p.description}</p>

                      {p.base_url && (
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">BASE URL</span>
                          <code className="font-mono text-xs text-secondary bg-surface-dark border border-surface-border px-3 py-1">
                            {p.base_url}
                          </code>
                        </div>
                      )}

                      <div className="bg-surface-dark border border-surface-border p-4">
                        <p className="text-2xs font-bold tracking-widest uppercase text-text-faint mb-2">CONTOH REQUEST</p>
                        <pre className="text-xs font-mono leading-5">
<span className="text-text-faint">curl -X GET \ {"\n"}</span>
<span className="text-text-faint">  </span>
<span className="text-secondary">"{p.base_url || `https://api.apistore.id/v1/${p.name.toLowerCase().replace(/\s/g,"-")}`}"</span>
<span className="text-text-faint"> \ {"\n"}  -H </span>
<span className="text-primary">"X-API-Key: sk-xxxxxxxxxxxx"</span>
                        </pre>
                      </div>
                    </div>

                    <Link href={`/products/${p.id}`} className="btn-primary text-2xs shrink-0">
                      BELI AKSES <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
