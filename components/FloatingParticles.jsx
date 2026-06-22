"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based floating particles untuk hero background.
 * Ringan — hanya canvas 2D, tidak pakai library.
 */
export default function FloatingParticles({ count = 60, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    // Warna sesuai tema: primary, secondary, muted
    const COLORS = [
      "rgba(154,147,211,", // primary
      "rgba(167,185,96,",  // secondary
      "rgba(161,151,183,", // muted
    ];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    function createParticle() {
      const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x:      randomBetween(0, canvas.width),
        y:      randomBetween(0, canvas.height),
        r:      randomBetween(0.8, 2.4),
        alpha:  randomBetween(0.1, 0.5),
        dx:     randomBetween(-0.25, 0.25),
        dy:     randomBetween(-0.4, -0.1),
        color:  colorBase,
        pulse:  randomBetween(0, Math.PI * 2), // phase offset
        pulseSpeed: randomBetween(0.01, 0.025),
      };
    }

    function init() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.x += p.dx;
        p.y += p.dy;
        p.pulse += p.pulseSpeed;

        // Respawn saat keluar layar
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = randomBetween(0, canvas.width);
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Pulsing alpha
        const alphaNow = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alphaNow.toFixed(2)})`;
        ctx.fill();
      });

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(154,147,211,${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
