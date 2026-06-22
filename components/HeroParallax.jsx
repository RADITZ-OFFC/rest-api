"use client";

import { useEffect, useRef } from "react";

/**
 * Mouse parallax wrapper — child bergerak halus mengikuti posisi mouse
 * Props:
 *   strength — seberapa kuat parallax (default 15px)
 */
export default function HeroParallax({ children, strength = 15, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let animId;

    function handleMouseMove(e) {
      const { innerWidth: w, innerHeight: h } = window;
      // Normalize -1 to 1
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      targetX = nx * strength;
      targetY = ny * strength;
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);
      el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
