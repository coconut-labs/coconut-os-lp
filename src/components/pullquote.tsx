"use client";

import { Reveal } from "./reveal";

export function PullQuote() {
  return (
    <section className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <div className="max-w-[60rem]">
          <Reveal>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
              § 04·5 · Pinned from the PRD
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <blockquote className="mt-8 relative">
              <span
                aria-hidden
                className="absolute -left-2 -top-6 font-mono text-[120px] leading-none text-[color:var(--accent)] opacity-50 select-none"
                style={{ letterSpacing: "-0.05em" }}
              >
                "
              </span>
              <p className="relative font-mono text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.4] tracking-[-0.012em] text-[color:var(--fg)]">
                An agent in Coconut OS is a kernel-recognized execution context
                with a unique <span className="text-[color:var(--accent)]">AID</span>,
                a declared <span className="text-[color:var(--accent)]">capability set</span>{" "}
                bound at spawn, an <span className="text-[color:var(--accent)]">attestation chain</span>{" "}
                linking the running code to a signed manifest, a{" "}
                <span className="text-[color:var(--accent)]">fair-share lane</span> in
                the scheduler and the inference broker, a{" "}
                <span className="text-[color:var(--accent)]">tier-addressable memory budget</span>{" "}
                spanning HBM, RAM and SSD, and an{" "}
                <span className="text-[color:var(--accent)]">audit footprint</span>:
                every syscall, every capability use, every resource access recorded with
                cryptographically chained hashes.
              </p>
            </blockquote>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex items-center gap-3">
              <span className="h-px w-10 bg-[color-mix(in_oklab,var(--fg)_25%,transparent)]" />
              <span className="font-mono text-[12px] tracking-tight text-[color:var(--muted)]">
                01-PRD § 2.4 · what "agent-as-primitive" means at the OS level
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
