"use client";

/* Roadmap timeline — 2026 → 2031.
   - Build-phase bracket above the axis (Sprint 0 → v1.0)
   - Year ticks on the axis (clean, even spacing)
   - Release dots below with version + quarter + tag, vertically staggered
     so labels never collide
   - A dashed v1.x → v2.0 ABI-line between v1.2 and v2.0 to mark the break
   Public preview shows order + tag; sprint-level commitments stay in PLAN. */

const YEARS = [
  { y: "2026",  x: 0.00 },
  { y: "2027",  x: 0.20 },
  { y: "2028",  x: 0.40 },
  { y: "2029",  x: 0.60 },
  { y: "2030",  x: 0.80 },
  { y: "2031+", x: 1.00 },
];

const RELEASES = [
  { ver: "v1.0", when: "2027 Q4",  tag: "x86_64 · NVIDIA",            x: 0.36, tone: "accent",    place: "below-far"   },
  { ver: "v1.1", when: "2028 Q2",  tag: "ARM64 server",                x: 0.46, tone: "highlight", place: "below-near"  },
  { ver: "v1.2", when: "2028 Q4",  tag: "Apple Silicon",               x: 0.55, tone: "highlight", place: "below-far"   },
  { ver: "v2.0", when: "~2029-30", tag: "ABI break · full mm/cred",    x: 0.78, tone: "muted",     place: "below-near"  },
  { ver: "v3.0", when: "~2031+",   tag: "default substrate",           x: 0.96, tone: "muted",     place: "below-far"   },
];

// the build phase = "now (Sprint 0)" -> v1.0 (2027 Q4)
const BUILD_PHASE = { x0: 0.02, x1: 0.36, label: "build phase · 26 sprints · 12-18 months" };
// the ABI-line lives between v1.2 (x=0.55) and v2.0 (x=0.78), at ~0.66
const ABI_LINE_X = 0.665;

const TONE: Record<string, string> = {
  muted: "var(--muted)",
  highlight: "var(--highlight)",
  accent: "var(--accent)",
};

export function Timeline() {
  // viewport in svg units
  const W = 1000;
  const H = 360;
  const PAD_X = 60;
  const axisY = 180;

  function px(x: number) {
    return PAD_X + x * (W - PAD_X * 2);
  }

  return (
    <figure>
      <div className="rounded-2xl border hairline overflow-hidden bg-[color:var(--surface)]/40 p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Coconut OS roadmap timeline 2026 to 2031">
          <defs>
            <linearGradient id="build-fill" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"  stopColor="color-mix(in oklab, var(--accent) 12%, transparent)" stopOpacity="1" />
              <stop offset="100%" stopColor="color-mix(in oklab, var(--accent) 22%, transparent)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* build-phase bracket above the axis */}
          {(() => {
            const x0 = px(BUILD_PHASE.x0);
            const x1 = px(BUILD_PHASE.x1);
            const y  = axisY - 70;
            return (
              <g>
                <rect x={x0} y={y} width={x1 - x0} height={42} rx={6} fill="url(#build-fill)" />
                {/* tick brackets */}
                <line x1={x0} x2={x0} y1={y - 4}  y2={y + 46} stroke="color-mix(in oklab, var(--accent) 60%, transparent)" strokeWidth="1.1" />
                <line x1={x1} x2={x1} y1={y - 4}  y2={y + 46} stroke="color-mix(in oklab, var(--accent) 60%, transparent)" strokeWidth="1.1" />
                <text x={(x0 + x1) / 2} y={y + 16} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="0.5" fill="color-mix(in oklab, var(--accent) 95%, transparent)">
                  build phase
                </text>
                <text x={(x0 + x1) / 2} y={y + 32} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill="color-mix(in oklab, var(--muted) 95%, transparent)">
                  26 sprints · 12-18 months
                </text>
              </g>
            );
          })()}

          {/* axis */}
          <line x1={PAD_X - 6} x2={W - PAD_X + 6} y1={axisY} y2={axisY} stroke="color-mix(in oklab, var(--fg) 22%, transparent)" strokeWidth="1" />

          {/* year ticks */}
          {YEARS.map((y) => {
            const cx = px(y.x);
            return (
              <g key={y.y}>
                <line x1={cx} x2={cx} y1={axisY - 4} y2={axisY + 4} stroke="color-mix(in oklab, var(--fg) 28%, transparent)" strokeWidth="1" />
                <text x={cx} y={axisY + 22} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill="color-mix(in oklab, var(--muted) 95%, transparent)" letterSpacing="0.4">{y.y}</text>
              </g>
            );
          })}

          {/* ABI-break dashed line */}
          {(() => {
            const cx = px(ABI_LINE_X);
            return (
              <g>
                <line x1={cx} x2={cx} y1={axisY - 56} y2={axisY + H * 0.32} stroke="color-mix(in oklab, var(--fg) 22%, transparent)" strokeWidth="1" strokeDasharray="4 4" />
                <g transform={`translate(${cx},${axisY - 60})`}>
                  <rect x={-58} y={-12} width={116} height={18} rx={9} fill="color-mix(in oklab, var(--canvas) 92%, var(--muted) 8%)" stroke="color-mix(in oklab, var(--muted) 35%, transparent)" strokeWidth="0.8" />
                  <text x={0} y={1} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill="color-mix(in oklab, var(--muted) 95%, transparent)" letterSpacing="0.4">
                    ABI line · v1.x → v2.0
                  </text>
                </g>
              </g>
            );
          })()}

          {/* release dots + staggered labels below the axis */}
          {RELEASES.map((r) => {
            const cx = px(r.x);
            const stagger = r.place === "below-far" ? 84 : 38;
            const labelY = axisY + stagger;
            const color = TONE[r.tone];
            return (
              <g key={r.ver}>
                {/* tether */}
                <line x1={cx} x2={cx} y1={axisY + 6} y2={labelY - 16} stroke="color-mix(in oklab, var(--fg) 14%, transparent)" strokeWidth="0.8" strokeDasharray="2 3" />
                {/* dot */}
                <circle cx={cx} cy={axisY} r="6" fill="var(--canvas)" stroke={color} strokeWidth="1.8" />
                <circle cx={cx} cy={axisY} r="2.6" fill={color} />

                {/* label group */}
                <g transform={`translate(${cx},${labelY})`}>
                  <text x={0} y={0} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={color} letterSpacing="-0.2">{r.ver}</text>
                  <text x={0} y={16} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fill="color-mix(in oklab, var(--muted) 95%, transparent)" letterSpacing="0.3">{r.when}</text>
                  <text x={0} y={32} textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="11" fill="color-mix(in oklab, var(--fg) 80%, transparent)">{r.tag}</text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend / caption — a single tidy line under the diagram */}
      <div className="mt-4 flex flex-col sm:flex-row gap-x-6 gap-y-2 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <LegendDot color="var(--accent)"    body="v1.x · the locked ABI"  />
          <LegendDot color="var(--highlight)" body="v1.x · platform tiers" />
          <LegendDot color="var(--muted)"     body="v2.0+ · long horizon"  />
        </div>
        <p className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
          order is locked · sprint-level commitments move with the build
        </p>
      </div>
    </figure>
  );
}

function LegendDot({ color, body }: { color: string; body: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[color:var(--muted)]">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {body}
    </span>
  );
}
