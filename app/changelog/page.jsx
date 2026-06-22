import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const CHANGELOG = [
  {
    ver: "v1.0.0",
    date: "22 Jun 2026",
    isLatest: true,
    entries: [
      { type: "FEATURE", title: "Platform Launch", desc: "ApiStore resmi diluncurkan. Marketplace REST API untuk developer Indonesia." },
      { type: "FEATURE", title: "API Key Management", desc: "Generate, kelola, dan monitor API key dari dashboard. Mendukung quota, expiry date, dan nama key." },
      { type: "FEATURE", title: "Usage Analytics", desc: "Dashboard analytics real-time: total request, success rate, error rate, dan rata-rata latency." },
      { type: "FEATURE", title: "Request Logs", desc: "Log setiap request dengan filter by API key, status code, dan endpoint path." },
      { type: "FEATURE", title: "Admin Panel", desc: "Panel admin untuk kelola produk, user, konfirmasi transaksi, dan statistik platform." },
      { type: "FEATURE", title: "Credit/Quota System", desc: "Sistem kredit fleksibel per API key. Beli paket sesuai kebutuhan." },
      { type: "FIX",     title: "Auth Middleware",   desc: "Perbaikan middleware JWT untuk Edge Runtime menggunakan library jose yang kompatibel." },
      { type: "FIX",     title: "Hydration Error",   desc: "Perbaikan hydration error pada komponen ApiKeyCard yang menggunakan toLocaleString." },
    ],
  },
];

const typeColor = {
  FEATURE: "text-secondary border-secondary/30 bg-secondary/5",
  FIX:     "text-primary border-primary/30 bg-primary/5",
  BREAKING:"text-red-500 border-red-900/30 bg-red-950/20",
  DOCS:    "text-muted border-muted/30 bg-muted/5",
};

export default async function ChangelogPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl mx-auto px-6 w-full py-16">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-12">
            <div className="flex items-center gap-3">
              <span className="section-tag">CHANGELOG</span>
              <span className="label-meta">/ RIWAYAT REVISI</span>
            </div>
            <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">
              {CHANGELOG.length} VERSI
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-secondary">UPDATE</h1>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
              style={{ WebkitTextStroke: "2px rgba(167,185,96,0.25)", color:"transparent" }}>TERBARU</h1>
            <p className="text-sm text-text-muted mt-4 max-w-md leading-relaxed">
              Riwayat perubahan, fitur baru, dan perbaikan pada ApiStore. Diperbarui setiap release.
            </p>
          </div>
        </ScrollReveal>

        {/* Entries */}
        <div className="flex flex-col gap-12">
          {CHANGELOG.map((release, ri) => (
            <ScrollReveal key={release.ver} delay={ri * 100}>
              <div>
                {/* Release header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-surface-border">
                  <span className="text-lg font-black text-text-primary tracking-tight">{release.ver}</span>
                  {release.isLatest && (
                    <span className="section-tag-green text-2xs">TERBARU</span>
                  )}
                  <span className="text-2xs font-bold tracking-widest uppercase text-text-faint ml-auto">
                    {release.date}
                  </span>
                </div>

                {/* Entries */}
                <div className="flex flex-col gap-3">
                  {release.entries.map((entry, ei) => (
                    <ScrollReveal key={ei} delay={ei * 50}>
                      <div className="flex gap-4 p-4 bg-surface border border-surface-border hover:border-primary/20 transition-colors">
                        <span className={`text-2xs font-black tracking-widest uppercase px-2 py-0.5 border shrink-0 h-fit ${typeColor[entry.type] || "text-text-faint border-surface-border"}`}>
                          {entry.type}
                        </span>
                        <div>
                          <p className="text-xs font-black tracking-wider uppercase text-text-primary mb-1">{entry.title}</p>
                          <p className="text-xs text-text-muted leading-relaxed">{entry.desc}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
