"use client";

import { useRef, useCallback } from "react";

/**
 * Card dengan border glow yang ikut posisi mouse.
 * Efek: radial gradient di border bergerak mengikuti cursor.
 * Props:
 *   className  — class tambahan untuk wrapper
 *   children   — isi card
 *   glowColor  — warna glow, default rgba(154,147,211,0.4)
 */
export default function MouseGlowCard({
  children,
  className = "",
  glowColor = "154,147,211",
  innerClass = "",
}) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--glow-x", `${x}%`);
    card.style.setProperty("--glow-y", `${y}%`);
    card.style.setProperty("--glow-opacity", "1");
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-xl ${className}`}
      style={{
        "--glow-x": "50%",
        "--glow-y": "50%",
        "--glow-opacity": "0",
        "--glow-color": glowColor,
        background: `
          radial-gradient(
            350px circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-opacity) * 0.12)),
            transparent 70%
          ),
          #13121a
        `,
        border: "1px solid transparent",
        backgroundClip: "padding-box",
        transition: "--glow-opacity 0.3s ease",
      }}
    >
      {/* Border glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(
            350px circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-opacity) * 0.5)),
            transparent 70%
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "0.75rem",
          opacity: "var(--glow-opacity)",
        }}
      />
      {/* Static border underneath */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/[0.06]" />

      {/* Content */}
      <div className={`relative z-10 ${innerClass}`}>
        {children}
      </div>
    </div>
  );
}
