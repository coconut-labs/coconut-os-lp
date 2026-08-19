import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { LayerStack } from "@/components/diagrams/layer-stack";
import { KernelMap } from "@/components/diagrams/kernel-map";
import { SyscallHotPath } from "@/components/diagrams/syscall-hotpath";
import { AgentFS } from "@/components/diagrams/agentfs";
import { AgentStateMachine } from "@/components/diagrams/agent-state";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "The architecture · Coconut OS",
  description:
    "One ISO, two install profiles, six layers. Where the eight new syscalls sit and what the agent state machine looks like.",
};

const SYSCALLS = [
  { n: "agent_spawn",       nr: 472, wired: true,  s: "(struct agent_spawn_args *) → aid" },
  { n: "agent_attest",      nr: 473, wired: true,  s: "(aid, struct attestation *) → 0 | -E…" },
  { n: "agent_quota",       nr: 474, wired: true,  s: "(aid, struct quota_set *) → 0 | -E…" },
  { n: "agent_cap_grant",   nr: 475, wired: true,  s: "(target_aid, struct cap_token *) → 0 | -E…" },
  { n: "agent_cap_revoke",  nr: 476, wired: true,  s: "(struct cap_revoke_args *) → 0 | -E…" },
  { n: "agent_cap_present", nr: 477, wired: true,  s: "(cap_id, struct cap_proof *) → 0 | -E…" },
  { n: "agent_audit_query", nr: 478, wired: false, s: "(query, out, out_len) → -ENOSYS" },
  { n: "agent_memory_tier", nr: 479, wired: false, s: "(aid, tier) → -ENOSYS" },
];

export default function ArchitecturePage() {
  return (
    <SpecShell
      slug="architecture"
      tag="what"
      title={<>One ISO with two install profiles, over <span className="text-[color:var(--accent)]">six layers.</span></>}
      blurb={<>The kernel is a hard fork of Linux 6.12 LTS. Five existing subsystems get capability-aware modifications; three new subsystems get added. The userspace replaces systemd with coconutd. The shell is a Wayland compositor in Rust.</>}
    >
      <Section eyebrow="the stack" title={<>Hover any layer. The kernel layer is where the work is.</>}>
        <Reveal>
          <LayerStack />
        </Reveal>
      </Section>

      <Section eyebrow="inside the kernel fork" title={<>Five subsystems modified · three new · one userspace bridge.</>}>
        <Reveal>
          <KernelMap />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            The fork is intentionally narrow. Existing subsystems get capability-aware hooks; the new subsystems carry the agent surface. Everything above the kernel (coconutd, the shell, the brokers) talks to a stable syscall ABI from v1.0.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="the agent syscall surface" title={<>Eight new syscalls: six implemented and wired on x86_64, two still stubs.</>}>
        <Reveal>
          <div className="rounded-[2px] border hairline overflow-hidden">
            <div className="grid grid-cols-1 divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)" }}>
              {SYSCALLS.map((s) => (
                <div key={s.n} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 sm:gap-8 px-5 sm:px-7 py-4 hover:bg-[color:var(--surface)] transition-colors duration-200">
                  <div className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">{s.n} <span className="text-[color:var(--muted)] text-[11px]">#{s.nr}</span></div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-mono text-[12.5px] text-[color:var(--muted)] break-words">{s.s}</span>
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
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 font-mono text-[11.5px] text-[color:var(--muted)] tracking-tight">
            wired · implemented and reachable from userspace on x86_64 · reserved · allocated number, returns -ENOSYS · the arm64 table is not wired yet · the 472-479 range is reserved, not locked · it locks at Gate 1, and the ABI commitment lands with it
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="the hot path · agent_spawn" title={<>From a libcoconut call to a scheduled AID: six stages, one syscall.</>}>
        <Reveal>
          <SyscallHotPath />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Capability presentation lives in the syscall hot path. The LSM hook runs <em>before</em> any privileged operation reaches the relevant subsystem. That is the property userspace daemons and eBPF can't give you.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="the agent state machine" title={<>Eight first-class kernel states. Process abstraction can't carry these.</>}>
        <Reveal>
          <AgentStateMachine />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-6 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            A process abstraction cannot express <span className="font-mono text-[color:var(--accent)]">"the agent is alive but its capability set just got revoked"</span>. Coconut OS makes these states first-class kernel state. The state machine is in the tree. Reading it back through <span className="font-mono text-[color:var(--accent)]">agent_audit_query</span> and rendering it in Coconut Center are both still ahead.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="/agent · the inspector tree" title={<>What /proc is to processes, /agent is to agents.</>}>
        <Reveal>
          <AgentFS />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Every agent gets a directory under <span className="font-mono text-[color:var(--accent)]">/agent/live/&lt;aid&gt;/</span> with status, the bound caps, attestation chain, a per-agent audit tail, the resource budget, and a child registry. Operators read with <span className="font-mono text-[color:var(--accent)]">cat</span>; auditors verify with <span className="font-mono text-[color:var(--accent)]">coconut audit verify</span>.
          </p>
        </Reveal>
        <LockedNote>
          This one is design, not code. Nothing under /agent exists in the tree yet. Transition guards, allowed predecessors per state, the AID-to-PID mapping rule, agentfs file formats, and the ioctl surface are pinned in the LLD. Public preview shows the shape; full mechanism lands with the LLD drop.
        </LockedNote>
      </Section>
    </SpecShell>
  );
}
