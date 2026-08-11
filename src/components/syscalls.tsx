"use client";

import { Reveal } from "./reveal";

const SYSCALLS = [
  { name: "agent_spawn",       nr: 472, wired: true,  sig: "(manifest, cap_set) → aid",            desc: "Create a new agent. Manifest is signature-verified, cap_set is bound at spawn." },
  { name: "agent_attest",      nr: 473, wired: true,  sig: "(aid) → attestation_chain",            desc: "Return the attestation chain linking running code to signed manifest and authorizer." },
  { name: "agent_quota",       nr: 474, wired: false, sig: "(aid, kind, budget) → 0 | -E…",        desc: "Set or query the resource budget for an agent: CPU, mem, HBM, network, inference tokens." },
  { name: "agent_cap_grant",   nr: 475, wired: false, sig: "(aid, cap) → 0 | -E…",                 desc: "Grant a capability to an agent. Caller must hold CAP_GRANT(cap). All-or-nothing per call." },
  { name: "agent_cap_revoke",  nr: 476, wired: false, sig: "(aid, cap) → 0 | -E…",                 desc: "Revoke a capability mid-execution. Pending operations using the cap return -ECAPABILITY." },
  { name: "agent_cap_present", nr: 477, wired: false, sig: "(aid, cap) → 0 | -E…",                 desc: "Present a capability at syscall time. The LSM hook gates every privileged operation." },
  { name: "agent_audit_query", nr: 478, wired: false, sig: "(filter) → audit_chain_segment",       desc: "Query the tamper-evident audit chain. Filter by aid, time, event type, capability." },
  { name: "agent_memory_tier", nr: 479, wired: false, sig: "(aid, tier, request) → addr | -E…",    desc: "Allocate from a tier-addressable memory budget: HBM (GPU) · RAM · SSD-extended." },
];

export function Syscalls() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 04 · The agent syscall surface
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[40rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            Eight new syscalls.{" "}
            <span className="text-[color:var(--muted)]">
              Two wired in prototypes. Six reserved.
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 rounded-[2px] border hairline overflow-hidden">
          <div className="grid grid-cols-1 divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)" }}>
            {SYSCALLS.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.03} amount={0.2}>
                <div className="group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-8 px-5 sm:px-7 py-5 hover:bg-[color:var(--surface)] transition-colors duration-300" style={{ borderColor: "color-mix(in oklab, var(--fg) 10%, transparent)" }}>
                  <div>
                    <div className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">
                      {s.name}
                    </div>
                    <div className="mt-1 font-mono text-[10.5px] text-[color:var(--muted)] tracking-tight">
                      #{s.nr}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div className="font-mono text-[12.5px] text-[color:var(--muted)] break-words">
                        {s.sig}
                      </div>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border"
                        style={{
                          color: s.wired ? "var(--success)" : "var(--muted)",
                          borderColor: s.wired
                            ? "color-mix(in oklab, var(--success) 45%, transparent)"
                            : "color-mix(in oklab, var(--muted) 35%, transparent)",
                          borderRadius: "2px",
                        }}
                      >
                        {s.wired ? "wired" : "reserved"}
                      </span>
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
            wired · implemented in the kernel prototypes today &nbsp;·&nbsp; reserved · allocated number, returns -ENOSYS &nbsp;·&nbsp; full LLD lives in docs/05-LLD.md
          </p>
        </Reveal>
      </div>
    </section>
  );
}
