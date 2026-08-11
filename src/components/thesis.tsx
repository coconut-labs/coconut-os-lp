"use client";

import { Reveal } from "./reveal";

export function Thesis() {
  return (
    <section id="thesis" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 01 · The thesis
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-3 text-[clamp(1.85rem,3.6vw,2.85rem)] leading-[1.12] tracking-[-0.015em] text-[color:var(--fg)] max-w-[44rem]">
            Today's operating systems were designed in 1991 for a world where the
            unit of compute was a Unix process.{" "}
            <span className="text-[color:var(--muted)]">
              The agent era needs the substrate rebuilt.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <Reveal delay={0.05}>
            <Pane
              tag="Today"
              tone="muted"
              title="Agents pretend to be processes."
              body="An LLM-driven agent runs as a Python process under the developer's UID. It has full filesystem access, full network egress, the union of every package's capabilities. The OS gives every process a god view and asks userspace to clip it down."
            />
          </Reveal>
          <Reveal delay={0.12}>
            <Pane
              tag="Tomorrow"
              tone="accent"
              title="Agents are kernel objects."
              body="Every agent has an AID, a declared capability bundle bound at spawn, an attestation chain rooted in a signed manifest, a fair-share lane in the scheduler, and a tamper-evident row in the audit chain. Capability presentation is in the syscall hot path."
            />
          </Reveal>
          <Reveal delay={0.19}>
            <Pane
              tag="Path"
              tone="highlight"
              title="Hard fork of Linux 6.12 LTS."
              body="Capability-centric replacement of mm/, fs/, cred.c, sched/, cgroup/. New kernel/agent/, kernel/audit/coconut/, security/coconut/. Eight new syscalls. Two engineers today: the plan is sized for a team, the spec is sized for review."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Pane({
  tag,
  tone,
  title,
  body,
}: {
  tag: string;
  tone: "muted" | "accent" | "highlight";
  title: string;
  body: string;
}) {
  const tagColor =
    tone === "accent"
      ? "text-[color:var(--accent)]"
      : tone === "highlight"
        ? "text-[color:var(--highlight)]"
        : "text-[color:var(--muted)]";
  return (
    <div className="relative pl-5 border-l hairline">
      <div className={`font-mono text-[11px] uppercase tracking-[0.08em] ${tagColor}`}>
        {tag}
      </div>
      <h3 className="mt-3 text-[18px] sm:text-[19px] leading-tight tracking-tight text-[color:var(--fg)]">
        {title}
      </h3>
      <p className="mt-3 text-[14.5px] leading-[1.6] text-[color:var(--fg)]/80">
        {body}
      </p>
    </div>
  );
}
