import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default async function PricingPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;

  const plans = [
    {
      name: "FREE",
      price: "Rp 0",
      period: "selamanya",
      desc: "Untuk eksplorasi dan testing",
      color: "border-surface-border",
      highlight: false,
      features: [
        "500 kredit / hari (reset 00:00 WIB)",
        "1 API Key",
        "30 req/menit",
        "Semua endpoint publik",
        "Request Logs 7 hari",
        "Community support",
      ],
      cta: "MULAI GRATIS",
      href: user ? "/dashboard" : "/register",
    },
    {
      name: "PRO",
      price: "Rp 25K",
      period: "/ bulan",
      desc: "Untuk production & bisnis",
      color: "border-primary/40",
      highlight: true,
      features: [
        "10.000 kredit / hari (reset 00:00 WIB)",
        "5 API Key",
        "120 req/menit",
        "Semua endpoint",
        "Request Logs 30 hari",
        "Priority email support",
      ],
      cta: "UPGRADE KE PRO",
      href: user ? "/dashboard" : "/register",
    },
    {
      name: "VVIP",
      price: "Rp 50K",
      period: "/ bulan",
      desc: "Untuk power user & enterprise",
      color: "border-secondary/30",
      highlight: false,
      features: [
        "100.000 kredit / hari (reset 00:00 WIB)",
        "10 API Key",
        "300 req/menit",
        "Semua endpoint + priority tertinggi",
        "Request Logs 90 hari",
        "Dedicated support",
      ],
      cta: "HUBUNGI KAMI",
      href: user ? "/dashboard" : "/register",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full py-16">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-12">
            <div className="flex items-center gap-3">
              <span className="section-tag">PRICING</span>
              <span className="label-meta">/ TARIF</span>
            </div>
            <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">SATU JUARA: PRO</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-primary">PILIH</h1>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
              style={{ WebkitTextStroke: "2px rgba(154,147,211,0.3)", color:"transparent" }}>PAKET</h1>
            <p className="text-sm text-text-muted mt-4 max-w-md leading-relaxed">
              Mulai gratis dengan 500 kredit per hari. Upgrade ke Pro untuk akses penuh dan rate limit lebih tinggi.
            </p>
          </div>
        </ScrollReveal>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 100}>
              <div className={`flex flex-col border ${plan.color} ${plan.highlight ? "bg-primary/5" : "bg-surface"} p-6 h-full`}>
                {plan.highlight && (
                  <div className="mb-3">
                    <span className="section-tag text-2xs">DIREKOMENDASIKAN</span>
                  </div>
                )}
                <p className="text-2xs font-black tracking-widest uppercase text-text-muted mb-2">{plan.name}</p>
                <p className={`text-4xl font-black leading-none mb-1 ${plan.highlight ? "text-primary" : "text-text-primary"}`}>
                  {plan.price}
                </p>
                <p className="text-2xs text-text-faint mb-1">{plan.period}</p>
                <p className="text-xs text-text-muted mb-6">{plan.desc}</p>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={11} className={`shrink-0 mt-0.5 ${plan.highlight ? "text-primary" : "text-secondary"}`} />
                      <span className="text-xs text-text-muted">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={plan.highlight ? "btn-primary w-full justify-center text-2xs" : "btn-outline w-full justify-center text-2xs"}
                >
                  {plan.cta} <ArrowRight size={11} />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison table */}
        <ScrollReveal delay={200}>
          <div className="border-b border-surface-border pb-4 mb-6">
            <p className="text-2xs font-black tracking-widest uppercase text-text-muted">PERBANDINGAN LENGKAP</p>
          </div>
          <div className="border border-surface-border overflow-hidden">
            <div className="grid grid-cols-4 border-b border-surface-border bg-surface">
              <div className="p-4 border-r border-surface-border">
                <p className="text-2xs font-bold tracking-widest uppercase text-text-faint">FITUR</p>
              </div>
              {plans.map((p) => (
                <div key={p.name} className={`p-4 border-r border-surface-border last:border-r-0 ${p.highlight?"bg-primary/5":""}`}>
                  <p className="text-2xs font-black tracking-widest uppercase text-text-muted">{p.name}</p>
                </div>
              ))}
            </div>
            {[
              ["CREDITS / HARI","500","10.000","100.000"],
              ["API KEYS","1","5","10"],
              ["RATE LIMIT","30 req/menit","120 req/menit","300 req/menit"],
              ["AKSES ENDPOINT","Endpoint publik","Semua endpoint","Semua + priority"],
              ["LOGS HISTORY","7 hari","30 hari","90 hari"],
              ["SUPPORT","Community","Priority email","Dedicated"],
            ].map((row, i) => (
              <div key={row[0]} className={`grid grid-cols-4 border-b border-surface-border last:border-b-0 ${i%2===0?"bg-surface":"bg-surface-dark"}`}>
                <div className="p-4 border-r border-surface-border">
                  <p className="text-2xs font-bold tracking-widest uppercase text-text-muted">{row[0]}</p>
                </div>
                {[row[1],row[2],row[3]].map((v,j)=>(
                  <div key={j} className={`p-4 border-r border-surface-border last:border-r-0 ${j===1?"bg-primary/5":""}`}>
                    <p className={`text-xs ${j===1?"text-primary font-bold":"text-text-primary"}`}>{v}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
