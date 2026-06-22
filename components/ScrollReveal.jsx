"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal dengan stagger support.
 * Props:
 *   delay    — ms delay animasi (untuk stagger manual per item)
 *   y        — jarak geser dari bawah px (default 20)
 *   once     — hanya animasi sekali (default true)
 *   stagger  — jika dipakai di wrapper, delay otomatis ke children (pakai StaggerReveal)
 *   className
 */
export default function ScrollReveal({
  children,
  delay = 0,
  y = 20,
  once = true,
  className = "",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggerReveal — wrapper yang memberi delay otomatis ke setiap direct child.
 * Props:
 *   staggerMs  — delay antar item (default 60ms)
 *   initialDelay — delay sebelum item pertama (default 0)
 *   y, once, className — sama dengan ScrollReveal
 */
export function StaggerReveal({
  children,
  staggerMs = 60,
  initialDelay = 0,
  y = 20,
  once = true,
  className = "",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const items = Array.isArray(children) ? children : [children];

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : `translateY(${y}px)`,
            transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${initialDelay + i * staggerMs}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${initialDelay + i * staggerMs}ms`,
            willChange: "opacity, transform",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
