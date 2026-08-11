"use client";

/* Agent lifecycle state machine.
   Eight first-class kernel states arranged in four column-regions:
   Init · Running · Branched · Terminal. Edges are tone-coded by class
   (happy / branch / exit) and drawn with smart endpoint geometry so
   no curve crosses a node body and parallel pairs offset cleanly.
   ViewBox sized to fit all labels with breathing room — responsive. */

type Tone = "muted" | "highlight" | "accent";
type EdgeKind = "happy" | "branch" | "exit";

type NodeId =
  | "spawn" | "att" | "act" | "iwait"
  | "deny"  | "quar" | "tclean" | "trev";

const NODES: Record<NodeId, { col: number; row: number; label: string; tone: Tone }> = {
  spawn:  { col: 0, row: 0, label: "Spawning",           tone: "muted"     },
  att:    { col: 0, row: 1, label: "Attested",           tone: "muted"     },
  act:    { col: 1, row: 0, label: "Active",             tone: "accent"    },
  iwait:  { col: 1, row: 1, label: "Inference-blocked",  tone: "highlight" },
  deny:   { col: 2, row: 0, label: "Cap-denied",         tone: "accent"    },
  quar:   { col: 2, row: 1, label: "Quarantined",        tone: "highlight" },
  tclean: { col: 3, row: 0, label: "Terminated-clean",   tone: "muted"     },
  trev:   { col: 3, row: 1, label: "Terminated-revoked", tone: "accent"    },
};

const COL_LABELS = ["init", "running", "branched", "terminal"];

const EDGES: Array<{ from: NodeId; to: NodeId; kind: EdgeKind; bow?: number }> = [
  { from: "spawn",  to: "att",    kind: "happy"  },
  { from: "att",    to: "act",    kind: "happy"  },
  { from: "act",    to: "iwait",  kind: "happy", bow: -10 },
  { from: "iwait",  to: "act",    kind: "happy", bow:  10 },
  { from: "act",    to: "deny",   kind: "branch" },
  { from: "deny",   to: "quar",   kind: "branch" },
  { from: "act",    to: "tclean", kind: "exit"   },
  { from: "quar",   to: "trev",   kind: "exit"   },
];

const W = 920;
const H = 260;
const NW = 180;
const NH = 42;
const COL_X = [30, 260, 490, 720];   // left edges; rightmost: 720+180=900, pad 20
const ROW_Y = [80, 170];

const TONE: Record<Tone, string> = {
  muted:     "var(--muted)",
  highlight: "var(--highlight)",
  accent:    "var(--accent)",
};

const EDGE_TONE: Record<EdgeKind, string> = {
  happy:  "color-mix(in oklab, var(--fg) 40%, transparent)",
  branch: "var(--accent)",
  exit:   "color-mix(in oklab, var(--muted) 90%, transparent)",
};

function nodePos(id: NodeId) {
  const n = NODES[id];
  return { x: COL_X[n.col], y: ROW_Y[n.row], cx: COL_X[n.col] + NW / 2, cy: ROW_Y[n.row] + NH / 2 };
}

/* Smart-face routing: returns (start, end) on the nearest opposing faces
   so the curve never crosses a node body. Curves are S-shapes for diagonals,
   plain bezier for orthogonal moves. */
function endpoints(from: NodeId, to: NodeId) {
  const A = nodePos(from);
  const B = nodePos(to);
  const dx = B.cx - A.cx;
  const dy = B.cy - A.cy;

  // pure-horizontal (same row)
  if (dy === 0) {
    if (dx > 0) return { s: { x: A.x + NW, y: A.cy }, e: { x: B.x,        y: B.cy }, axis: "h" as const };
    return        { s: { x: A.x,         y: A.cy }, e: { x: B.x + NW,    y: B.cy }, axis: "h" as const };
  }
  // pure-vertical (same column)
  if (dx === 0) {
    if (dy > 0) return { s: { x: A.cx, y: A.y + NH }, e: { x: B.cx, y: B.y        }, axis: "v" as const };
    return        { s: { x: A.cx, y: A.y        }, e: { x: B.cx, y: B.y + NH    }, axis: "v" as const };
  }
  // diagonal: connect via the dominant axis face
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) return { s: { x: A.x + NW, y: A.cy }, e: { x: B.x,        y: B.cy }, axis: "h" as const };
    return        { s: { x: A.x,         y: A.cy }, e: { x: B.x + NW,    y: B.cy }, axis: "h" as const };
  }
  if (dy > 0) return { s: { x: A.cx, y: A.y + NH }, e: { x: B.cx, y: B.y        }, axis: "v" as const };
  return        { s: { x: A.cx, y: A.y        }, e: { x: B.cx, y: B.y + NH    }, axis: "v" as const };
}

function path(from: NodeId, to: NodeId, bow = 0): string {
  const { s, e, axis } = endpoints(from, to);
  if (axis === "h") {
    // horizontal — control points at the midpoint x, anchored to start/end y
    const mid = (s.x + e.x) / 2;
    return `M ${s.x} ${s.y + bow * 0} C ${mid} ${s.y}, ${mid} ${e.y}, ${e.x} ${e.y}`;
  }
  // vertical — control points at midpoint y, anchored to start/end x
  const mid = (s.y + e.y) / 2;
  // bow offsets the entire vertical leg to handle parallel edges
  return `M ${s.x + bow} ${s.y} C ${s.x + bow} ${mid}, ${e.x + bow} ${mid}, ${e.x + bow} ${e.y}`;
}

export function AgentStateMachine() {
  return (
    <figure className="relative">
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-3 sm:p-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Coconut OS agent lifecycle state machine">
          <defs>
            <marker id="arrow-happy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="color-mix(in oklab, var(--fg) 50%, transparent)" />
            </marker>
            <marker id="arrow-branch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
            <marker id="arrow-exit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="color-mix(in oklab, var(--muted) 90%, transparent)" />
            </marker>
          </defs>

          {/* column header strip — subtle */}
          {COL_LABELS.map((label, i) => (
            <g key={label}>
              <text
                x={COL_X[i] + NW / 2}
                y={32}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="10"
                letterSpacing="2"
                fill="color-mix(in oklab, var(--muted) 80%, transparent)"
                style={{ textTransform: "uppercase" }}
              >
                {label}
              </text>
              <line
                x1={COL_X[i] + 6}
                x2={COL_X[i] + NW - 6}
                y1={42}
                y2={42}
                stroke="color-mix(in oklab, var(--fg) 14%, transparent)"
                strokeWidth="0.8"
              />
            </g>
          ))}

          {/* edges — under nodes */}
          {EDGES.map((edge, i) => {
            const d = path(edge.from, edge.to, edge.bow ?? 0);
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={EDGE_TONE[edge.kind]}
                strokeWidth="1.2"
                markerEnd={`url(#arrow-${edge.kind})`}
                opacity={edge.kind === "happy" ? 0.85 : 0.95}
              />
            );
          })}

          {/* nodes — pill, color stroke by tone */}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const p = nodePos(id);
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`}>
                <rect
                  width={NW}
                  height={NH}
                  rx={NH / 2}
                  fill="var(--canvas)"
                  stroke={TONE[n.tone]}
                  strokeWidth="1.4"
                />
                <text
                  x={18}
                  y={NH / 2 + 4.5}
                  fontFamily="ui-monospace, monospace"
                  fontSize="12.5"
                  fill="var(--fg)"
                  letterSpacing="-0.2"
                >
                  {n.label}
                </text>
                <circle
                  cx={NW - 14}
                  cy={NH / 2}
                  r="3.2"
                  fill={TONE[n.tone]}
                />
              </g>
            );
          })}
        </svg>

        {/* legend strip */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 font-mono text-[11px] text-[color:var(--muted)]">
          <span className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ background: EDGE_TONE.happy }} />
            happy path
          </span>
          <span className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ background: EDGE_TONE.branch }} />
            cap-deny branch
          </span>
          <span className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ background: EDGE_TONE.exit }} />
            exit
          </span>
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        eight first-class kernel states · canonical transitions shown · the full edge graph + transition guards land with the LLD drop
      </figcaption>
    </figure>
  );
}
