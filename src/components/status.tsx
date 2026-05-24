"use client";

import { Reveal } from "./reveal";

const SPEC_DOCS = [
  { id: "00", name: "INDEX",     desc: "Navigation + reading order across the doc suite", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/00-INDEX.md" },
  { id: "01", name: "PRD",       desc: "Product requirements · vision · personas · KPIs", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/01-PRD.md" },
  { id: "02", name: "BRD",       desc: "Business requirements · TAM · monetization · ROI", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/02-BRD.md" },
  { id: "03", name: "TFD",       desc: "Technical feasibility · risks · prior art · build-vs-buy", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/03-TFD.md" },
  { id: "04", name: "HLD",       desc: "High-level design · architecture · data flow · deployment", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/04-HLD.md" },
  { id: "05", name: "LLD",       desc: "Low-level design · kernel subsystem detail · syscall API", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/05-LLD.md" },
  { id: "06", name: "PLAN",      desc: "Execution plan · 12-18 month roadmap · risk register", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/06-PLAN.md" },
  { id: "07", name: "SPRINTS",   desc: "26 two-week sprints · goals · deliverables · owners", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/07-SPRINTS.md" },
  { id: "08", name: "TICKETS",   desc: "Engineering tickets · Epic → Story → Task tree", href: "https://github.com/coconut-labs/coconutos/blob/main/docs/08-TICKETS.md" },
];

export function Status() {
  return (
    <section id="spec" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 08 — Status
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.12] tracking-[-0.015em]">
            Pre-implementation.{" "}
            <span className="text-[color:var(--muted)]">
              Specs are public. The build starts when the spec set is locked.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[40rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Coconut OS does not exist yet. What exists is the full PM artifact suite — PRD, BRD, TFD, HLD, LLD, execution plan, sprint plans, engineering tickets — produced before a single line of OS code is written. The repo publishes alongside the spec lockdown.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] border hairline rounded-2xl overflow-hidden">
          {SPEC_DOCS.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.03} amount={0.2}>
              <a
                href={d.href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col h-full p-6 bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-[0.08em]">
                    {d.id}
                  </span>
                  <span className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">
                    {d.name}
                  </span>
                  <span className="ml-auto font-mono text-[12px] text-[color:var(--muted)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ transitionTimingFunction: "var(--ease-precise)" }}>
                    open →
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.5] text-[color:var(--fg)]/80">
                  {d.desc}
                </p>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-14 p-7 sm:p-9 rounded-2xl border" style={{ borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)", background: "color-mix(in oklab, var(--canvas) 80%, var(--accent) 6%)" }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--accent)]">
                  Coming
                </div>
                <h3 className="mt-2 text-[20px] sm:text-[22px] tracking-tight text-[color:var(--fg)]">
                  Watch the build, sprint by sprint.
                </h3>
                <p className="mt-3 max-w-[34rem] text-[14.5px] leading-[1.6] text-[color:var(--fg)]/85">
                  Open-progress reports land every two weeks. ISOs land when they're real. No early signups, no waitlists, no exclusivity.
                </p>
              </div>
              <a
                href="https://github.com/coconut-labs/coconut-os-lp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[color:var(--fg)] text-[color:var(--canvas)] font-mono text-[13px] tracking-tight hover:opacity-90 transition-opacity duration-300"
              >
                Watch the LP repo →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
