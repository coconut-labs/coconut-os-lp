"use client";

import { Reveal } from "./reveal";

const STEPS = [
  { t: "T+0:00",  body: "Maya boots Coconut OS for the first time. The installer asks five questions, picks Workstation profile, reboots into Coconut Shell." },
  { t: "T+0:08",  body: "From Coconut Terminal: coconut agent spawn dream-team. Thirty-one agent processes spawn, each with a capability set declared by the workload manifest." },
  { t: "T+0:08",  body: "All 31 agents share the GPU under kvwarden's fair-share policy, enforced by the kernel scheduler, not a userspace daemon." },
  { t: "T+0:09",  body: "Top bar of Coconut Shell shows a live counter of active agents and aggregate token spend. Each agent's class glyph pulses softly.", accent: true },
  { t: "T+0:11",  body: "One agent attempts to read /home/maya/.ssh/id_ed25519. The kernel denies: no cap.fs.read on ~/.ssh. Returns -ECAPABILITY before VFS." },
  { t: "T+0:11",  body: "Audit chain appends a tamper-evident row, BLAKE3-hashed against the prior chain head. Coconut Center surfaces a desktop notification with a one-click review link.", accent: true },
  { t: "T+0:15",  body: "Maya has reproduced the hero use-case end-to-end. 15 minutes from completing the installer to observing the capability-deny + audit-notification flow." },
];

export function HeroStory() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 05 · Fifteen minutes from first boot
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            Maya, the solo AI researcher.{" "}
            <span className="text-[color:var(--muted)]">
              A design fiction: a single workstation, a 31-agent swarm, the audit chain proving every action.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-[40rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            This scene is the target, not a demo. None of it runs end to end today.
          </p>
        </Reveal>

        <div className="mt-14 relative">
          {/* vertical spine */}
          <div className="absolute left-[7.5rem] sm:left-[10.5rem] top-2 bottom-2 w-px bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] hidden sm:block" />
          <ul className="space-y-7 sm:space-y-8">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.04} amount={0.3}>
                <li className="grid grid-cols-1 sm:grid-cols-[10.5rem_1fr] gap-3 sm:gap-8 items-start">
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 font-mono text-[12px] text-[color:var(--muted)] tabular-nums">
                      <span className="sm:hidden">·</span>
                      {s.t}
                    </div>
                    <span
                      className="hidden sm:block absolute right-0 top-[7px] -mr-[5.5px] w-[10px] h-[10px] rounded-full"
                      style={{
                        background: s.accent ? "var(--accent)" : "color-mix(in oklab, var(--fg) 28%, var(--canvas))",
                        boxShadow: s.accent ? "0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent)" : undefined,
                      }}
                    />
                  </div>
                  <p className={`text-[15px] leading-[1.6] ${s.accent ? "text-[color:var(--fg)]" : "text-[color:var(--fg)]/85"}`}>
                    {s.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
