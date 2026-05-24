import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { LayerStack } from "@/components/diagrams/layer-stack";
import { AgentStateMachine } from "@/components/diagrams/agent-state";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "The architecture — Coconut OS",
  description:
    "One ISO, two install profiles, six layers. The shape of the substrate, the eight new syscalls, the agent state machine.",
};

const SYSCALLS = [
  { n: "agent_spawn",       s: "(manifest, cap_set) → aid" },
  { n: "agent_attest",      s: "(aid) → attestation_chain" },
  { n: "agent_quota",       s: "(aid, kind, budget) → 0 | -E…" },
  { n: "agent_cap_grant",   s: "(aid, cap) → 0 | -E…" },
  { n: "agent_cap_revoke",  s: "(aid, cap) → 0 | -E…" },
  { n: "agent_cap_present", s: "(aid, cap) → 0 | -E…" },
  { n: "agent_audit_query", s: "(filter) → audit_chain_segment" },
  { n: "agent_memory_tier", s: "(aid, tier, request) → addr | -E…" },
];

export default function ArchitecturePage() {
  return (
    <SpecShell
      slug="architecture"
      number="02"
      tag="what"
      title={<>One ISO. Two install profiles. <span className="text-[color:var(--accent)]">Six layers.</span></>}
      blurb={<>The kernel is a hard fork of Linux 6.12 LTS. Five existing subsystems get capability-aware modifications; three new subsystems get added. The userspace replaces systemd with coconutd. The shell is a Wayland compositor in Rust.</>}
    >
      <Section eyebrow="§ 02.1 — the stack" title={<>Hover any layer. The kernel layer is where the work is.</>}>
        <Reveal>
          <LayerStack />
        </Reveal>
      </Section>

      <Section eyebrow="§ 02.2 — the agent syscall surface" title={<>Eight new syscalls — the full agent API.</>}>
        <Reveal>
          <div className="rounded-2xl border hairline overflow-hidden">
            <div className="grid grid-cols-1 divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)" }}>
              {SYSCALLS.map((s) => (
                <div key={s.n} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 sm:gap-8 px-5 sm:px-7 py-4 hover:bg-[color:var(--surface)] transition-colors duration-200">
                  <div className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">{s.n}</div>
                  <div className="font-mono text-[12.5px] text-[color:var(--muted)] break-words">{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 font-mono text-[11.5px] text-[color:var(--muted)] tracking-tight">
            full signatures · error code matrices · ABI commitments land with the LLD drop · syscall range is reserved through LKML at Sprint 1
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="§ 02.3 — the agent state machine" title={<>Eight first-class kernel states. Process abstraction can't carry these.</>}>
        <Reveal>
          <AgentStateMachine />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-6 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            A process abstraction cannot express <span className="font-mono text-[color:var(--accent)]">"the agent is alive but its capability set just got revoked"</span>. Coconut OS makes these states first-class kernel state, visible via <span className="font-mono text-[color:var(--accent)]">agent_audit_query</span> and renderable in Coconut Center.
          </p>
        </Reveal>
        <LockedNote>
          Transition guards, allowed predecessors per state, and the exact AID-to-PID mapping rule are pinned in the LLD. Public preview shows the state set; full edge semantics drop with the LLD.
        </LockedNote>
      </Section>
    </SpecShell>
  );
}
