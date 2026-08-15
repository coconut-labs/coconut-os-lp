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
/* 42 strands x 201 segments could not hold a 120Hz frame on this canvas:
   the cost is fill rate from 84 composited strokes, not the geometry. 30 x
   131 holds the budget and the band still reads as continuous silk at the
   size it renders. */
const STRANDS = 30;
const SEGS = 130;

export function KernelSilk({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctxMain = cv.getContext("2d");
    if (!ctxMain) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    // The vignette never changes unless the canvas resizes, so build it once.
    let vignette: CanvasGradient | null = null;
    // Offscreen buffer for the glow pass, half resolution: it is blurred
    // anyway, so full res buys nothing and costs 4x the fill.
    let glowCanvas: HTMLCanvasElement | null = null;
    let glowCtx: CanvasRenderingContext2D | null = null;
    let raf = 0;
    let running = true;
    let visible = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();

    function size() {
      if (!cv || !ctxMain) return;
      const r = cv.parentElement?.getBoundingClientRect();
      if (!r) return;
      W = r.width;
      H = r.height;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctxMain.setTransform(DPR, 0, 0, DPR, 0, 0);
      // geometry changed: the cached vignette and glow buffer must follow
      vignette = null;
      glowCanvas = null;
      glowCtx = null;
    }

    /* Per-frame constants. These were recomputed inside P() for every one of
       ~16,900 points a frame (42 strands x 201 segments x 2 passes), which is
       ~170k trig calls a frame. They depend only on t and the canvas size. */
    let fR = 0, fBw = 0, fCosRy = 1, fSinRy = 0, fCosRx = 1, fSinRx = 0;
    function frameConstants(t: number) {
      fR = Math.min(W, H) * 0.27;
      fBw = Math.min(W, H) * 0.13;
      const ry = t * 0.1;
      const rx = 1.12;
      fCosRy = Math.cos(ry); fSinRy = Math.sin(ry);
      fCosRx = Math.cos(rx); fSinRx = Math.sin(rx);
    }

    function P(u: number, v: number, t: number) {
      const a = u * Math.PI * 2;
      const R = fR;
      const bw = fBw * (1 + 0.12 * Math.sin(2 * a + t * 0.4));
      const tw = 1.5 * a + t * 0.22;
      const b = v * bw;
      const x = (R + b * Math.cos(tw)) * Math.cos(a);
      const y = (R + b * Math.cos(tw)) * Math.sin(a);
      const z = b * Math.sin(tw);
      const x1 = x * fCosRy + z * fSinRy;
      const z1 = -x * fSinRy + z * fCosRy;
      const y1 = y * fCosRx - z1 * fSinRx;
      const z2 = y * fSinRx + z1 * fCosRx;
      const persp = 560 / (560 - z2 * 0.9);
      return { x: W / 2 + x1 * persp, y: H / 2 + y1 * persp * 0.92, z: z2 };
    }

    /* One scratch buffer, reused: the geometry is identical for the glow and
       core passes, so it is computed once per strand per frame and stroked
       into both targets. */
    const pts = new Float64Array((SEGS + 1) * 2);
    let ptsDepth = 0;
    function computeStrand(v: number, t: number) {
      let zsum = 0;
      for (let i = 0; i <= SEGS; i++) {
        const p = P(i / SEGS, v, t);
        zsum += p.z;
        pts[i * 2] = p.x;
        pts[i * 2 + 1] = p.y;
      }
      ptsDepth = Math.max(-1, Math.min(1, zsum / SEGS / 90));
    }

    function strokeStrand(v: number, glow: boolean, target?: CanvasRenderingContext2D) {
      const ctx = target ?? ctxMain;
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(pts[0]!, pts[1]!);
      for (let i = 1; i <= SEGS; i++) ctx.lineTo(pts[i * 2]!, pts[i * 2 + 1]!);
      const depth = ptsDepth;
      const edge = 1 - Math.abs(v);
      const ci = Math.min(CORE.length - 1, Math.floor(((v + 1) / 2) * CORE.length));
      ctx.strokeStyle = CORE[ci];
      if (glow) {
        // No per-stroke shadowBlur. Canvas shadow is a full convolution per
        // stroke, and 42 strands of it cost ~21ms a frame, which is the whole
        // budget at 120Hz. The glow pass now draws flat onto an offscreen
        // canvas and gets blurred ONCE in frame(), same look, one convolution.
        ctx.globalAlpha = 0.035 + 0.05 * edge;
        ctx.lineWidth = 7 + 6 * edge;
        ctx.shadowBlur = 0;
      } else {
        ctx.globalAlpha = 0.09 + 0.13 * edge + 0.05 * depth;
        ctx.lineWidth = 0.8 + 1.1 * edge;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }

    function buildBuffers() {
      if (!ctxMain) return;
      vignette = ctxMain.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.min(W, H) * 0.5);
      vignette.addColorStop(0, "rgba(36,64,204,0.10)");
      vignette.addColorStop(1, "rgba(12,12,14,0)");
      glowCanvas = document.createElement("canvas");
      // Quarter res, not half: this buffer is blurred on composite, so the
      // extra resolution buys nothing and costs 4x the fill rate. Fill rate
      // is what keeps this canvas from holding 120Hz, not the geometry math.
      glowCanvas.width = Math.max(1, Math.round(W / 4));
      glowCanvas.height = Math.max(1, Math.round(H / 4));
      glowCtx = glowCanvas.getContext("2d");
    }

    function frame(now: number) {
      const ctx = ctxMain;
      if (!ctx) return;
      if (!vignette || !glowCtx || !glowCanvas) buildBuffers();
      if (!vignette || !glowCtx || !glowCanvas) return;
      const t = reduced ? 2.2 : ((now - t0) / 1000) * 0.55;
      frameConstants(t);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0C0C0E";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // glow pass: flat strokes at half res, one blur on composite
      glowCtx.setTransform(1, 0, 0, 1, 0, 0);
      glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
      glowCtx.save();
      glowCtx.scale(0.25, 0.25);
      glowCtx.globalCompositeOperation = "lighter";
      // geometry computed once per strand, stroked into the glow buffer and
      // stashed for the core pass below
      const coreQueue: number[] = [];
      for (let s = 0; s < STRANDS; s++) {
        const v = (s / (STRANDS - 1)) * 2 - 1;
        computeStrand(v, t);
        strokeStrand(v, true, glowCtx);
        coreQueue.push(v);
      }
      glowCtx.restore();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      ctx.filter = "blur(4px)";
      ctx.drawImage(glowCanvas, 0, 0, W, H);
      ctx.filter = "none";

      for (const v of coreQueue) {
        computeStrand(v, t);
        strokeStrand(v, false);
      }
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
