"use client";

import { Reveal } from "./reveal";

const PERSONAS = [
  {
    name: "Maya",
    role: "Solo AI Researcher",
    profile: "Workstation",
    hw: "RTX 4090 · 64 GB",
    line: "My workstation can run a 31-agent swarm and I can prove what each one did.",
  },
  {
    name: "David",
    role: "Platform Eng, agentic startup",
    profile: "Server",
    hw: "4× H100 · 256-core EPYC",
    line: "Multi-tenant agent fairness without me writing the scheduler.",
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
    line: "I ship one ISO and my customer-tier isolation is the OS's problem, not mine.",
  },
];

export function Personas() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 07 — Who Coconut OS is for
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.12] tracking-[-0.015em]">
            Five personas drive product decisions.{" "}
            <span className="text-[color:var(--muted)]">
              The agent-builder, in five shapes.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05} amount={0.2}>
              <article className="h-full p-6 rounded-xl border hairline bg-[color:var(--canvas)] flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[18px] tracking-tight text-[color:var(--fg)]">
                    {p.name}
                  </h3>
                  <span className="chip !text-[10px]">{p.profile}</span>
                </div>
                <div className="mt-1 font-mono text-[12px] text-[color:var(--muted)]">
                  {p.role}
                </div>
                <blockquote className="mt-5 text-[14.5px] leading-[1.55] text-[color:var(--fg)]">
                  <span className="text-[color:var(--accent)] font-mono mr-1" aria-hidden>&ldquo;</span>
                  {p.line}
                  <span className="text-[color:var(--accent)] font-mono ml-1" aria-hidden>&rdquo;</span>
                </blockquote>
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
