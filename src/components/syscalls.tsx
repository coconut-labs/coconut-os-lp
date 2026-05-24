"use client";

import { Reveal } from "./reveal";

const SYSCALLS = [
  { name: "agent_spawn",       sig: "(manifest, cap_set) → aid",            desc: "Create a new agent. Manifest is signature-verified, cap_set is bound at spawn." },
  { name: "agent_attest",      sig: "(aid) → attestation_chain",            desc: "Return the attestation chain linking running code to signed manifest and authorizer." },
  { name: "agent_quota",       sig: "(aid, kind, budget) → 0 | -E…",        desc: "Set or query the resource budget for an agent: CPU, mem, HBM, network, inference tokens." },
  { name: "agent_cap_grant",   sig: "(aid, cap) → 0 | -E…",                 desc: "Grant a capability to an agent. Caller must hold CAP_GRANT(cap). All-or-nothing per call." },
  { name: "agent_cap_revoke",  sig: "(aid, cap) → 0 | -E…",                 desc: "Revoke a capability mid-execution. Pending operations using the cap return -ECAPABILITY." },
  { name: "agent_cap_present", sig: "(aid, cap) → 0 | -E…",                 desc: "Present a capability at syscall time. The LSM hook gates every privileged operation." },
  { name: "agent_audit_query", sig: "(filter) → audit_chain_segment",       desc: "Query the tamper-evident audit chain. Filter by aid, time, event type, capability." },
  { name: "agent_memory_tier", sig: "(aid, tier, request) → addr | -E…",    desc: "Allocate from a tier-addressable memory budget: HBM (GPU) · RAM · SSD-extended." },
];

export function Syscalls() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 04 — The agent syscall surface
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[40rem] text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.12] tracking-[-0.015em]">
            Eight new syscalls.{" "}
            <span className="text-[color:var(--muted)]">
              Tooled to the same standard as ps, top, strace, journalctl.
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 rounded-2xl border hairline overflow-hidden">
          <div className="grid grid-cols-1 divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)" }}>
            {SYSCALLS.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.03} amount={0.2}>
                <div className="group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-8 px-5 sm:px-7 py-5 hover:bg-[color:var(--surface)] transition-colors duration-300" style={{ borderColor: "color-mix(in oklab, var(--fg) 10%, transparent)" }}>
                  <div className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">
                    {s.name}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[12.5px] text-[color:var(--muted)] break-words">
                      {s.sig}
                    </div>
                    <p className="mt-2 text-[14.5px] leading-[1.55] text-[color:var(--fg)]/85">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            Full LLD lives in docs/05-LLD.md · userspace bindings ship in libcoconut.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
