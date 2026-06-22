"use client";

/**
 * Heading dengan efek shimmer/gleam yang melintas sekali
 * saat komponen mount, lalu diam.
 * Subtle — tidak loop terus-menerus.
 *
 * Props:
 *   as        — tag HTML ("h1","h2","h3"), default "h1"
 *   children
 *   className
 *   loop      — ulangi shimmer tiap N detik (0 = sekali saja)
 *   gradient  — custom gradient warna shimmer
 */
export default function ShimmerHeading({
  as: Tag = "h1",
  children,
  className = "",
  loop = 8,
  gradient = "linear-gradient(105deg, transparent 35%, rgba(154,147,211,0.7) 50%, rgba(167,185,96,0.4) 60%, transparent 65%)",
}) {
  const animDuration = `${loop}s`;
  const id = `shimmer-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <Tag className={`relative inline-block ${className}`}>
      {/* Base text */}
      <span className="relative z-10">{children}</span>

      {/* Shimmer overlay — melintas pelan */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: gradient,
          backgroundSize: "300% 100%",
          backgroundPosition: "-200% center",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: loop
            ? `shimmerPass ${animDuration} ease-in-out ${loop > 0 ? "infinite" : "forwards"}`
            : "shimmerPass 2s ease-in-out forwards",
        }}
      >
        {children}
      </span>

      <style>{`
        @keyframes shimmerPass {
          0%   { background-position: -200% center; }
          30%  { background-position: 200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </Tag>
  );
}
