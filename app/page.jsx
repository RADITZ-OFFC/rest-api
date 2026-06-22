import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal, { StaggerReveal } from "@/components/ScrollReveal";
import CounterNumber from "@/components/CounterNumber";
import FloatingParticles from "@/components/FloatingParticles";
import MarqueeTicker from "@/components/MarqueeTicker";
import AnimatedMesh from "@/components/AnimatedMesh";
import ShimmerHeading from "@/components/ShimmerHeading";
import MouseGlowCard from "@/components/MouseGlowCard";
import CodeTyping from "@/components/CodeTyping";
import LandingFAQ from "@/components/LandingFAQ";
import LandingCodeTabs from "@/components/LandingCodeTabs";
import {
  ArrowRight, CheckCircle2, Zap, Shield,
  BarChart2, Key, FileText, Clock, ChevronRight
} from "lucide-react";

async function getStats() {
  const [{ count: u }, { count: p }] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return { users: u || 0, products: p || 0 };
}

async function getProducts() {
  const { data } = await supabaseAdmin
    .from("products").select("id, name, category, description, packages(price)")
    .eq("is_active", true).limit(6);
  return data || [];
}

const catIcon = (c) => ({ weather:"🌤️",sms:"📱",identity:"🪪",finance:"💳",media:"🎬",utility:"🔧" }[c]||"⚡");

const TICKER = [
  { text: "REST API",           color: "text-primary" },
  { text: "API Key Management", color: "text-text-faint" },
  { text: "Analytics",          color: "text-secondary" },
  { text: "Request Logs",       color: "text-text-faint" },
  { text: "Rate Limiting",      color: "text-muted" },
  { text: "99.9% Uptime",       color: "text-secondary" },
  { text: "Plugin System",      color: "text-text-faint" },
  { text: "Auto Recovery",      color: "text-primary" },
];

const EXAMPLE_CODE = `# Authenticate and call an API
curl -X GET \\
  "https://api.apistore.id/v1/weather?city=Jakarta" \\
  -H "X-API-Key: sk-xxxxxxxxxxxx"

# Response
{
  "status": true,
  "data": { "city": "Jakarta", "temp": 28 },
  "credits_remaining": 999
}`;

export default async function LandingPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user  = token ? verifyToken(token) : null;
  const [stats, products] = await Promise.all([getStats(), getProducts()]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark">
      <Navbar user={user} />

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated mesh background */}
        <AnimatedMesh />
        {/* Subtle particles */}
        <FloatingParticles count={30} />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-[0.25] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-20 pb-24 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8"
            style={{ animation: "fadeUp 0.5s ease forwards" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Platform API Indonesia
          </div>

          {/* Heading dengan ShimmerHeading */}
          <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
            <ShimmerHeading
              as="h1"
              loop={10}
              className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-[1.05] mb-3 block"
            >
              The API marketplace
            </ShimmerHeading>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 gradient-text"
              style={{ animation: "fadeUp 0.5s ease 0.18s both" }}
            >
              for developers
            </h1>
          </div>

          <p
            className="text-base md:text-lg text-text-muted max-w-xl mx-auto leading-relaxed mb-10"
            style={{ animation: "fadeUp 0.5s ease 0.25s both" }}
          >
            Buy API access, get your key instantly, and start building.
            No setup, no friction — just working APIs.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-14"
            style={{ animation: "fadeUp 0.5s ease 0.32s both" }}
          >
            <Link href="/register" className="btn-primary px-6 py-2.5 text-sm shadow-glow">
              Get started for free <ArrowRight size={14} />
            </Link>
            <Link href="/docs" className="btn-outline px-6 py-2.5 text-sm">
              View documentation
            </Link>
          </div>

          {/* Stats — stagger */}
          <div
            className="flex flex-wrap items-center justify-center gap-10"
            style={{ animation: "fadeUp 0.5s ease 0.4s both" }}
          >
            {[
              { label: "APIs available", to: stats.products, suffix: "+" },
              { label: "Users",          to: stats.users,    suffix: "+" },
              { label: "Uptime",         special: "99.9%" },
              { label: "Avg latency",    special: "< 80ms" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-text-primary">
                  {s.special ?? <CounterNumber to={s.to} suffix={s.suffix} duration={2000} />}
                </p>
                <p className="text-xs text-text-faint mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glow-divider" />
      </section>

      {/* Marquee */}
      <MarqueeTicker items={TICKER} speed={40} />

      {/* ── FEATURES ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-24 w-full">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3">
              Everything you need to build
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              From API key management to real-time analytics — all in one platform.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature cards — MouseGlowCard + stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Key,       title: "API Key Management",  desc: "Create and manage keys with quota limits, expiry dates, and usage monitoring.",              color: "primary",   glow: "154,147,211" },
            { icon: BarChart2, title: "Usage Analytics",     desc: "Real-time dashboard showing request counts, success rates, error rates, and latency.",       color: "secondary", glow: "167,185,96"  },
            { icon: FileText,  title: "Request Logs",        desc: "Full history of every API call with filters by key, status code, and endpoint path.",        color: "muted",     glow: "161,151,183" },
            { icon: Shield,    title: "Multi-layer Auth",    desc: "Session auth for dashboard and API key auth for REST. All credentials encrypted at rest.",   color: "primary",   glow: "154,147,211" },
            { icon: Clock,     title: "Credit System",       desc: "Flexible quota system. Buy what you need, pay only for what you use.",                       color: "secondary", glow: "167,185,96"  },
            { icon: Zap,       title: "Instant Activation",  desc: "Keys activate immediately after payment is confirmed. No manual steps needed.",              color: "muted",     glow: "161,151,183" },
          ].map((f, i) => {
            const Icon = f.icon;
            const colors = {
              primary:   { bg: "bg-primary/10",   border: "border-primary/20",   icon: "text-primary" },
              secondary: { bg: "bg-secondary/10", border: "border-secondary/20", icon: "text-secondary" },
              muted:     { bg: "bg-muted/10",     border: "border-muted/20",     icon: "text-muted" },
            };
            const c = colors[f.color];
            return (
              <ScrollReveal key={f.title} delay={i * 65}>
                <MouseGlowCard glowColor={f.glow} innerClass="p-6 h-full flex flex-col gap-4">
                  <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={c.icon} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1.5">{f.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                  </div>
                </MouseGlowCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────── */}
      {products.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-5 py-24 w-full">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Plugins</p>
                  <h2 className="text-3xl font-bold text-text-primary tracking-tight">Available APIs</h2>
                </div>
                <Link href="/products" className="btn-ghost text-sm text-primary">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p, i) => {
                const lowest = p.packages?.sort((a,b) => a.price - b.price)[0];
                return (
                  <ScrollReveal key={p.id} delay={i * 65}>
                    <Link href={`/products/${p.id}`}>
                      <MouseGlowCard glowColor="167,185,96" innerClass="p-6 flex flex-col gap-3 h-full group">
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{catIcon(p.category)}</span>
                          <span className="badge-active text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary mb-1">{p.name}</h3>
                          <span className="badge-muted">{p.category}</span>
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 flex-1">{p.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                          <p className="text-sm font-semibold text-secondary">
                            {lowest ? `Rp ${lowest.price.toLocaleString("id-ID")}` : "Free"}
                          </p>
                          <span className="text-xs text-text-faint group-hover:text-primary transition-colors flex items-center gap-1">
                            Get access <ArrowRight size={11} />
                          </span>
                        </div>
                      </MouseGlowCard>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CODE EXAMPLE ─────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Simple Integration</p>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-4">
                One header.<br />All APIs.
              </h2>
              <p className="text-text-muted leading-relaxed mb-8">
                Authenticate to any endpoint with a single API key header.
                Generate your key from the dashboard and start calling APIs immediately.
              </p>
              {/* Steps — stagger */}
              <StaggerReveal staggerMs={80} initialDelay={200} className="flex flex-col gap-3">
                {[
                  "Create an account — free, no credit card",
                  "Buy API access and get your key instantly",
                  "Add X-API-Key header to every request",
                  "Monitor usage in real-time dashboard",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-text-muted">{text}</span>
                  </div>
                ))}
              </StaggerReveal>
            </ScrollReveal>

            {/* CodeTyping animation */}
            <ScrollReveal delay={150}>
              <CodeTyping
                code={EXAMPLE_CODE}
                language="bash"
                title="example.sh"
                speed={14}
                delay={500}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-24 w-full">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">Pricing</p>
              <ShimmerHeading
                as="h2"
                loop={12}
                className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3 block"
              >
                Simple, transparent pricing
              </ShimmerHeading>
              <p className="text-text-muted max-w-sm mx-auto">Start free. Scale as you grow.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                name:"Free", price:"Rp 0", period:"forever", desc:"For exploring and testing",
                highlight:false, glow:"255,255,255",
                features:["500 credits/day","1 API key","30 req/min","Public endpoints","7-day logs"],
                cta:"Get started", href: user ? "/dashboard" : "/register",
              },
              {
                name:"Pro", price:"Rp 25K", period:"/month", desc:"For production use",
                highlight:true, glow:"154,147,211",
                features:["10,000 credits/day","5 API keys","120 req/min","All endpoints","30-day logs","Priority support"],
                cta:"Start Pro", href: user ? "/dashboard" : "/register",
              },
              {
                name:"VVIP", price:"Rp 50K", period:"/month", desc:"For power users",
                highlight:false, glow:"167,185,96",
                features:["100,000 credits/day","10 API keys","300 req/min","All endpoints + priority","90-day logs","Dedicated support"],
                cta:"Contact us", href: user ? "/dashboard" : "/register",
              },
            ].map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 80}>
                <MouseGlowCard
                  glowColor={plan.glow}
                  innerClass={`flex flex-col h-full p-6 ${plan.highlight ? "ring-1 ring-primary/40" : ""}`}
                >
                  {plan.highlight && (
                    <span className="badge-primary text-xs self-start mb-3">Most popular</span>
                  )}
                  <p className="font-semibold text-text-primary mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-sm text-text-faint">{plan.period}</span>
                  </div>
                  <p className="text-sm text-text-muted mb-6">{plan.desc}</p>
                  <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                        <CheckCircle2 size={13} className={plan.highlight ? "text-primary" : "text-secondary"} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}
                    className={plan.highlight ? "btn-primary w-full justify-center" : "btn-outline w-full justify-center"}>
                    {plan.cta}
                  </Link>
                </MouseGlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 py-24 w-full">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-3">Common questions</h2>
              <p className="text-text-muted">Everything you need to know about ApiStore.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <LandingFAQ />
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="border-t border-white/[0.06] relative overflow-hidden">
        {/* Mesh di CTA juga */}
        <AnimatedMesh />
        <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 w-full text-center">
          <ScrollReveal>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Get started</p>
            <ShimmerHeading
              as="h2"
              loop={8}
              className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-4 block"
            >
              Ready to build?
            </ShimmerHeading>
            <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
              Join developers already using ApiStore. Free to start, no credit card needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary px-7 py-3 text-sm shadow-glow">
                Start for free <ArrowRight size={14} />
              </Link>
              <Link href="/docs" className="btn-outline px-7 py-3 text-sm">
                Read the docs
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
