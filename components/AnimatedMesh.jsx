"use client";

import { useEffect, useRef } from "react";

/**
 * Animated gradient mesh — 3 blob warna yang drift sangat lambat.
 * Tidak mengganggu, ambient, seperti yang dipakai Linear/Vercel.
 * Pure CSS animation, no canvas, ringan.
 */
export default function AnimatedMesh({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Blob 1 — primary, top left, drift ke kanan-bawah */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.18]"
        style={{
          width: "600px",
          height: "600px",
          background: "#9A93D3",
          top: "-100px",
          left: "-100px",
          animation: "meshDrift1 18s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — secondary, bottom right, drift ke kiri-atas */}
      <div
        className="absolute rounded-full blur-[100px] opacity-[0.12]"
        style={{
          width: "500px",
          height: "500px",
          background: "#A7B960",
          bottom: "-80px",
          right: "-80px",
          animation: "meshDrift2 22s ease-in-out infinite",
        }}
      />

      {/* Blob 3 — muted, center, pulsing scale */}
      <div
        className="absolute rounded-full blur-[140px] opacity-[0.08]"
        style={{
          width: "400px",
          height: "400px",
          background: "#A197B7",
          top: "30%",
          left: "40%",
          transform: "translate(-50%, -50%)",
          animation: "meshPulse 14s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes meshDrift1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(60px, 40px) scale(1.08); }
          66%  { transform: translate(20px, 80px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes meshDrift2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(-50px, -30px) scale(1.05); }
          66%  { transform: translate(-20px, -70px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes meshPulse {
          0%,100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.08; }
          50%     { transform: translate(-50%, -50%) scale(1.3); opacity: 0.04; }
        }
      `}</style>
    </div>
  );
}
