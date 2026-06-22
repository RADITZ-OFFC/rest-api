"use client";

/**
 * Horizontal marquee ticker — scroll otomatis tanpa henti
 * Items diulang 2x agar seamless
 */
export default function MarqueeTicker({ items, speed = 40, className = "" }) {
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden border-y border-surface-border bg-surface relative ${className}`}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #111111, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #111111, transparent)" }} />

      <div
        className="flex items-center gap-0 whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-3">
            <span className={`text-2xs font-black tracking-widest uppercase ${item.color || "text-text-faint"}`}>
              {item.text}
            </span>
            <span className="text-primary opacity-40 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
