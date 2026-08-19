import type { Metadata } from "next";
import { SpecShell, Section, LockedNote } from "@/components/spec-shell";
import { Timeline } from "@/components/diagrams/timeline";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Roadmap · Coconut OS",
  description:
    "The sequence. Versions are ordered, not dated. Hard ABI line between v1.x and v2.0.",
};

const RELEASES = [
  {
    ver: "v1.0", when: "first", tone: "accent",
    line: "x86_64 + NVIDIA · Workstation + Server",
    bullets: [
      "Linux 6.12 hard fork · capability-mediated LSM",
      "8 new syscalls · libcoconut userspace bindings",
      "coconutd PID 1 · coconutpkg · coconut-installer",
      "Coconut Shell (Wayland · Rust · Smithay)",
      "kvwarden + mlxd default brokers",
    ],
  },
  {
    ver: "v1.1", when: "after v1.0", tone: "highlight",
    line: "ARM64 server-class",
    bullets: [
      "Ampere first-class · NVIDIA Grace optional",
      "GUI installer for Server profile",
      "Live kernel patching (non-critical patches)",
      "HSM-rooted attestation",
      "Multi-seat · multi-admin RBAC",
    ],
  },
  {
    ver: "v1.2", when: "after v1.1", tone: "highlight",
    line: "Apple Silicon · via Asahi bootstrap",
    bullets: [
      "Apple Silicon NPU first-class",
      "TouchID PAM module",
      "Cross-arch checkpoint migration",
    ],
  },
  {
    ver: "v2.0", when: "after the v1.x line", tone: "muted",
    line: "Full kernel substrate · ABI break",
    bullets: [
      "Full mm/agent_mm.c page-allocator rewrite",
      "Full struct cred replacement (DAC-free credential graph)",
      "Federated tenant model (cross-cluster coconutd)",
    ],
  },
  {
    ver: "v3.0", when: "the horizon", tone: "muted",
    line: "Formal-verification expansion · the 5-year vision",
    bullets: [
      "Verification scope extends beyond the LSM hook",
      "Default substrate for safe multi-agent AI compute",
    ],
  },
];

const TONE_BG: Record<string, string> = {
  muted: "color-mix(in oklab, var(--canvas) 92%, var(--muted) 8%)",
  highlight: "color-mix(in oklab, var(--canvas) 88%, var(--highlight) 12%)",
  accent: "color-mix(in oklab, var(--canvas) 84%, var(--accent) 16%)",
};
const TONE_BORDER: Record<string, string> = {
  muted: "color-mix(in oklab, var(--muted) 25%, transparent)",
  highlight: "color-mix(in oklab, var(--highlight) 42%, transparent)",
  accent: "color-mix(in oklab, var(--accent) 50%, transparent)",
};
const TONE_TX: Record<string, string> = {
  muted: "var(--muted)",
  highlight: "var(--highlight)",
  accent: "var(--accent)",
};

export default function RoadmapPage() {
  return (
    <SpecShell
      slug="roadmap"
      tag="when"
      title={<>The sequence. Versions are <span className="text-[color:var(--accent)]">ordered, not dated.</span></>}
      blurb={<>v1.0 when the spec survives review. Order is locked; per-release feature gating moves sprint by sprint. The hard ABI line is between v1.x and v2.0: every v1.x release carries the same syscall + libcoconut ABI. Dates return when the first milestone is behind us, not before.</>}
    >
      <Section eyebrow="the sequence" title={<>Five releases, in order.</>}>
        <Reveal>
          <Timeline />
        </Reveal>
      </Section>

      <Section eyebrow="release by release">
        <div className="space-y-3">
          {RELEASES.map((r, i) => (
            <Reveal key={r.ver} delay={i * 0.05}>
              <article
                className="grid grid-cols-[88px_1fr] sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 p-5 sm:p-7 rounded-[2px] border"
                style={{ background: TONE_BG[r.tone], borderColor: TONE_BORDER[r.tone] }}
              >
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: TONE_TX[r.tone] }}>
                    {r.when}
                  </div>
                  <div className="mt-1.5 font-mono text-[22px] sm:text-[24px] tracking-tight">
                    {r.ver}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[15.5px] tracking-tight text-[color:var(--fg)]">{r.line}</div>
                  <ul className="mt-3 space-y-1.5">
                    {r.bullets.map((b) => (
                      <li key={b} className="font-mono text-[12.5px] leading-snug text-[color:var(--fg)]/80 break-words">
                        · {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <LockedNote>
          Sprint-level deliverables, the parallel-projects sequencing with kvwarden + mlxd, and the gating decisions for v1.1/v1.2/v2.0 are pinned in the PLAN + SPRINTS docs. Public preview shows the order; specifics travel with the spec drop and sprint reviews.
        </LockedNote>
      </Section>
    </SpecShell>
  );
}
