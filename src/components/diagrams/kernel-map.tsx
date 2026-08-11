"use client";

/* Kernel map — HLD-level view of the linux-6.12-coconut fork.
   Two regions: existing subsystems modified (left, dashed), new
   subsystems added (right, solid + accent). Userspace surface at
   the bottom. Public preview shows the shape; specific file paths
   and patch surface stay in the LLD. */

import { useState } from "react";

type Box = {
  id: string;
  label: string;
  sub: string;
  group: "modified" | "new" | "userspace" | "core";
};

const MODIFIED: Box[] = [
  { id: "mm",     label: "mm/",           sub: "tier-aware allocator hooks", group: "modified" },
  { id: "fs",     label: "fs/",           sub: "capability-gated VFS routing", group: "modified" },
  { id: "cred",   label: "kernel/cred.c", sub: "field-append for AID + caps",  group: "modified" },
  { id: "sched",  label: "kernel/sched/", sub: "AID-aware fair-share lane",   group: "modified" },
  { id: "cgroup", label: "kernel/cgroup/",sub: "agent cgroup controller v3",  group: "modified" },
];

const NEW: Box[] = [
  { id: "kagent", label: "kernel/agent/",         sub: "AID alloc · state machine · spawn",     group: "new" },
  { id: "kaudit", label: "kernel/audit/coconut/", sub: "BLAKE3 chain · per-CPU ring · sealer",  group: "new" },
  { id: "lsm",    label: "security/coconut/",     sub: "LSM hooks · capability presentation",   group: "new" },
];

export function KernelMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">
        {/* Title strip */}
        <div className="flex items-baseline justify-between gap-4 mb-5 pb-3 border-b hairline">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">linux-6.12-coconut</div>
            <div className="mt-1 font-mono text-[14px] text-[color:var(--fg)] tracking-tight">the kernel · hard fork</div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Legend dot="muted" body="modified" />
            <Legend dot="accent" body="new" />
          </div>
        </div>

        {/* Two-region grid: modified | new */}
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-3 md:gap-5">
          {/* Modified */}
          <div className="relative rounded-[2px] border" style={{ background: "color-mix(in oklab, var(--canvas) 92%, var(--muted) 8%)", borderColor: "color-mix(in oklab, var(--muted) 28%, transparent)", borderStyle: "dashed" }}>
            <RegionLabel tone="muted">modified · capability-aware hooks</RegionLabel>
            <div className="p-4 sm:p-5 grid grid-cols-1 gap-2.5">
              {MODIFIED.map((b) => <BoxRow key={b.id} b={b} active={active === b.id} onHover={() => setActive(b.id)} onLeave={() => setActive(null)} />)}
            </div>
          </div>

          {/* New */}
          <div className="relative rounded-[2px] border" style={{ background: "color-mix(in oklab, var(--canvas) 86%, var(--accent) 14%)", borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)" }}>
            <RegionLabel tone="accent">new · agent subsystems</RegionLabel>
            <div className="p-4 sm:p-5 grid grid-cols-1 gap-2.5">
              {NEW.map((b) => <BoxRow key={b.id} b={b} active={active === b.id} onHover={() => setActive(b.id)} onLeave={() => setActive(null)} />)}
            </div>
          </div>
        </div>

        {/* Bridge: syscall surface */}
        <div className="mt-5 rounded-[2px] border hairline p-4 sm:p-5" style={{ background: "color-mix(in oklab, var(--canvas) 88%, var(--highlight) 12%)", borderColor: "color-mix(in oklab, var(--highlight) 40%, transparent)" }}>
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--highlight)" }}>syscall surface · userspace bridge</div>
              <div className="mt-1 font-mono text-[13.5px] text-[color:var(--fg)] tracking-tight">syscalls 472-479 · stable ABI from v1.0</div>
            </div>
            <div className="font-mono text-[11px] text-[color:var(--muted)]">range reserved through LKML at Sprint 1</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "agent_spawn","agent_attest","agent_quota",
              "agent_cap_grant","agent_cap_revoke","agent_cap_present",
              "agent_audit_query","agent_memory_tier",
            ].map((s) => (
              <span key={s} className="font-mono text-[11px] px-2 py-1 rounded-md border" style={{
                background: "color-mix(in oklab, var(--canvas) 88%, var(--surface) 12%)",
                borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
                color: "var(--accent)",
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Below: coconutd handoff */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2.5">
          <div className="rounded-[2px] border hairline px-4 py-3 text-center sm:text-right">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">kernel hands off PID 1 →</div>
          </div>
          <div className="font-mono text-[10.5px] text-[color:var(--muted)] sm:px-2 text-center">·</div>
          <div className="rounded-[2px] border hairline px-4 py-3 text-center sm:text-left" style={{ background: "color-mix(in oklab, var(--canvas) 86%, var(--accent) 14%)", borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }}>
            <div className="font-mono text-[12px] text-[color:var(--fg)] tracking-tight">coconutd</div>
            <div className="font-mono text-[10.5px] text-[color:var(--muted)]">PID 1 · agent supervisor · CBOR IPC</div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        modified subsystems carry the hooks · new subsystems carry the agent surface · the syscall API is the contract everything else honors
      </figcaption>
    </figure>
  );
}

function BoxRow({ b, active, onHover, onLeave }: { b: Box; active: boolean; onHover: () => void; onLeave: () => void }) {
  const tone = b.group === "new" ? "var(--accent)" : "var(--muted)";
  return (
    <button
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      className="w-full text-left rounded-[2px] border px-3.5 py-2.5 outline-none transition-[transform,background,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
      style={{
        background: active
          ? "color-mix(in oklab, var(--canvas) 80%, var(--surface) 20%)"
          : "color-mix(in oklab, var(--canvas) 94%, var(--surface) 6%)",
        borderColor: active
          ? `color-mix(in oklab, ${tone} 55%, transparent)`
          : "color-mix(in oklab, var(--fg) 12%, transparent)",
        transform: active ? "translateX(2px)" : "translateX(0)",
        transitionTimingFunction: "var(--ease-precise)",
      }}
    >
      <div className="font-mono text-[12.5px] tracking-tight" style={{ color: tone }}>{b.label}</div>
      <div className="font-mono text-[11px] text-[color:var(--muted)] mt-0.5">{b.sub}</div>
    </button>
  );
}

function RegionLabel({ tone, children }: { tone: "muted" | "accent"; children: React.ReactNode }) {
  return (
    <div
      className="absolute -top-2.5 left-4 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] rounded-sm"
      style={{
        background: "var(--canvas)",
        color: tone === "accent" ? "var(--accent)" : "var(--muted)",
      }}
    >
      {children}
    </div>
  );
}

function Legend({ dot, body }: { dot: "muted" | "accent"; body: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[color:var(--muted)]">
      <span className="w-2 h-2 rounded-full" style={{ background: dot === "accent" ? "var(--accent)" : "var(--muted)" }} />
      {body}
    </span>
  );
}
