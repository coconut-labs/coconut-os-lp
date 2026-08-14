import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coconutos.org"),
  title: "Coconut OS · agents as first-class kernel primitives",
  description:
    "A Linux distribution where every agent gets an AID, a capability bundle, an attestation chain, and a row in the audit log, the same way every process gets a PID today. From Coconut Labs.",
  applicationName: "Coconut OS",
  authors: [{ name: "Coconut Labs", url: "https://coconutlabs.org" }],
  creator: "Coconut Labs",
  keywords: [
    "Coconut OS",
    "Linux distribution",
    "agent operating system",
    "capability security",
    "kernel agents",
    "AI infrastructure",
    "Coconut Labs",
  ],
  openGraph: {
    title: "Coconut OS · agents as first-class kernel primitives",
    description:
      "A Linux distribution where every agent gets an AID, a capability bundle, an attestation chain, and a row in the audit log.",
    url: "https://coconutos.org",
    siteName: "Coconut OS",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Coconut OS · agents as first-class kernel primitives" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coconut OS · agents as first-class kernel primitives",
    description:
      "Linux 6.12, hard-forked, with capability-mediated access, a tamper-evident audit chain, and fair-share inference. In specification.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0E" },
  ],
  width: "device-width",
  initialScale: 1,
};

const colorSchemeBootstrap = `
(function(){try{
  var q=location.search;
  if(q.indexOf('force-light')!==-1){document.documentElement.classList.add('force-light');}
  else if(q.indexOf('force-dark')!==-1){document.documentElement.classList.add('force-dark');}
}catch(e){}})();
`;

const dotFabricScript = `
/* The lab's dot-fabric ground, portable edition. Port of coconutlabs.org's
   DotField (canvas, world-space grid): diagonal request wave, pointer
   gravity dimple, click ripples weighted by the clicked element's size,
   scroll shear, and local dimming under text so prose sits on cleared
   ground. Reads --ink-2 and --accent from the page's own token layer.
   Variants via <script data-variant="quiet|reading|full">. Reduced motion
   draws one flat static frame and never loops. Self-mounting: creates its
   own fixed canvas at z -1 and makes the body ground transparent so the
   fabric shows through. No dependencies. */
(function () {
  "use strict";
  var script = document.currentScript;
  var VARIANT = "quiet";
  var CFG = {
    full:    { spacing: 28, baseR: 1.6, inkA: 0.19, accA: 0.44, wave: true, period: 6600, crestInk: 0.4,  crestAcc: 0.62, crestR: 1.3, lift: 4,   pull: 7, pullR: 210, ripples: true, rippleE: 1 },
    quiet:   { spacing: 28, baseR: 1.6, inkA: 0.13, accA: 0.3,  wave: true, period: 8000, crestInk: 0.26, crestAcc: 0.42, crestR: 1.0, lift: 2.5, pull: 5, pullR: 190, ripples: true, rippleE: 0.7 },
    reading: { spacing: 28, baseR: 1.6, inkA: 0.09, accA: 0.2,  wave: false, period: 8000, crestInk: 0,   crestAcc: 0,    crestR: 0,   lift: 0,   pull: 3, pullR: 190, ripples: true, rippleE: 0.4 },
  }[VARIANT] || null;
  if (!CFG) return;
  var WAVELENGTH = 460, MAXR = 8, RSPEED = 0.62, RWIDTH = 110;

  function boot() {
    var reduced = matchMedia("(prefers-reduced-motion: reduce)");
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:-1";
    document.body.insertBefore(canvas, document.body.firstChild);
    /* The fabric must show through: the ground moves to <html> and <body>
       goes clear. This MUST be re-derived whenever the theme changes -
       pinning it once left pages with a live theme toggle stuck on the
       old ground while their text tokens flipped (illegible). Clearing
       the inline value first lets the page's own rule re-apply so we read
       the CURRENT ground, not the one we pinned. */
    function syncGround() {
      document.body.style.background = "";
      var bg = getComputedStyle(document.body).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        document.documentElement.style.background = bg;
        document.body.style.background = "transparent";
      }
    }
    syncGround();
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var ink = "", accent = "", W = 0, H = 0, dpr = 1, raf = 0, running = false;
    var pointer = null, ripples = [];
    var lastY = -1, sVel = 0, shear = 0;
    var dimGrid = new Float32Array(0), dimC = 0, dimR = 0, lastDim = -1;

    function colors() {
      var cs = getComputedStyle(document.documentElement);
      ink = (cs.getPropertyValue("--ink-2") || "").trim();
      accent = (cs.getPropertyValue("--accent") || "").trim();
      var dark = matchMedia("(prefers-color-scheme: dark)").matches;
      if (!ink) ink = dark ? "#82828E" : "#6A6A78";
      if (!accent) accent = dark ? "#7D93FF" : "#2440CC";
    }
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    function buildDim() {
      dimC = Math.ceil(W / CFG.spacing) + 2;
      dimR = Math.ceil(H / CFG.spacing) + 2;
      dimGrid = new Float32Array(dimC * dimR);
      var els = document.querySelectorAll("h1,h2,h3,p,li,pre,table,figure,blockquote,video");
      var n = Math.min(els.length, 160);
      for (var k = 0; k < n; k++) {
        var r = els[k].getBoundingClientRect();
        if (r.bottom < -40 || r.top > H + 40 || r.width === 0) continue;
        var pad = 14;
        var c0 = Math.max(0, Math.floor((r.left - pad) / CFG.spacing));
        var c1 = Math.min(dimC - 1, Math.ceil((r.right + pad) / CFG.spacing));
        var r0 = Math.max(0, Math.floor((r.top - pad) / CFG.spacing));
        var r1 = Math.min(dimR - 1, Math.ceil((r.bottom + pad) / CFG.spacing));
        for (var rr = r0; rr <= r1; rr++)
          for (var cc = c0; cc <= c1; cc++) dimGrid[rr * dimC + cc] = 1;
      }
      var rings = [[1, 0.55], [2, 0.25]];
      for (var q = 0; q < rings.length; q++) {
        var ring = rings[q][0], val = rings[q][1];
        for (var y = 0; y < dimR; y++) for (var x = 0; x < dimC; x++) {
          if (dimGrid[y * dimC + x] !== 0) continue;
          var near = 0;
          for (var dy = -ring; dy <= ring && !near; dy++) for (var dx = -ring; dx <= ring; dx++) {
            var yy = y + dy, xx = x + dx;
            if (yy >= 0 && yy < dimR && xx >= 0 && xx < dimC && dimGrid[yy * dimC + xx] >= 0.55) { near = 1; break; }
          }
          if (near) dimGrid[y * dimC + x] = val;
        }
      }
    }
    function dimAt(x, y) {
      if (!dimC) return 0;
      var c = Math.floor(x / CFG.spacing), r = Math.floor(y / CFG.spacing);
      if (c < 0 || c >= dimC || r < 0 || r >= dimR) return 0;
      return dimGrid[r * dimC + c] || 0;
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var animate = !reduced.matches;
      var sy = scrollY;
      var phase = animate && CFG.wave ? (t % CFG.period) / CFG.period : 0;
      if (t - lastDim > 200 || lastDim < 0) { buildDim(); lastDim = t; }
      if (animate) {
        if (lastY < 0) lastY = sy;
        sVel = sVel * 0.82 + (sy - lastY) * 0.18; lastY = sy;
        var target = Math.max(-16, Math.min(16, sVel * 0.9));
        shear += (target - shear) * 0.16;
        if (Math.abs(shear) < 0.01 && Math.abs(sVel) < 0.01) { shear = 0; sVel = 0; }
        var reach = Math.hypot(W, H) + RWIDTH;
        ripples = ripples.filter(function (rp) { return (t - rp.born) * RSPEED * rp.mass < reach * 1.2; });
      } else { shear = 0; lastY = -1; }
      var j0 = Math.floor(sy / CFG.spacing) - 1;
      var j1 = Math.ceil((sy + H) / CFG.spacing) + 1;
      var cols = Math.ceil(W / CFG.spacing) + 1;
      for (var i = 0; i < cols; i++) for (var j = j0; j <= j1; j++) {
        var wx = i * CFG.spacing + CFG.spacing / 2;
        var wy = j * CFG.spacing + CFG.spacing / 2;
        var x = wx, y = wy - sy;
        var isAcc = (((i * 7 + j * 13) % 23) + 23) % 23 === 0;
        var alpha = isAcc ? CFG.accA : CFG.inkA;
        var rad = CFG.baseR;
        if (animate) {
          if (shear !== 0) y -= shear * (0.6 + ((((i * 13 + j * 7) % 5) + 5) % 5) * 0.2);
          if (CFG.wave) {
            var ph = (wx + wy) / WAVELENGTH - phase * 2 * Math.PI;
            var crest = Math.pow(Math.max(0, Math.sin(ph)), 3);
            alpha += crest * (isAcc ? CFG.crestAcc : CFG.crestInk);
            rad += crest * CFG.crestR;
            y -= crest * CFG.lift;
          }
          if (pointer && CFG.pull > 0) {
            var dx1 = pointer.x - x, dy1 = pointer.y - y;
            var d1 = Math.hypot(dx1, dy1);
            if (d1 < CFG.pullR && d1 > 0.001) {
              var nr = Math.pow(1 - d1 / CFG.pullR, 2);
              x += (dx1 / d1) * nr * CFG.pull; y += (dy1 / d1) * nr * CFG.pull;
              alpha += nr * 0.42; rad += nr * 1.3;
            }
          }
          if (CFG.ripples) for (var rI = 0; rI < ripples.length; rI++) {
            var rp = ripples[rI];
            var front = (t - rp.born) * RSPEED * rp.mass;
            var dx2 = x - rp.x, dy2 = y - rp.y;
            var d2 = Math.hypot(dx2, dy2);
            var off = d2 - front;
            if (Math.abs(off) < RWIDTH && d2 > 0.001) {
              var ringP = Math.exp(-(off * off) / (2 * Math.pow(RWIDTH / 2.6, 2)));
              var decay = Math.max(0, 1 - front / (900 * rp.mass));
              var e = ringP * decay * rp.mass * CFG.rippleE;
              x += (dx2 / d2) * e * 9; y += (dy2 / d2) * e * 9;
              alpha += e * 0.5; rad += e * 1.6;
            }
          }
        }
        var dm = dimAt(x, y);
        if (dm > 0) alpha *= 1 - 0.72 * dm;
        ctx.globalAlpha = Math.min(alpha, 0.95);
        ctx.fillStyle = isAcc ? accent : ink;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    function start() { if (running || reduced.matches || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function restart() { stop(); syncGround(); colors(); resize(); lastDim = -1; draw(0); start(); }

    addEventListener("pointermove", function (e) { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
    addEventListener("pointerout", function () { pointer = null; }, { passive: true });
    addEventListener("pointerdown", function (e) {
      if (reduced.matches || !CFG.ripples) return;
      var mass = 0.55;
      var el = e.target instanceof Element ? e.target.closest("a,button,[role='button'],article,section,div") : null;
      if (el) {
        var r = el.getBoundingClientRect();
        mass = Math.min(1.7, Math.max(0.45, Math.sqrt(Math.max(1, r.width * r.height)) / 320));
      }
      ripples.push({ x: e.clientX, y: e.clientY, born: performance.now(), mass: mass });
      if (ripples.length > MAXR) ripples.shift();
    }, { passive: true });
    var scrollRaf = 0;
    addEventListener("scroll", function () {
      if (running) return;
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(function () { lastDim = -1; draw(0); });
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", restart);
    // in-page theme toggles (data-theme / class swaps) must also re-ground
    new MutationObserver(restart).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) if (recs[i].attributeName !== "style") { restart(); return; }
    }).observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
    reduced.addEventListener("change", restart);
    addEventListener("resize", restart);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastDim = -1; if (!running) draw(0); });
    restart();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorSchemeBootstrap }} />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        {children}
        <script dangerouslySetInnerHTML={{ __html: dotFabricScript }} />
      </body>
    </html>
  );
}
