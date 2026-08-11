"use client";

import { Reveal } from "./reveal";

const PAIN = [
  {
    n: "01",
    title: "Capability sprawl",
    today: "Agent runs as the user's UID. Intended caps: read three files. Actual caps: everything the user can do.",
    answer:
      "Capability-mediated access at the syscall layer. An agent without cap.fs.read on a path literally cannot read it: the syscall returns -ECAPABILITY before reaching the VFS.",
  },
  {
    n: "02",
    title: "No first-class audit chain",
    today: "auditd is process-oriented. Correlating an event back to which agent did what with which capability is a userspace cross-join with no integrity guarantees.",
    answer:
      "kernel/audit/coconut/ appends every agent-relevant event to a tamper-evident hash chain rooted in TPM-NV. Off-by-N between LSM-denies and audit-events is a release blocker.",
  },
  {
    n: "03",
    title: "Fairness violations across tenants",
    today: "One customer's runaway loop floods the inference broker. Other 199 tenants see p99 latency spike 30×. Platform team writes userspace rate limiters; they leak.",
    answer:
      "Fair-share scheduling extended down into the kernel. CPU time, memory bandwidth, PCIe, inference tokens, all keyed on AID, not PID. p99/p50 ≤ 1.5× under 4-tenant flooder load.",
  },
  {
    n: "04",
    title: "Capability vs DAC mismatch",
    today: "Linux carries UID/GID/mode bits and capabilities and SELinux all stacked. Agents don't cluster into UIDs; every agent is its own principal.",
    answer:
      "Capability bundle becomes the primary access-control object. DAC reduced to a legacy compat layer for unmodified binaries. The new LSM is the enforcement point.",
  },
  {
    n: "05",
    title: "No first-class agent lifecycle",
    today: "systemd manages services. cgroups manage isolation. Kubernetes manages pods. None know what an agent is, because none speak the language of agent states.",
    answer:
      "Spawning · Attested · Active · Inference-blocked · Capability-denied · Quarantined · Terminated-clean · Terminated-revoked. First-class kernel state, query via agent_audit_query.",
  },
];

export function PainPoints() {
  return (
    <section id="pain" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 02 · Five things today's stack can't fix incrementally
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[40rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.015em]">
            You can't ptrace your way to an agent OS.{" "}
            <span className="text-[color:var(--muted)]">
              These are kernel-side concerns by construction.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] border hairline rounded-2xl overflow-hidden">
          {PAIN.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.04} amount={0.2}>
              <div className="h-full p-7 sm:p-8 bg-[color:var(--canvas)]">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[11px] text-[color:var(--accent)] tracking-[0.08em]">
                    {p.n}
                  </span>
                  <h3 className="text-[18px] sm:text-[19px] tracking-tight leading-tight">
                    {p.title}
                  </h3>
                </div>
                <p className="mt-5 font-mono text-[12.5px] leading-[1.6] text-[color:var(--muted)]">
                  <span className="text-[color:var(--accent)]">today ›</span>{" "}
                  {p.today}
                </p>
                <p className="mt-4 text-[14.5px] leading-[1.6] text-[color:var(--fg)]/90">
                  <span className="font-mono text-[12.5px] text-[color:var(--highlight)]">
                    coconut ›{" "}
                  </span>
                  {p.answer}
                </p>
              </div>
            </Reveal>
          ))}
          {/* trailing cell — keeps grid tidy when odd count */}
          <Reveal delay={PAIN.length * 0.04} amount={0.2}>
            <div className="h-full p-7 sm:p-8 bg-[color:var(--canvas)] flex flex-col justify-between">
              <p className="font-mono text-[12.5px] leading-[1.6] text-[color:var(--muted)]">
                The natural pushback is "write a userspace daemon plus an LSM plus a cgroup hierarchy and call it done."
              </p>
              <p className="mt-6 text-[15px] leading-[1.55] text-[color:var(--fg)]">
                The answer is no, for three reasons that compound: capability presentation must be in the syscall hot path, audit-chain integrity requires kernel-side append, and fair-share scheduling requires scheduler-side AID awareness.
              </p>
              <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-[0.04em]">
                01-PRD §3.7
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
