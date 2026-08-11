"use client";

/* Syscall hot path — agent_spawn from userspace through the kernel.
   Six stages with the function/file at each step and the contract
   that holds. Medium-level: shows the *route*, not the function-body
   internals. Off-path-end notes name what stays in LLD. */

const STAGES = [
  {
    layer: "userspace",
    box:   "libcoconut",
    code:  "agent_spawn(manifest, cap_set)",
    note:  "thin libc wrapper · serializes manifest + caps to CBOR",
    tone:  "muted",
  },
  {
    layer: "syscall",
    box:   "syscall table",
    code:  "sys_agent_spawn · #472",
    note:  "trap into kernel · arg copy · auditable entry point",
    tone:  "muted",
  },
  {
    layer: "kernel/agent",
    box:   "spawn dispatcher",
    code:  "agent_spawn_dispatch()",
    note:  "validate manifest sig (Ed25519) · allocate AID · build cap_set",
    tone:  "accent",
  },
  {
    layer: "security/coconut",
    box:   "LSM presentation",
    code:  "lsm_coconut_agent_spawn_hook()",
    note:  "caller holds CAP_AGENT_SPAWN? · subset-of-parent caps check",
    tone:  "accent",
  },
  {
    layer: "kernel/audit/coconut",
    box:   "audit append",
    code:  "audit_chain_append(ev=spawn)",
    note:  "BLAKE3(prev_head || event) · per-CPU ring · sealer kthread",
    tone:  "highlight",
  },
  {
    layer: "kernel/sched",
    box:   "scheduler register",
    code:  "sched_register_aid(aid, lane)",
    note:  "agent gets a fair-share lane · cgroup populated · READY",
    tone:  "muted",
  },
];

const TONE: Record<string, string> = {
  muted:     "var(--muted)",
  accent:    "var(--accent)",
  highlight: "var(--highlight)",
};

export function SyscallHotPath() {
  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">
        <div className="grid grid-cols-1 md:grid-cols-[160px_28px_1fr] gap-3 md:gap-5">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)] hidden md:block pt-1">layer</div>
          <div className="hidden md:block" />
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)] hidden md:block pt-1">function · contract</div>
        </div>

        <ol className="relative mt-3 space-y-2">
          {/* spine */}
          <div className="absolute left-[180px] md:left-[174px] top-3 bottom-3 w-px bg-[color-mix(in_oklab,var(--fg)_15%,transparent)] hidden md:block" aria-hidden />
          {STAGES.map((s, i) => {
            const tone = TONE[s.tone];
            const isHandoff = i > 0 && STAGES[i - 1].layer !== s.layer && (
              s.layer.startsWith("kernel/") && !STAGES[i - 1].layer.startsWith("kernel/")
              || s.layer === "syscall" && STAGES[i - 1].layer === "userspace"
            );
            return (
              <li key={i}>
                {isHandoff && (
                  <div className="flex items-center gap-2 px-1 py-2 -mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]/70">
                    <span className="w-6 h-px bg-[color-mix(in_oklab,var(--fg)_18%,transparent)]" />
                    handoff
                    <span className="flex-1 h-px bg-[color-mix(in_oklab,var(--fg)_10%,transparent)]" />
                  </div>
                )}
                <div className="grid grid-cols-[120px_28px_1fr] md:grid-cols-[160px_28px_1fr] gap-3 md:gap-5 items-start">
                  <div className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight pt-2.5 md:text-right break-words">
                    {s.layer}
                  </div>
                  <div className="relative pt-3">
                    <span className="absolute left-1/2 top-3 -translate-x-1/2 block w-2.5 h-2.5 rounded-full" style={{
                      background: "var(--canvas)",
                      border: `1.5px solid ${tone}`,
                    }} />
                  </div>
                  <div
                    className="min-w-0 rounded-[2px] border p-3 sm:p-3.5"
                    style={{
                      background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
                      borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
                    }}
                  >
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono text-[12px] tracking-tight" style={{ color: tone }}>{s.box}</span>
                      <span className="font-mono text-[11.5px] text-[color:var(--muted)] break-words">{s.code}</span>
                    </div>
                    <div className="mt-1.5 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">{s.note}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* return path indicator */}
        <div className="mt-6 pt-5 border-t hairline grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-[2px]" style={{ background: "color-mix(in oklab, var(--success) 12%, var(--canvas))", border: "1px solid color-mix(in oklab, var(--success) 35%, transparent)" }}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--success)" }}>return</div>
            <div className="mt-1 font-mono text-[12px] text-[color:var(--fg)]/85">aid (u64) · agent in READY state · cgroup populated</div>
          </div>
          <div className="p-3 rounded-[2px]" style={{ background: "color-mix(in oklab, var(--accent) 12%, var(--canvas))", border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)" }}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--accent)" }}>error</div>
            <div className="mt-1 font-mono text-[12px] text-[color:var(--fg)]/85">-EPERM · -EINVAL · -ENOMEM · -EBUSY · audit row sealed regardless</div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        the canonical agent_spawn path · function-body internals + the cred-shim approach pin in the LLD drop
      </figcaption>
    </figure>
  );
}
