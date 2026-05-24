"use client";

/* Roadmap timeline — horizontal 2026 → 2031+. The 12-18 month build
   phase is rendered as a soft band on the left. Release dots sit on the
   axis with year + tag below. Sprint micro-ticks were causing label
   collisions in the build phase — replaced with a single labelled band. */

type Release = { ver: string; year: string; tag: string; x: number; tone: "muted" | "highlight" | "accent" };

const RELEASES: Release[] = [
  { ver: "v1.0", year: "2027 Q4", tag: "x86_64 · NVIDIA",           x: 0.18, tone: "accent"    },
  { ver: "v1.1", year: "2028 Q2", tag: "ARM64 server",              x: 0.36, tone: "highlight" },
  { ver: "v1.2", year: "2028 Q4", tag: "Apple Silicon",             x: 0.50, tone: "highlight" },
  { ver: "v2.0", year: "~2029-30", tag: "ABI break · full mm/cred", x: 0.74, tone: "muted"     },
  { ver: "v3.0", year: "~2031+",   tag: "default substrate",        x: 0.93, tone: "muted"     },
];

const YEARS = [
  { label: "2026",  x: 0.00 },
  { label: "2027",  x: 0.16 },
  { label: "2028",  x: 0.40 },
  { label: "2029",  x: 0.64 },
  { label: "2030",  x: 0.80 },
  { label: "2031+", x: 1.00 },
];

const TONE: Record<Release["tone"], string> = {
  muted:     "var(--muted)",
  highlight: "var(--highlight)",
  accent:    "var(--accent)",
};

export function Timeline() {
  const W = 1000, H = 280;
  const PAD = 50;
  const xAt = (t: number) => PAD + t * (W - 2 * PAD);
  const axisY = H * 0.58;

  // Build-phase band: from time 0 (sprint 0, mid-2026) to time 0.18 (v1.0 release)
  const bandX0 = xAt(0.005);
  const bandX1 = xAt(0.18);

  return (
    <figure>
      <div className="rounded-2xl border hairline overflow-hidden bg-[color:var(--surface)]/40 p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Coconut OS roadmap 2026 to 2031">
          <defs>
            <linearGradient id="build-band" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="color-mix(in oklab, var(--highlight) 28%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in oklab, var(--accent) 26%, transparent)" />
            </linearGradient>
          </defs>

          {/* build-phase band — under the axis */}
          <rect
            x={bandX0}
            y={axisY - 28}
            width={bandX1 - bandX0}
            height={56}
            rx={28}
            fill="url(#build-band)"
            stroke="color-mix(in oklab, var(--accent) 22%, transparent)"
            strokeWidth="0.8"
          />
          <text
            x={(bandX0 + bandX1) / 2}
            y={axisY - 38}
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="10.5"
            letterSpacing="1.5"
            fill="color-mix(in oklab, var(--accent) 90%, transparent)"
            style={{ textTransform: "uppercase" }}
          >
            BUILD PHASE · 26 sprints
          </text>
          <text
            x={(bandX0 + bandX1) / 2}
            y={axisY + 3}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="11"
            fill="color-mix(in oklab, var(--fg) 80%, transparent)"
          >
            Sprint 0 → v1.0 GA
          </text>
          <text
            x={(bandX0 + bandX1) / 2}
            y={axisY + 18}
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="10"
            fill="color-mix(in oklab, var(--muted) 90%, transparent)"
          >
            kernel boot · first agent_spawn · brand v1 · external security audit
          </text>

          {/* main axis */}
          <line x1={PAD} x2={W - PAD} y1={axisY} y2={axisY} stroke="color-mix(in oklab, var(--fg) 20%, transparent)" strokeWidth="1" />

          {/* year ticks */}
          {YEARS.map((y) => {
            const cx = xAt(y.x);
            return (
              <g key={y.label}>
                <line x1={cx} x2={cx} y1={axisY - 4} y2={axisY + 4} stroke="color-mix(in oklab, var(--fg) 30%, transparent)" strokeWidth="1" />
                <text x={cx} y={axisY + 36} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fill="color-mix(in oklab, var(--fg) 50%, transparent)">{y.label}</text>
              </g>
            );
          })}

          {/* release pins — below the axis */}
          {RELEASES.map((r, i) => {
            const cx = xAt(r.x);
            const color = TONE[r.tone];
            // alternate labels above & below to avoid collision when close
            // v1.0 (i=0) below; v1.1 below; v1.2 above; v2.0 below; v3.0 below
            const labelY = i === 2 ? axisY + 70 : axisY + 70;
            return (
              <g key={r.ver}>
                <circle cx={cx} cy={axisY} r="7"   fill="var(--canvas)" stroke={color} strokeWidth="1.8" />
                <circle cx={cx} cy={axisY} r="3"   fill={color} />
                <line   x1={cx} x2={cx} y1={axisY + 9} y2={labelY - 18} stroke="color-mix(in oklab, var(--fg) 18%, transparent)" strokeWidth="0.8" strokeDasharray="2 3" />
                <text x={cx} y={labelY}      textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="14" fill={color} letterSpacing="-0.2">{r.ver}</text>
                <text x={cx} y={labelY + 16} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fill="color-mix(in oklab, var(--fg) 58%, transparent)">{r.year}</text>
                <text x={cx} y={labelY + 30} textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="10.5" fill="color-mix(in oklab, var(--fg) 75%, transparent)">{r.tag}</text>
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
