"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animasi angka count-up saat masuk viewport
 * Props:
 *   to       — angka target
 *   duration — durasi animasi ms (default 1800)
 *   suffix   — teks setelah angka misal "+" atau "%"
 *   prefix   — teks sebelum angka misal "Rp "
 *   className
 */
export default function CounterNumber({
  to = 100,
  duration = 1800,
  suffix = "",
  prefix = "",
  className = "",
}) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();
    const startVal = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(startVal + (to - startVal) * easedProgress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [started, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString("id-ID")}{suffix}
    </span>
  );
}
