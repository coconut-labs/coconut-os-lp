"use client";

import { Reveal } from "./reveal";

const PERSONAS = [
  {
    name: "Maya",
    role: "Solo AI Researcher",
    profile: "Workstation",
    hw: "RTX 4090 · 64 GB",
    line: "Runs a 31-agent swarm on one workstation, with proof of what each agent did.",
  },
  {
    name: "David",
    role: "Platform Eng, agentic startup",
    profile: "Server",
    hw: "4× H100 · 256-core EPYC",
    line: "Multi-tenant agent fairness without hand-writing the scheduler.",
  },
  {
    name: "Priya",
    role: "CISO, regulated enterprise pilot",
    profile: "Server",
    hw: "On-prem 8× A100 cluster",
    line: "Every agent action is signed, audit-loggable, and capability-bounded.",
  },
  {
    name: "Sam",
    role: "Academic CS department",
    profile: "Server",
    hw: "Aging multi-GPU cluster",
    line: "Fair-share GPU between PhD students without manual quota wars.",
  },
  {
    name: "Ren",
    role: "Indie agent-SaaS hacker",
    profile: "Server",
    hw: "Rented H100 (hourly)",
    line: "Ships one ISO, with customer-tier isolation enforced by the OS rather than by application code.",
  },
];

export function Personas() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            Who Coconut OS is for
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            Five deployments the kernel has to answer to.{" "}
            <span className="text-[color:var(--muted)]">
              These are requirement sketches, not customers. Each one wants a different
              thing from the same kernel.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05} amount={0.2}>
              <article className="h-full p-6 rounded-[2px] border hairline bg-[color:var(--canvas)] flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[18px] tracking-tight text-[color:var(--fg)]">
                    {p.name}
                  </h3>
                  <span className="chip !text-[10px]">{p.profile}</span>
                </div>
                <div className="mt-1 font-mono text-[12px] text-[color:var(--muted)]">
                  {p.role}
                </div>
                <p className="mt-5 text-[14.5px] leading-[1.55] text-[color:var(--fg)]">
                  {p.line}
                </p>
                <div className="mt-auto pt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
                  hardware · {p.hw}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
