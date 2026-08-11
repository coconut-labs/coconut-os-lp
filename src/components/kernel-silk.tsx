"use client";

/**
 * KernelSilk — the Coconut OS brand mark in motion.
 *
 * A Mobius silk band in the accent family, turning slowly on the house dark
 * plate. Two-pass canvas render (soft glow, bright cores) with additive
 * blending; vanilla 2D projection, no WebGL, no dependencies. Contained
 * object, never a page background.
 *
 * Behavior: pauses offscreen (IntersectionObserver) and on hidden tabs;
 * prefers-reduced-motion renders one static frame. aria-hidden, decorative.
 */

import { useEffect, useRef } from "react";

const CORE = ["#2440CC", "#3D5AE8", "#5C74F2", "#7D93FF", "#A8B6FF"];
const STRANDS = 42;
const SEGS = 200;

export function KernelSilk({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();

    function size() {
      if (!cv || !ctx) return;
      const r = cv.parentElement?.getBoundingClientRect();
      if (!r) return;
      W = r.width;
      H = r.height;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function P(u: number, v: number, t: number) {
      const a = u * Math.PI * 2;
      const R = Math.min(W, H) * 0.27;
      const bw = Math.min(W, H) * 0.13 * (1 + 0.12 * Math.sin(2 * a + t * 0.4));
      const tw = 1.5 * a + t * 0.22;
      const b = v * bw;
      const x = (R + b * Math.cos(tw)) * Math.cos(a);
      const y = (R + b * Math.cos(tw)) * Math.sin(a);
      const z = b * Math.sin(tw);
      const ry = t * 0.1;
      const rx = 1.12;
      const x1 = x * Math.cos(ry) + z * Math.sin(ry);
      const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      const persp = 560 / (560 - z2 * 0.9);
      return { x: W / 2 + x1 * persp, y: H / 2 + y1 * persp * 0.92, z: z2 };
    }

    function strand(v: number, t: number, glow: boolean) {
      if (!ctx) return;
      ctx.beginPath();
      let zsum = 0;
      for (let i = 0; i <= SEGS; i++) {
        const p = P(i / SEGS, v, t);
        zsum += p.z;
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      const depth = Math.max(-1, Math.min(1, zsum / SEGS / 90));
      const edge = 1 - Math.abs(v);
      const ci = Math.min(CORE.length - 1, Math.floor(((v + 1) / 2) * CORE.length));
      ctx.strokeStyle = CORE[ci];
      if (glow) {
        ctx.globalAlpha = 0.035 + 0.05 * edge;
        ctx.lineWidth = 7 + 6 * edge;
        ctx.shadowColor = "#3D5AE8";
        ctx.shadowBlur = 22;
      } else {
        ctx.globalAlpha = 0.09 + 0.13 * edge + 0.05 * depth;
        ctx.lineWidth = 0.8 + 1.1 * edge;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }

    function frame(now: number) {
      if (!ctx) return;
      const t = reduced ? 2.2 : ((now - t0) / 1000) * 0.55;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0C0C0E";
      ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.min(W, H) * 0.5);
      g.addColorStop(0, "rgba(36,64,204,0.10)");
      g.addColorStop(1, "rgba(12,12,14,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let s = 0; s < STRANDS; s++) strand((s / (STRANDS - 1)) * 2 - 1, t, true);
      for (let s = 0; s < STRANDS; s++) strand((s / (STRANDS - 1)) * 2 - 1, t, false);
      ctx.globalAlpha = 1;
      if (!reduced && running && visible) raf = requestAnimationFrame(frame);
    }

    size();
    const ro = new ResizeObserver(size);
    if (cv.parentElement) ro.observe(cv.parentElement);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && running && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(cv);

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running && visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas aria-hidden="true" className={className} ref={ref} style={{ display: "block", width: "100%", height: "100%" }} />;
}
