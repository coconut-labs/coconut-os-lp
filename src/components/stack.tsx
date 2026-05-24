"use client";

import { Reveal } from "./reveal";

const LAYERS = [
  {
    n: "L5",
    name: "Brand + distribution",
    items: ["ISO build (x86_64 + ARM64, reproducible)", "coconutos.org", "GPG signing · mirror network", "Brand system"],
    tone: "muted",
  },
  {
    n: "L4",
    name: "Showcase workloads",
    items: ["Dream Team — 31-agent virtual eng org", "Coconut Studio — flagship agent workbench"],
    tone: "muted",
  },
  {
    n: "L3",
    name: "Shell + UX",
    items: ["Coconut Shell — Wayland compositor (Rust + Smithay)", "Coconut Center · Coconut Terminal · Coconut Display Manager"],
    tone: "highlight",
  },
  {
    n: "L2",
    name: "Inference substrate",
    items: ["kvwarden — GPU inference broker (CUDA · x86_64)", "mlxd — NPU inference broker (MLX · ARM64)"],
    tone: "highlight",
    sub: "existing Coconut Labs projects · integrated as default brokers",
  },
  {
    n: "L1",
    name: "System userspace",
    items: ["coconutd — PID 1, agent supervisor (replaces systemd)", "coconutpkg · coconut-installer · coconutfs-tools · libcoconut"],
    tone: "accent",
  },
  {
    n: "L0",
    name: "Kernel",
    items: [
      "linux-6.12-coconut — hard fork",
      "modified: mm/ · fs/ · kernel/cred.c · kernel/sched/ · kernel/cgroup/",
      "new: kernel/agent/ · kernel/audit/coconut/ · security/coconut/",
    ],
    tone: "accent",
    sub: "8 new syscalls: agent_spawn · agent_attest · agent_quota · agent_cap_grant · agent_cap_revoke · agent_cap_present · agent_audit_query · agent_memory_tier",
  },
];

const TONE_BG: Record<string, string> = {
  muted: "color-mix(in oklab, var(--canvas) 92%, var(--muted) 8%)",
  highlight: "color-mix(in oklab, var(--canvas) 88%, var(--highlight) 12%)",
  accent: "color-mix(in oklab, var(--canvas) 86%, var(--accent) 14%)",
};

const TONE_BORDER: Record<string, string> = {
  muted: "color-mix(in oklab, var(--muted) 30%, transparent)",
  highlight: "color-mix(in oklab, var(--highlight) 40%, transparent)",
  accent: "color-mix(in oklab, var(--accent) 45%, transparent)",
};

export function Stack() {
  return (
    <section id="stack" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 03 — Architecture
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.015em]">
            One ISO. Two install profiles. Six layers,{" "}
            <span className="text-[color:var(--muted)]">all the way down to the kernel.</span>
          </h2>
        </Reveal>

        <div className="mt-14 max-w-[60rem] mx-auto">
          {LAYERS.map((layer, i) => (
            <Reveal key={layer.n} delay={i * 0.045} amount={0.25}>
              <div
                className="grid grid-cols-[64px_1fr] sm:grid-cols-[88px_1fr] gap-4 sm:gap-6 border rounded-xl p-5 sm:p-6 mb-2.5"
                style={{
                  background: TONE_BG[layer.tone],
                  borderColor: TONE_BORDER[layer.tone],
                }}
              >
                <div>
                  <div className="font-mono text-[12px] text-[color:var(--muted)] tracking-tight">
                    {layer.n}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]/80">
                    Layer
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] sm:text-[16px] tracking-tight text-[color:var(--fg)]">
                    {layer.name}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {layer.items.map((it) => (
                      <li
                        key={it}
                        className="font-mono text-[12.5px] leading-snug text-[color:var(--fg)]/75 break-words"
                      >
                        ↳ {it}
                      </li>
                    ))}
                  </ul>
                  {layer.sub && (
                    <p className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight break-words">
                      {layer.sub}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
