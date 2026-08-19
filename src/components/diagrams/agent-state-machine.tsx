/* Agent lifecycle at guard level.

   Six real states, one sentinel, and the eight edges the transition
   table actually codes. The table is a bare bool matrix, so no edge
   carries a predicate of its own: the guard is one shared critical
   section, and what varies per edge is the caller that drives it.
   Three of the eight edges have a production caller. The other five
   are legal and unreachable.

   Every fact here is read at origin/main eef103d. Cites are path:line.
   Static figure, no state, no animation.

   The mark, the cite and the drift annotation come from the shared register
   primitive, so this figure speaks the same vocabulary as every other claim
   on the page. */

import { Cite, Drift, RegisterMark } from "@/components/register";

/* ── states ─────────────────────────────────────────────────────────── */

type StateId = 0 | 1 | 2 | 3 | 4 | 5;

type StateRow = {
  id: StateId;
  name: string;
  reached: boolean;
  note: string;
  cite: string;
};

const STATES: readonly StateRow[] = [
  {
    id: 0,
    name: "NEW",
    reached: true,
    note: "the zalloc'd state. the only enumerator with an explicit value.",
    cite: "kernel/agent/agent.h:54-63 · kernel/agent/agent.c:148, :156",
  },
  {
    id: 1,
    name: "ATTESTING",
    reached: true,
    note: "set by spawn before the registry insert. the aid is already allocated.",
    cite: "kernel/agent/syscalls.c:227-228, :258",
  },
  {
    id: 2,
    name: "RUNNING",
    reached: true,
    note: "set by the first successful attest. nothing has been exec'd by the kernel.",
    cite: "kernel/agent/syscalls.c:525-526",
  },
  {
    id: 3,
    name: "QUOTA_EXCEEDED",
    reached: false,
    note: "no production writer. coconut_agent_set_quota_exceeded is EXPORT_SYMBOL_GPL and has zero non KUnit callers.",
    cite: "kernel/agent/lifecycle.c:244-250",
  },
  {
    id: 4,
    name: "TERMINATING",
    reached: false,
    note: "no production writer. coconut_agent_set_terminating is EXPORT_SYMBOL_GPL and has zero non KUnit callers.",
    cite: "kernel/agent/lifecycle.c:252-258",
  },
  {
    id: 5,
    name: "TERMINATED",
    reached: true,
    note: "absorbing. its row in the table is empty, and it is the one state with a side effect.",
    cite: "kernel/agent/lifecycle.c:94-96 · :202-203",
  },
];

/* ── edges ──────────────────────────────────────────────────────────── */

type EdgeRow = {
  from: StateId;
  to: StateId;
  table: string;
  wrapper: string;
  caller: string;
  callerCite: string;
  live: boolean;
};

const EDGES: readonly EdgeRow[] = [
  {
    from: 0,
    to: 1,
    table: "kernel/agent/lifecycle.c:76-77",
    wrapper: "coconut_agent_set_attesting()",
    caller: "sys_agent_spawn, after the alloc and the aid assignment, before the registry insert",
    callerCite: "kernel/agent/syscalls.c:227-228, :258",
    live: true,
  },
  {
    from: 1,
    to: 2,
    table: "kernel/agent/lifecycle.c:79-80",
    wrapper: "coconut_agent_set_running()",
    caller: "sys_agent_attest on a first attest, after the signature reaches userspace",
    callerCite: "kernel/agent/syscalls.c:505, :525-526",
    live: true,
  },
  {
    from: 1,
    to: 5,
    table: "kernel/agent/lifecycle.c:79, :81",
    wrapper: "coconut_agent_set_terminated()",
    caller:
      "three failure sites, all from ATTESTING: spawn registry insert, attest sign, attest copy_to_user. each is gated on first_attest. the table comment calls this the attest failure shortcut.",
    callerCite: "kernel/agent/syscalls.c:293, :500-501, :512-513",
    live: true,
  },
  {
    from: 2,
    to: 3,
    table: "kernel/agent/lifecycle.c:83-84",
    wrapper: "coconut_agent_set_quota_exceeded()",
    caller:
      "none. agent_quota writes four u64 fields under state_lock and transitions nothing, and no over budget check exists.",
    callerCite: "kernel/agent/lifecycle.c:244-250 · kernel/agent/syscalls.c:644-653",
    live: false,
  },
  {
    from: 2,
    to: 4,
    table: "kernel/agent/lifecycle.c:83, :85",
    wrapper: "coconut_agent_set_terminating()",
    caller: "none. git grep over kernel/ and security/ returns the definition, the header decl, the EXPORT_SYMBOL_GPL and agent_kunit.c only.",
    callerCite: "kernel/agent/lifecycle.c:252-258",
    live: false,
  },
  {
    from: 3,
    to: 2,
    table: "kernel/agent/lifecycle.c:87-88",
    wrapper: "coconut_agent_set_running()",
    caller:
      "none. the named recovery caller coconut_agent_set_running_from_quota appears once tree wide, in a comment. attest cannot drive this edge: it returns -EPERM unless the state is ATTESTING or RUNNING.",
    callerCite: "kernel/agent/syscalls.c:636 · :440-450",
    live: false,
  },
  {
    from: 3,
    to: 4,
    table: "kernel/agent/lifecycle.c:87, :89",
    wrapper: "coconut_agent_set_terminating()",
    caller: "none. this is the edge the header does not document. see the drift note below.",
    callerCite: "kernel/agent/lifecycle.c:252-258",
    live: false,
  },
  {
    from: 4,
    to: 5,
    table: "kernel/agent/lifecycle.c:91-92",
    wrapper: "coconut_agent_set_terminated()",
    caller: "none reaches it. coconut_agent_set_terminated has exactly three production call sites tree wide and all three fire from ATTESTING, never from TERMINATING.",
    callerCite: "kernel/agent/syscalls.c:293, :500-501, :512-513",
    live: false,
  },
];

/* ── the shared guard ───────────────────────────────────────────────── */

type GuardStep = { code: string; result: string; cite: string; inLock: boolean };

const GUARD: readonly GuardStep[] = [
  { code: "!agent", result: "-EFAULT", cite: ":151-152", inLock: false },
  { code: "WARN_ON_ONCE(new_state >= __MAX)", result: "-EINVAL", cite: ":154-155", inLock: false },
  { code: "spin_lock(&agent->state_lock)", result: "lock taken", cite: ":157", inLock: true },
  { code: "WARN_ON_ONCE(old_state >= __MAX)", result: "unlock, -EINVAL", cite: ":161-165", inLock: true },
  {
    code: "allowed = coconut_agent_allowed_transitions[old][new]",
    result: "one array read",
    cite: ":167",
    inLock: true,
  },
  { code: "!allowed", result: "unlock, rate limited pr_warn, -EINVAL", cite: ":169-178", inLock: true },
  { code: "agent->state = new_state", result: "committed", cite: ":180", inLock: true },
  { code: "spin_unlock, then pr_debug", result: "0", cite: ":182-187, :225", inLock: false },
  {
    code: "new_state == TERMINATED",
    result: "coconut_agent_reaper_kick(agent), after the unlock",
    cite: ":202-203",
    inLock: false,
  },
];

/* ── matrix ─────────────────────────────────────────────────────────── */

const ALLOWED: ReadonlySet<string> = new Set(EDGES.map((e) => `${e.from}-${e.to}`));
const LIVE: ReadonlySet<string> = new Set(EDGES.filter((e) => e.live).map((e) => `${e.from}-${e.to}`));
const DRIFT_CELL = "3-4";
const IDS: readonly StateId[] = [0, 1, 2, 3, 4, 5];

/* ── svg geometry (sm and up only) ──────────────────────────────────── */

const NW = 140;
const NH = 36;
const COL_X = [16, 192, 368, 544];
const ROW_Y = [70, 160];
const VB_W = 700;
const VB_H = 272;

const POS: Record<StateId, { x: number; y: number }> = {
  0: { x: COL_X[0], y: ROW_Y[0] },
  1: { x: COL_X[1], y: ROW_Y[0] },
  2: { x: COL_X[2], y: ROW_Y[0] },
  3: { x: COL_X[2], y: ROW_Y[1] },
  4: { x: COL_X[3], y: ROW_Y[0] },
  5: { x: COL_X[3], y: ROW_Y[1] },
};

function box(id: StateId) {
  const p = POS[id];
  return { ...p, cx: p.x + NW / 2, cy: p.y + NH / 2, right: p.x + NW, bottom: p.y + NH };
}

function edgePath(from: StateId, to: StateId): string {
  const a = box(from);
  const b = box(to);

  /* ATTESTING to TERMINATED routes under both rows so it never crosses
     RUNNING or QUOTA_EXCEEDED. */
  if (from === 1 && to === 5) {
    return `M ${a.cx} ${a.bottom} C ${a.cx} 260, ${b.cx} 260, ${b.cx} ${b.bottom}`;
  }
  /* the RUNNING and QUOTA_EXCEEDED pair, offset so the two legs read apart */
  if (from === 2 && to === 3) {
    const x = a.cx - 16;
    return `M ${x} ${a.bottom} C ${x} ${a.bottom + 30}, ${x} ${b.y - 30}, ${x} ${b.y}`;
  }
  if (from === 3 && to === 2) {
    const x = a.cx + 16;
    return `M ${x} ${a.y} C ${x} ${a.y - 30}, ${x} ${b.bottom + 30}, ${x} ${b.bottom}`;
  }
  /* same row: face to face */
  if (a.cy === b.cy) {
    const mid = (a.right + b.x) / 2;
    return `M ${a.right} ${a.cy} C ${mid} ${a.cy}, ${mid} ${b.cy}, ${b.x} ${b.cy}`;
  }
  /* same column: top to bottom */
  if (a.cx === b.cx) {
    const mid = (a.bottom + b.y) / 2;
    return `M ${a.cx} ${a.bottom} C ${a.cx} ${mid}, ${b.cx} ${mid}, ${b.cx} ${b.y}`;
  }
  /* diagonal: leave the right face, enter the left face */
  const mid = (a.right + b.x) / 2;
  return `M ${a.right} ${a.cy} C ${mid} ${a.cy}, ${mid} ${b.cy}, ${b.x} ${b.cy}`;
}

function stateName(id: StateId): string {
  return STATES[id].name;
}

/* ── figure ─────────────────────────────────────────────────────────── */

export function AgentStateMachine() {
  return (
    <figure>
      <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-6">
        {/* legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-[color:var(--muted)]">
          <span className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ background: "var(--accent)" }} aria-hidden />
            has a production caller · 3 of 8 edges at eef103d
          </span>
          <span className="flex items-center gap-2">
            <span
              className="block w-5 border-t border-dotted"
              style={{ borderColor: "var(--highlight)" }}
              aria-hidden
            />
            legal in the table, no production caller · 5 of 8
          </span>
        </div>

        {/* graph · sm and up. the ordered list below carries the same content at every width. */}
        <div className="hidden sm:block mt-5">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="block w-full h-auto"
            role="img"
            aria-label="Six agent states and the eight transitions the kernel transition table codes. Three transitions have a production caller."
          >
            <defs>
              <marker id="asm-arrow-live" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
              </marker>
              <marker id="asm-arrow-dead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="color-mix(in oklab, var(--highlight) 80%, transparent)" />
              </marker>
            </defs>

            {EDGES.map((e) => (
              <path
                key={`${e.from}-${e.to}`}
                d={edgePath(e.from, e.to)}
                fill="none"
                stroke={e.live ? "var(--accent)" : "color-mix(in oklab, var(--highlight) 80%, transparent)"}
                strokeWidth="1.2"
                strokeDasharray={e.live ? undefined : "3 3"}
                markerEnd={`url(#asm-arrow-${e.live ? "live" : "dead"})`}
              />
            ))}

            {STATES.map((s) => {
              const p = box(s.id);
              const tone = s.reached ? "var(--accent)" : "var(--highlight)";
              return (
                <g key={s.id} transform={`translate(${p.x},${p.y})`}>
                  <rect
                    width={NW}
                    height={NH}
                    rx={2}
                    fill="var(--canvas)"
                    stroke={tone}
                    strokeWidth="1.2"
                    strokeDasharray={s.reached ? undefined : "3 3"}
                  />
                  <text
                    x={10}
                    y={NH / 2 + 4}
                    fontFamily="ui-monospace, monospace"
                    fontSize="12.5"
                    fill="var(--fg)"
                    letterSpacing="-0.3"
                  >
                    {s.name}
                  </text>
                  <text
                    x={NW - 10}
                    y={NH / 2 + 4}
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10.5"
                    fill="color-mix(in oklab, var(--muted) 90%, transparent)"
                  >
                    {s.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* the eight edges */}
        <div className="mt-6 pt-5 border-t hairline">
          <div className="flex items-center gap-2 flex-wrap">
            <RegisterMark state="built" />
            <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
              the table codes 8 directed edges of 36 cells
            </span>
            <Cite source="kernel/agent/lifecycle.c:74-97" />
          </div>

          <ol className="mt-4 space-y-2">
            {EDGES.map((e, i) => (
              <li
                key={`${e.from}-${e.to}`}
                className="rounded-[2px] border p-3"
                style={{
                  background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
                  borderColor: e.live
                    ? "color-mix(in oklab, var(--accent) 32%, transparent)"
                    : "color-mix(in oklab, var(--fg) 12%, transparent)",
                  borderStyle: e.live ? "solid" : "dotted",
                }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[10.5px] text-[color:var(--muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-[12px] tracking-tight break-words"
                    style={{ color: e.live ? "var(--accent)" : "var(--highlight)" }}
                  >
                    {stateName(e.from)} to {stateName(e.to)}
                  </span>
                  <Cite source={e.table} />
                </div>
                <div className="mt-1.5 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug break-words">
                  {e.wrapper}
                </div>
                <div className="mt-1 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug break-words">
                  <span className="text-[color:var(--muted)]">caller · </span>
                  {e.caller}
                </div>
                <div className="mt-1">
                  <Cite source={e.callerCite} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* the shared guard */}
        <div className="mt-6 pt-5 border-t hairline">
          <div className="flex items-center gap-2 flex-wrap">
            <RegisterMark state="built" />
            <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
              one guard for every edge · coconut_agent_lifecycle_transition()
            </span>
            <Cite source="kernel/agent/lifecycle.c:145-226" />
          </div>
          <p className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/70 leading-snug">
            No edge carries a predicate of its own. The table is a bool matrix, so the check and the
            act are folded into one spinlock section.
          </p>

          <ol className="mt-4 space-y-1.5">
            {GUARD.map((g, i) => (
              <li
                key={g.cite}
                className="grid grid-cols-[26px_1fr] gap-2 sm:gap-3 items-start pl-2"
                style={{
                  borderLeft: g.inLock
                    ? "1px solid color-mix(in oklab, var(--accent) 40%, transparent)"
                    : "1px solid transparent",
                }}
              >
                <span className="font-mono text-[10.5px] text-[color:var(--muted)] pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="font-mono text-[11.5px] text-[color:var(--fg)]/85 break-words">
                    {g.code}
                  </span>
                  <span className="font-mono text-[11.5px] text-[color:var(--muted)]"> · {g.result} · </span>
                  <Cite source={g.cite} />
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-3 font-mono text-[11px] text-[color:var(--muted)] leading-snug">
            steps 03 to 07 hold state_lock. No allocation, no observer call and no audit emit run
            inside it. The rejection warn is bounded by one kernel global DEFINE_RATELIMIT_STATE at
            5s interval and 10 burst, shared across all agents, so one rogue caller cannot flood
            dmesg. <Cite source="kernel/agent/lifecycle.c:112-120 · :169-178" />
          </div>

          <div
            className="mt-4 rounded-[2px] border p-3"
            style={{
              background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
              borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <RegisterMark state="built" />
              <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
                the one per edge condition that exists · sys_agent_attest
              </span>
              <Cite source="kernel/agent/syscalls.c:374, :440-450, :487-515" />
            </div>
            <div className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
              Under state_lock it reads the state before it decides. ATTESTING means a first attest.
              RUNNING means a re attest and no transition at all. NEW, QUOTA_EXCEEDED, TERMINATING
              and TERMINATED unlock and return -EPERM. On a first attest, a sign failure or a
              copy_to_user failure both drive ATTESTING to TERMINATED. On a re attest neither does.
            </div>
          </div>
        </div>

        {/* the 6x6 matrix */}
        <div className="mt-6 pt-5 border-t hairline">
          <div className="flex items-center gap-2 flex-wrap">
            <RegisterMark state="built" />
            <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
              coconut_agent_allowed_transitions[__MAX][__MAX] · 8 of 36 cells true
            </span>
            <Cite source="kernel/agent/lifecycle.c:74-97" />
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-start gap-5">
            <div className="overflow-x-auto">
              <table className="border-collapse font-mono text-[11px]">
                <caption className="sr-only">
                  Transition matrix. Rows are the current state id, columns are the requested state
                  id. 1 means the transition is permitted, 0 means it is rejected with -EINVAL.
                </caption>
                <thead>
                  <tr>
                    <th className="p-1.5 text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)] font-normal text-left">
                      old \ new
                    </th>
                    {IDS.map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className="p-1.5 w-7 text-center text-[color:var(--muted)] font-normal"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {IDS.map((r) => (
                    <tr key={r}>
                      <th
                        scope="row"
                        className="p-1.5 text-right text-[color:var(--muted)] font-normal"
                      >
                        {r}
                      </th>
                      {IDS.map((c) => {
                        const key = `${r}-${c}`;
                        const on = ALLOWED.has(key);
                        const live = LIVE.has(key);
                        const drift = key === DRIFT_CELL;
                        return (
                          <td key={c} className="p-0.5 text-center">
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-[2px]"
                              style={{
                                color: on
                                  ? drift
                                    ? "var(--warning)"
                                    : live
                                      ? "var(--accent)"
                                      : "var(--highlight)"
                                  : "color-mix(in oklab, var(--muted) 70%, transparent)",
                                border: on
                                  ? `1px ${live ? "solid" : "dotted"} ${
                                      drift
                                        ? "var(--warning)"
                                        : live
                                          ? "color-mix(in oklab, var(--accent) 45%, transparent)"
                                          : "color-mix(in oklab, var(--highlight) 55%, transparent)"
                                    }`
                                  : "1px solid transparent",
                                background: live
                                  ? "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)"
                                  : "transparent",
                              }}
                            >
                              {on ? "1" : "0"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="min-w-0 space-y-1.5">
              {STATES.map((s) => (
                <div key={s.id} className="flex gap-2">
                  <dt className="font-mono text-[11px] text-[color:var(--muted)] w-3 shrink-0">{s.id}</dt>
                  <dd className="min-w-0">
                    <span
                      className="font-mono text-[11.5px]"
                      style={{ color: s.reached ? "var(--fg)" : "var(--highlight)" }}
                    >
                      {s.name}
                    </span>
                    <span className="font-mono text-[11.5px] text-[color:var(--fg)]/65 break-words">
                      {" "}
                      {s.note}{" "}
                    </span>
                    <Cite source={s.cite} />
                  </dd>
                </div>
              ))}
              <div className="flex gap-2">
                <dt className="font-mono text-[11px] text-[color:var(--muted)] w-3 shrink-0">6</dt>
                <dd className="min-w-0">
                  <span className="font-mono text-[11.5px] text-[color:var(--fg)]">
                    COCONUT_AGENT_STATE__MAX
                  </span>
                  <span className="font-mono text-[11.5px] text-[color:var(--fg)]/65 break-words">
                    {" "}
                    sentinel. it is both dimensions of the matrix and the NULL agent return of
                    coconut_agent_state_locked().{" "}
                  </span>
                  <Cite source="kernel/agent/agent.h:54-63 · kernel/agent/lifecycle.c:286-287" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 font-mono text-[11px] text-[color:var(--muted)] leading-snug">
            The initializer is designated and sparse, so every unlisted cell is false by C zero init.
            That includes every self edge: RUNNING to RUNNING is rejected. Row 5 is empty, which is
            what makes TERMINATED absorbing. <Cite source="kernel/agent/lifecycle.c:74-97" />
          </div>

          <Drift
            className="mt-4"
            docSays="kernel/agent/agent.h:46-52 enumerates 7 edges and omits QUOTA_EXCEEDED to TERMINATING."
            codeDoes="kernel/agent/lifecycle.c:74-97 codes 8. the 8th is the QUOTA_EXCEEDED row opener at :87 and its TERMINATING cell at :89. the prologue comment at kernel/agent/lifecycle.c:58-66 says it is the matrix from agent.h, then lists 8 and agrees with the code, so two in tree descriptions of the same table disagree with each other."
          />
        </div>

        {/* the two documented edges that go nowhere */}
        <div className="mt-6 pt-5 border-t hairline grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-[2px] border p-3"
            style={{
              background: "var(--canvas)",
              borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <RegisterMark state="designed" />
              <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
                what the quota cycle is meant to be
              </span>
              <Cite source="STORY-K-2.7 · kernel/agent/agent.h:194-219" />
            </div>
            <div className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
              The header documents the RUNNING and QUOTA_EXCEEDED pair as a token bucket. Tokens are
              deducted on cap_present and refilled by a sched tick at refill_per_sec. Over budget
              drives RUNNING to QUOTA_EXCEEDED, a refill or an agent_quota raise drives it back, per
              the enum header at kernel/agent/agent.h:49-50. No deduction site, no refill site and no over budget
              check exist in the tree, so both edges stay legal and unreachable. The header names its
              own gap twice: window_ns is used by cap_present rate limit when STORY-K-2.7 lands, and
              v1 records all four fields while enforcement of tokens deduction lands at STORY-K-2.7,
              the cap_present hot path.
            </div>
            <div className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
              The other quota struct is not this one. coconut_agent_quota carries cpu_shares and
              spawn_rate, is cgroup-v2 oriented, and lands at STORY-K-4.6 behind
              coconut_cgroup_agent_can_spawn. It gates spawn admission. It does not drive the RUNNING
              and QUOTA_EXCEEDED pair. <Cite source="STORY-K-4.6 · kernel/agent/agent.h:79-88" />
            </div>
          </div>

          <div
            className="rounded-[2px] border p-3"
            style={{
              background: "var(--canvas)",
              borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <RegisterMark state="built" />
              <span className="min-w-0 break-words font-mono text-[11.5px] text-[color:var(--fg)]/85">
                an agent that reaches RUNNING is never torn down
              </span>
              <Cite source="kernel/agent/agent.h:51 · kernel/agent/lifecycle.c:252-258" />
            </div>
            <div className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
              RUNNING to TERMINATING is the only exit from RUNNING and nothing calls it. There is no
              coconut code in kernel/exit.c, kernel/fork.c or include/linux/sched.h. agent_drop_self
              is named at kernel/agent/agent.h:51 and appears exactly once tree wide, in that comment. Every agent
              that attests keeps its slab object, its registry slot and its cap_set for the rest of
              the boot.
            </div>
            <div className="mt-3 pt-3 border-t hairline flex items-center gap-2 flex-wrap">
              <RegisterMark state="must-be" />
              <Cite source="v1.0 · Gate 1" />
            </div>
            <div className="mt-2 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
              An agent that stops running leaves the registry and gives its slot back. The trigger is
              still unpicked: a process exit hook, a drop self syscall in the 478 or 479 slot, or an
              agentfs ctl write. The answer decides whether the registry needs a bound before the
              gate.
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight leading-snug">
        source · kernel/agent/lifecycle.c:58-97, :112-120, :145-226, :244-258, :286-287 ·
        kernel/agent/agent.h:45-63, :79-88, :194-219 · kernel/agent/agent.c:148, :156 ·
        kernel/agent/syscalls.c:227-228, :258, :293, :440-450, :487-515, :500-501, :505, :512-513,
        :525-526, :636, :644-653, read at origin/main eef103d.
        limit · the table is a bare bool matrix, so no edge has a predicate of its own and none is
        drawn here. Lifecycle coverage is 5 KUNIT_CASE entries in tree at
        kernel/agent/agent_kunit.c:621-625, executed count unasserted by any job, with no full
        matrix test and no concurrency test. The dedicated suite promised at
        kernel/agent/lifecycle.c:324-332, including its 100 thread state_lock stress case, is not in
        the tree.
      </figcaption>
    </figure>
  );
}
