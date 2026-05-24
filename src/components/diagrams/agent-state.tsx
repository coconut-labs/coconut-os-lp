"use client";

/* Agent lifecycle state machine — eight states, deliberately not all wired up
   in the public preview (we name the states; the full edge graph publishes
   with the LLD drop). */

const STATES = [
  { id: "spawn",  label: "Spawning",          x: 90,  y: 80,  desc: "Capability set computed · manifest attested",      tone: "muted"     },
  { id: "att",    label: "Attested",          x: 280, y: 80,  desc: "Signature verified · capabilities granted",        tone: "muted"     },
  { id: "act",    label: "Active",            x: 470, y: 80,  desc: "Running · consuming budget",                       tone: "accent"    },
  { id: "iwait",  label: "Inference-blocked", x: 470, y: 200, desc: "Waiting on broker queue",                          tone: "highlight" },
  { id: "deny",   label: "Cap-denied",        x: 280, y: 200, desc: "Action denied · parent notified",                  tone: "accent"    },
  { id: "quar",   label: "Quarantined",       x: 90,  y: 200, desc: "Soft-isolated · under investigation",              tone: "highlight" },
  { id: "tclean", label: "Terminated-clean",  x: 280, y: 320, desc: "Exited normally",                                   tone: "muted"     },
  { id: "trev",   label: "Terminated-revoked",x: 470, y: 320, desc: "Capability revoked mid-execution",                 tone: "accent"    },
];

const EDGES: Array<[string, string]> = [
  ["spawn", "att"], ["att", "act"],
  ["act", "iwait"], ["iwait", "act"],
  ["act", "deny"],  ["deny", "quar"],
  ["act", "tclean"], ["act", "trev"],
  ["quar", "tclean"], ["quar", "trev"],
];

const TONE: Record<string, string> = {
  muted:     "var(--muted)",
  highlight: "var(--highlight)",
  accent:    "var(--accent)",
};

export function AgentStateMachine() {
  const W = 600, H = 400;
  const byId = Object.fromEntries(STATES.map((s) => [s.id, s]));
  return (
    <figure className="relative">
      <div className="rounded-2xl border hairline overflow-hidden bg-[color:var(--surface)]/40 p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Coconut OS agent state machine">
          {/* edges */}
          <g stroke="color-mix(in oklab, var(--fg) 25%, transparent)" strokeWidth="1.1" fill="none">
            {EDGES.map(([a, b], i) => {
              const A = byId[a], B = byId[b];
              const dx = (B.x - A.x) * 0.4;
              const path = `M ${A.x + 80} ${A.y + 20} C ${A.x + 80 + dx} ${A.y + 20}, ${B.x - dx} ${B.y + 20}, ${B.x} ${B.y + 20}`;
              return (
                <g key={i}>
                  <path d={path} markerEnd="url(#arrow)" />
                </g>
              );
            })}
          </g>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="color-mix(in oklab, var(--fg) 45%, transparent)" />
            </marker>
          </defs>

          {/* nodes */}
          {STATES.map((s) => (
            <g key={s.id} transform={`translate(${s.x},${s.y})`}>
              <rect
                width="160" height="40" rx="20"
                fill="var(--canvas)"
                stroke={TONE[s.tone]}
                strokeWidth="1.25"
              />
              <text x="14" y="25" fontFamily="ui-monospace, Menlo, monospace" fontSize="12" fill="var(--fg)" letterSpacing="0">
                {s.label}
              </text>
              <circle cx="148" cy="20" r="3" fill={TONE[s.tone]} />
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        eight first-class kernel states · full edge graph + transition guards land with the LLD drop
      </figcaption>
    </figure>
  );
}
