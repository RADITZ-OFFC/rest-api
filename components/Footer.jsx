import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  const cols = [
    {
      title: "Platform",
      links: [
        { label: "Plugins",    href: "/products" },
        { label: "Docs",       href: "/docs" },
        { label: "Pricing",    href: "/pricing" },
        { label: "Changelog",  href: "/changelog" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign in",    href: "/login" },
        { label: "Register",   href: "/register" },
        { label: "Dashboard",  href: "/dashboard" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy",   href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-surface-dark">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Zap size={13} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-text-primary">ApiStore</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-[180px]">
              REST API platform for Indonesian developers.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="text-xs text-text-faint">All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-text-primary mb-3">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors link-hover">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-text-faint">© 2026 ApiStore. All rights reserved.</p>
          <p className="text-xs text-text-faint">Built for developers in Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
