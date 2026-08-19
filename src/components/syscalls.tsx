"use client";

import { Reveal } from "./reveal";

const SYSCALLS = [
  { name: "agent_spawn",       nr: 472, wired: true,  sig: "(struct agent_spawn_args *) → aid",    desc: "Create a new agent. Args are version-gated, the capability set is bound at spawn, the reaper owns teardown." },
  { name: "agent_attest",      nr: 473, wired: true,  sig: "(aid, struct attestation *) → 0 | -E…", desc: "Attest an agent and mint its per-agent key, moving it out of ATTESTING. The signing primitive in the tree today is a keyed MAC; Ed25519 replaces it later." },
  { name: "agent_quota",       nr: 474, wired: true,  sig: "(aid, struct quota_set *) → 0 | -E…",  desc: "Set the resource budget for an agent: CPU shares and memory-tier quotas." },
  { name: "agent_cap_grant",   nr: 475, wired: true,  sig: "(target_aid, struct cap_token *) → 0 | -E…", desc: "Grant a cap-token to an agent. The grantor has to hold the capability. No amplification." },
  { name: "agent_cap_revoke",  nr: 476, wired: true,  sig: "(struct cap_revoke_args *) → 0 | -E…", desc: "Revoke a cap-token mid-execution. The nonce moves to the revoked set." },
  { name: "agent_cap_present", nr: 477, wired: true,  sig: "(cap_id, struct cap_proof *) → 0 | -E…", desc: "Present a capability at use time. This is the hot path the LSM hooks call." },
  { name: "agent_audit_query", nr: 478, wired: false, sig: "(query, out, out_len) → -ENOSYS",      desc: "Query the audit chain per agent, capability-gated. Specified, still a stub." },
  { name: "agent_memory_tier", nr: 479, wired: false, sig: "(aid, tier) → -ENOSYS",                desc: "Memory-tier hint across DRAM, CXL and pmem. Specified, still a stub." },
];

export function Syscalls() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            The agent syscall surface
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[40rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            Eight new syscalls.{" "}
            <span className="text-[color:var(--muted)]">
              Six are implemented and wired on x86_64. Two still return -ENOSYS.
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
            wired · implemented and reachable from userspace on x86_64 · reserved · allocated number, returns -ENOSYS · the arm64 table is not wired yet · the 472-479 range is reserved, not locked · it locks at Gate 1 · full signatures live in docs/05-LLD.md §3
          </p>
        </Reveal>
      </div>
    </section>
  );
}
