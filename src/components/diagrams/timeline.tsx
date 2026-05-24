"use client";

/* Roadmap timeline — horizontal: 2026 → 2031. Five release dots, each with
   a short callout. Public preview shows the *order* and *headline*; per-release
   bullets stay on the LP roadmap-section cards. Sprint-level commitments
   intentionally omitted. */

const RELEASES = [
  { ver: "v1.0", year: "2027 Q4", tag: "x86_64 · NVIDIA",        x: 0.18, tone: "accent"    },
  { ver: "v1.1", year: "2028 Q2", tag: "ARM64 server",            x: 0.36, tone: "highlight" },
  { ver: "v1.2", year: "2028 Q4", tag: "Apple Silicon",           x: 0.50, tone: "highlight" },
  { ver: "v2.0", year: "~2029-30", tag: "ABI break · full mm/cred", x: 0.74, tone: "muted" },
  { ver: "v3.0", year: "~2031+",   tag: "default substrate",        x: 0.93, tone: "muted" },
];

const SPRINTS = [
  { label: "Sprint 0 — kernel boots in QEMU",          x: 0.04 },
  { label: "Sprint 8 — first agent_spawn end-to-end",  x: 0.10 },
  { label: "Sprint 18 — brand v1 ships",               x: 0.13 },
  { label: "Sprint 22 — third-party security audit",   x: 0.155 },
];

const TONE: Record<string, string> = {
  muted: "var(--muted)",
  highlight: "var(--highlight)",
  accent: "var(--accent)",
};

export function Timeline() {
  const W = 1000, H = 260;
  const axisY = H * 0.55;

  return (
    <figure>
      <div className="rounded-2xl border hairline overflow-hidden bg-[color:var(--surface)]/40 p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Coconut OS roadmap timeline">
          {/* axis */}
          <line x1="40" x2={W - 40} y1={axisY} y2={axisY} stroke="color-mix(in oklab, var(--fg) 20%, transparent)" strokeWidth="1" />

          {/* year ticks */}
          {[
            { y: "2026", x: 0.0 },
            { y: "2027", x: 0.16 },
            { y: "2028", x: 0.4 },
            { y: "2029", x: 0.64 },
            { y: "2030", x: 0.8 },
            { y: "2031+", x: 1.0 },
          ].map((t) => {
            const cx = 40 + t.x * (W - 80);
            return (
              <g key={t.y}>
                <line x1={cx} x2={cx} y1={axisY - 4} y2={axisY + 4} stroke="color-mix(in oklab, var(--fg) 25%, transparent)" strokeWidth="1" />
                <text x={cx} y={axisY + 22} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill="color-mix(in oklab, var(--fg) 55%, transparent)">{t.y}</text>
              </g>
            );
          })}

          {/* sprint micro-ticks (top side) */}
          {SPRINTS.map((s, i) => {
            const cx = 40 + s.x * (W - 80);
            const labelY = axisY - 64 - (i % 2) * 20;
            return (
              <g key={s.label}>
                <line x1={cx} x2={cx} y1={axisY - 2} y2={axisY - 12} stroke="color-mix(in oklab, var(--muted) 50%, transparent)" strokeWidth="0.8" />
                <line x1={cx} x2={cx} y1={axisY - 12} y2={labelY + 6} stroke="color-mix(in oklab, var(--muted) 30%, transparent)" strokeWidth="0.8" strokeDasharray="2 3" />
                <text x={cx} y={labelY} fontFamily="ui-monospace, monospace" fontSize="10" fill="color-mix(in oklab, var(--muted) 90%, transparent)" letterSpacing="0">{s.label}</text>
              </g>
            );
          })}

          {/* release dots (bottom side) */}
          {RELEASES.map((r, i) => {
            const cx = 40 + r.x * (W - 80);
            const color = TONE[r.tone];
            const labelY = axisY + 70 + (i % 2) * 22;
            return (
              <g key={r.ver}>
                <circle cx={cx} cy={axisY} r="6" fill="var(--canvas)" stroke={color} strokeWidth="1.8" />
                <circle cx={cx} cy={axisY} r="2.5" fill={color} />
                <line x1={cx} x2={cx} y1={axisY + 8} y2={labelY - 14} stroke="color-mix(in oklab, var(--fg) 18%, transparent)" strokeWidth="0.8" strokeDasharray="2 3" />
                <text x={cx} y={labelY} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="13" fill={color}>{r.ver}</text>
                <text x={cx} y={labelY + 14} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fill="color-mix(in oklab, var(--fg) 60%, transparent)">{r.year}</text>
                <text x={cx} y={labelY + 28} textAnchor="middle" fontFamily="ui-sans-serif" fontSize="10.5" fill="color-mix(in oklab, var(--fg) 75%, transparent)">{r.tag}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        order is locked · per-release feature gating moves sprint by sprint · the hard ABI line is between v1.x and v2.0
      </figcaption>
    </figure>
  );
}
