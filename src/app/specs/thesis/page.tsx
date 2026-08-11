import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "The thesis · Coconut OS",
  description:
    "Why an operating system designed in 1991 needs to be rebuilt around the agent. Capability-bound, attested, audit-everything.",
};

export default function ThesisPage() {
  return (
    <SpecShell
      slug="thesis"
      number="01"
      tag="why"
      title={<>The unit of compute is no longer the <span className="text-[color:var(--accent)]">Unix process.</span></>}
      blurb={<>Multi-agent AI systems are being built in 2026 on operating systems designed in 1991 for a world where the unit of compute was the Unix process and the unit of trust was the human user. The mismatch produces five concrete pain points, observable today in any production agent deployment.</>}
    >
      <Section eyebrow="§ 01.1 · the vision" title={<>The five-year vision: Coconut OS as the default substrate for safe, multi-agent AI compute.</>}>
        <Reveal>
          <p className="max-w-[44rem] text-[15.5px] leading-[1.65] text-[color:var(--fg)]/85">
            Multi-agent systems, whether the 31-agent Dream Team running on a researcher's workstation, the 10,000-agent customer-support fleet at a SaaS company, or the 100-agent autonomous-finance backend at a bank, run on operating systems where every agent is a kernel-known entity with a known capability set, a known attestation chain, and a known fairness lane.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-5 max-w-[44rem] text-[15.5px] leading-[1.65] text-[color:var(--fg)]/85">
            The phrase <em className="font-mono not-italic text-[color:var(--accent)]">"I'll just run that agent in a Python process"</em> sounds, five years out, the way <em className="font-mono not-italic text-[color:var(--muted)]">"I'll just run that web service as root"</em> sounds in 2026.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="§ 01.2 · the mission" title={<>Ship Coconut OS 1.0.</>}>
        <Reveal>
          <p className="max-w-[44rem] text-[15.5px] leading-[1.65] text-[color:var(--fg)]/85">
            A Linux distribution that a competent developer can install on supported hardware in under an hour, run a 31-agent Dream Team workload on within the same session, and successfully demonstrate (a) capability-mediated isolation, (b) tamper-evident audit log, and (c) fair-share inference under 4-tenant contention, without writing a single line of integration code.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[44rem]">
            <KPI k="boot → first agent" v="≤ 4 min" sub="single-number proxy" />
            <KPI k="cap-violation audit" v="100%" sub="off-by-N is a P0 blocker" />
            <KPI k="cross-tenant tail" v="p99/p50 ≤ 1.5×" sub="under 4-tenant flooder" />
          </div>
        </Reveal>
      </Section>

      <Section eyebrow="§ 01.3 · the lineage" title={<>This is the layer above kvwarden + mlxd.</>}>
        <Reveal>
          <p className="max-w-[44rem] text-[15.5px] leading-[1.65] text-[color:var(--fg)]/85">
            Coconut Labs' broader thesis: agents are the new compute primitive, distinct from processes, containers, or VMs, and every layer of the stack will need to be rebuilt around them. The lab does the work, layer by layer.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[60rem]">
            <Lineage layer="L2 · CUDA" name="kvwarden" shipped="ships" body="Tenant-fair inference broker on x86/CUDA. v0.1.6 on PyPI. Token-bucket admission cut starver tail 29× vs FIFO, measured on one A100 with vLLM 0.19.1, n=311." />
            <Lineage layer="L2 · MLX"  name="mlxd"     shipped="research" body="The same fairness thesis on Apple Silicon. In research; measured results publish when the repo does." />
            <Lineage layer="L0 + L1"   name="Coconut OS" shipped="building" body="The OS substrate that turns L2 brokers from products into floor. v1.0 when the spec survives review." here />
          </div>
        </Reveal>
        <LockedNote>
          The competitive moat from this stack-spanning posture is real: most agent-startup companies operate at exactly one layer. The full BRD treatment of moat + monetization publishes alongside the v0.1 spec drop.
        </LockedNote>
      </Section>

      <Section eyebrow="§ 01.4 · what 'agent-as-primitive' actually means" title={<>An agent is a kernel-recognized execution context.</>}>
        <Reveal>
          <ul className="mt-2 space-y-3.5 max-w-[44rem]">
            {[
              ["a unique agent id (AID)", "independent of any PID"],
              ["a declared capability set", "subset of system capabilities, bound at spawn, revocable any time"],
              ["an attestation chain", "linking running code to signed manifest and authorizer"],
              ["a fair-share lane", "in both the CPU scheduler and the inference broker"],
              ["a tier-addressable memory budget", "spanning HBM (GPU), RAM, and SSD-as-extended-memory"],
              ["an audit footprint", "every syscall, capability use, resource access, all cryptographically chained hashes"],
            ].map(([t, d]) => (
              <li key={t} className="grid grid-cols-[18px_1fr] gap-3 items-baseline">
                <span className="mt-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                <p className="text-[15px] leading-[1.55]">
                  <span className="text-[color:var(--fg)]">{t}</span>{" "}
                  <span className="text-[color:var(--muted)]">· {d}</span>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
    </SpecShell>
  );
}

function KPI({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="p-4 rounded-[2px] border hairline">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">{k}</div>
      <div className="mt-1.5 font-mono text-[20px] text-[color:var(--accent)] tracking-tight tabular-nums">{v}</div>
      <div className="mt-1 font-mono text-[11px] text-[color:var(--muted)]">{sub}</div>
    </div>
  );
}

function Lineage({ layer, name, shipped, body, here = false }: { layer: string; name: string; shipped: "ships" | "research" | "building"; body: string; here?: boolean }) {
  return (
    <div className="h-full p-5 rounded-[2px] border" style={{
      background: here ? "color-mix(in oklab, var(--canvas) 84%, var(--accent) 16%)" : "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
      borderColor: here ? "color-mix(in oklab, var(--accent) 45%, transparent)" : "color-mix(in oklab, var(--fg) 12%, transparent)",
    }}>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">{layer}</div>
      <div className="mt-1.5 font-mono text-[15px] text-[color:var(--accent)] tracking-tight">{name}</div>
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.08em]" style={{ color: shipped === "ships" ? "var(--success)" : shipped === "research" ? "var(--muted)" : "var(--highlight)" }}>{shipped === "ships" ? "shipped" : shipped === "research" ? "in research" : "building · you are here"}</div>
      <p className="mt-3 text-[13px] leading-[1.55] text-[color:var(--fg)]/80">{body}</p>
    </div>
  );
}
