import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Team + cadence · Coconut OS",
  description:
    "Two engineers today. The plan is sized for a team; the spec is sized for review.",
};

const ROLES = [
  { role: "Tech lead · kernel",         owns: "Linux fork strategy · merge-window discipline · gatekeeper for kernel/agent + LSM hook" },
  { role: "Kernel · agent + cred",      owns: "kernel/agent/ subsystem · cred-shim · syscall plumbing" },
  { role: "Kernel · audit + scheduler", owns: "kernel/audit/coconut · per-AID scheduling extensions" },
  { role: "Userspace · coconutd",       owns: "PID 1 · agent supervisor · CBOR IPC on /run/coconutd" },
  { role: "Userspace · packaging",      owns: "coconutpkg · coconut-installer · libcoconut" },
  { role: "Platform + CI",              owns: "kernel-CI · reproducible ISO build · sigstore signing" },
  { role: "Compositor",                 owns: "Coconut Shell · Wayland + Smithay · agent-aware WM" },
  { role: "Userspace apps",             owns: "Coconut Center · Coconut Terminal · Display Manager" },
  { role: "Security",                   owns: "STRIDE/LINDDUN threat modeling · LSM review · CVE response" },
  { role: "Brand + design engineer",    owns: "Typography · palette · motion · iconography · marketing + docs sites" },
];

export default function TeamPage() {
  return (
    <SpecShell
      slug="team"
      tag="how · the build"
      title={<>Two engineers today. The plan is sized for a team; the spec is <span className="text-[color:var(--accent)]">sized for review.</span></>}
      blurb={<>The previous Coconut Labs projects were solo. Coconut OS is planned as the lab's first multi-engineer project. Today the lab is two people. The role topology below is the plan, not the payroll; names attach when they are real.</>}
    >
      <Section eyebrow="roles" title={<>The planned shape: ten roles. Two people today.</>}>
        <Reveal>
          <div className="rounded-[2px] border hairline overflow-hidden">
            <ul className="divide-y" style={{ borderColor: "color-mix(in oklab, var(--fg) 10%, transparent)" }}>
              {ROLES.map((r) => (
                <li key={r.role} className="px-5 sm:px-7 py-4 hover:bg-[color:var(--surface)] transition-colors duration-200">
                  <div className="text-[15px] tracking-tight text-[color:var(--fg)] leading-tight">{r.role}</div>
                  <div className="mt-1.5 font-mono text-[12px] text-[color:var(--muted)] leading-snug break-words">{r.owns}</div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 font-mono text-[11.5px] text-[color:var(--muted)] tracking-tight">
            the topology is the plan, not the payroll · bios publish when names attach
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="cadence" title={<>Sprints are two weeks. Sprint 0 is behind us.</>}>
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[60rem]">
            <Stat k="engineers today" v="2" sub="the whole lab" />
            <Stat k="planned roles" v="10" sub="the shape the plan is sized for" />
            <Stat k="parallel projects" v="3" sub="kvwarden · mlxd · Coconut OS" />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-7 max-w-[44rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Three projects run at once: kvwarden (v0.1.6 on PyPI), mlxd (in research), and Coconut OS. Running three in parallel from a two-person lab is stretched. If one of them slips, this is the reason.
          </p>
        </Reveal>
        <LockedNote>
          Specific sprint owners, per-story allocation, and the gating decisions live in the PLAN + SPRINTS docs. Public preview shows the role topology; assignments land with the spec drop. Finance, pricing and hiring economics were cut from the spec suite entirely, so they are not being held back here. They are not part of this project.
        </LockedNote>
      </Section>
    </SpecShell>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="p-4 rounded-[2px] border hairline">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">{k}</div>
      <div className="mt-1.5 font-mono text-[20px] text-[color:var(--accent)] tracking-tight tabular-nums">{v}</div>
      <div className="mt-1 font-mono text-[11px] text-[color:var(--muted)] leading-tight">{sub}</div>
    </div>
  );
}
