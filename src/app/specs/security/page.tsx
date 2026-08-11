import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { CapabilityFlow } from "@/components/diagrams/capability-flow";
import { AuditChain } from "@/components/diagrams/audit-chain";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Capabilities · audit chain · attestation · Coconut OS",
  description:
    "The load-bearing security model: capability presentation at the syscall hot path, BLAKE3-chained audit log rooted in TPM-NV, Ed25519-signed manifest attestation.",
};

const ADVERSARIES = [
  { k: "A1", name: "Hostile agent",         body: "LLM-driven agent that has been fed a hostile document or has a buggy manifest.", limit: "Cannot read/write outside cap.fs.*, connect outside cap.net.*, exceed quota, or delegate caps the parent doesn't have." },
  { k: "A2", name: "Compromised supply chain", body: "Adversary who acquires a signing key and pushes a malicious package.",       limit: "Cannot ship code running with caps NOT declared in the package metadata; cannot evade signature verification at install + update." },
  { k: "A3", name: "Local non-agent process", body: "Legacy Linux app via XWayland or DAC compat layer attempting to read agent state.", limit: "Cannot read another agent's audit segment without cap.audit.read; cannot modify past audit events; cannot spawn agents outside agent_spawn." },
  { k: "A4", name: "Network attacker",      body: "Adversary on the wire between user and box, or between cluster nodes.",        limit: "Cannot decrypt TLS-protected :8443, forge GPG-signed packages, or replay attestation across reboots (TPM-rooted)." },
  { k: "A5", name: "Insider with admin caps", body: "Operator with cap.admin.* who turns hostile.",                                limit: "Cannot tamper with past audit events; cannot sign packages as Coconut Labs / operator-root; cannot remove their own audit footprint." },
];

export default function SecurityPage() {
  return (
    <SpecShell
      slug="security"
      number="03"
      tag="how · the load-bearing line"
      title={<>The capability bundle is the <span className="text-[color:var(--accent)]">primary access-control object.</span></>}
      blurb={<>Linux today layers DAC, capabilities, SELinux, AppArmor. For agent workloads it's the wrong primitive set. Coconut OS makes capability primary and reduces DAC to a legacy compat layer for unmodified binaries.</>}
    >
      <Section eyebrow="§ 03.1 · capability presentation" title={<>Denied at the syscall, before VFS.</>}>
        <Reveal>
          <CapabilityFlow />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            An agent that was not granted <span className="font-mono text-[color:var(--accent)]">cap.fs.read("/home/maya/.ssh")</span> literally cannot read that path: the syscall returns <span className="font-mono text-[color:var(--accent)]">-ECAPABILITY</span> before reaching the VFS layer. The mechanism is closer to seL4 and Capsicum than to Linux's hybrid capability-over-DAC overlay.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="§ 03.2 · the audit chain" title={<>Tamper-evident, BLAKE3-chained, rooted in TPM-NV.</>}>
        <Reveal>
          <AuditChain />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Every agent-relevant event (spawn, capability grant, capability use, capability denial, resource consumption above threshold, exit) appends to a tamper-evident hash chain. On supported hardware the chain is rooted in a TPM-NV-sealed key; on non-TPM hardware a documented software root with stated attack model.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-3 max-w-[44rem] font-mono text-[12px] text-[color:var(--muted)] leading-[1.6]">
            off-by-N between LSM-deny counters and audit-event counters is a P0 release-blocker · NFR-024
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="§ 03.3 · adversary model" title={<>Five in-scope classes at v1.0.</>}>
        <Reveal>
          <div className="rounded-2xl border hairline overflow-hidden">
            <div className="divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 10%, transparent)" }}>
              {ADVERSARIES.map((a) => (
                <article key={a.k} className="grid grid-cols-[44px_1fr] gap-4 px-5 sm:px-7 py-5 hover:bg-[color:var(--surface)] transition-colors duration-200">
                  <div className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">{a.k}</div>
                  <div className="min-w-0">
                    <div className="text-[15px] tracking-tight text-[color:var(--fg)]">{a.name}</div>
                    <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{a.body}</p>
                    <p className="mt-2 font-mono text-[12px] leading-[1.55] text-[color:var(--muted)]">
                      <span className="text-[color:var(--success)]">cannot ›</span> {a.limit}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
        <LockedNote>
          Out-of-scope classes (physical attack, kernel zero-days, TPM firmware compromise, quantum break of BLAKE3/Ed25519) are listed with mitigation pointers in the full threat model. CVE SLA, the key-revocation procedure, and external-audit engagement details land with the security drop.
        </LockedNote>
      </Section>
    </SpecShell>
  );
}
