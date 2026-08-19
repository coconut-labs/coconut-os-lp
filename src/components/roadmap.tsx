"use client";

import { Reveal } from "./reveal";

const RELEASES = [
  {
    ver: "v1.0",
    line: "x86_64 + NVIDIA · Workstation + Server",
    bullets: [
      "Linux 6.12 hard fork · capability-mediated LSM",
      "8 new syscalls · libcoconut userspace bindings",
      "coconutd PID 1 · coconutpkg · coconut-installer",
      "Coconut Shell (Wayland · Rust · Smithay)",
      "kvwarden + mlxd default brokers",
    ],
    tone: "accent",
  },
  {
    ver: "v1.1",
    line: "ARM64 server-class",
    bullets: [
      "Ampere first-class · NVIDIA Grace optional",
      "GUI installer for Server profile",
      "Live kernel patching (non-critical patches)",
      "HSM-rooted attestation",
      "Multi-seat · multi-admin RBAC",
    ],
    tone: "highlight",
  },
  {
    ver: "v1.2",
    line: "Apple Silicon · via Asahi bootstrap",
    bullets: [
      "Apple Silicon NPU first-class",
      "TouchID PAM module",
      "Cross-arch checkpoint migration",
    ],
    tone: "highlight",
  },
  {
    ver: "v2.0",
    line: "Full kernel substrate · ABI break",
    bullets: [
      "Full mm/agent_mm.c page-allocator rewrite",
      "Full struct cred replacement (DAC-free)",
      "Federated tenant model (cross-cluster coconutd)",
    ],
    tone: "muted",
  },
  {
    ver: "v3.0",
    line: "Formal-verification expansion · the 5-year vision",
    bullets: [
      "Verification scope extends beyond LSM hook",
      "Default substrate for safe multi-agent AI compute",
    ],
    tone: "muted",
  },
];

const TONE_BG: Record<string, string> = {
  muted: "color-mix(in oklab, var(--canvas) 92%, var(--muted) 8%)",
  highlight: "color-mix(in oklab, var(--canvas) 86%, var(--highlight) 14%)",
  accent: "color-mix(in oklab, var(--canvas) 84%, var(--accent) 16%)",
};
const TONE_BORDER: Record<string, string> = {
  muted: "color-mix(in oklab, var(--muted) 25%, transparent)",
  highlight: "color-mix(in oklab, var(--highlight) 45%, transparent)",
  accent: "color-mix(in oklab, var(--accent) 50%, transparent)",
};
const TONE_TEXT: Record<string, string> = {
  muted: "var(--muted)",
  highlight: "var(--highlight)",
  accent: "var(--accent)",
};

export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            Roadmap
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            The sequence.{" "}
            <span className="text-[color:var(--muted)]">
              Versions are ordered, not dated.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-3">
          {RELEASES.map((r, i) => (
            <Reveal key={r.ver} delay={i * 0.06} amount={0.25}>
              <div
                className="h-full p-5 rounded-[2px] border flex flex-col"
                style={{
                  background: TONE_BG[r.tone],
                  borderColor: TONE_BORDER[r.tone],
                }}
              >
                <div
                  className="font-mono text-[22px] tracking-tight"
                  style={{ color: TONE_TEXT[r.tone] }}
                >
                  {r.ver}
                </div>
                <p className="mt-2 text-[13px] text-[color:var(--fg)]/85 leading-snug">
                  {r.line}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {r.bullets.map((b) => (
                    <li
                      key={b}
                      className="font-mono text-[11.5px] leading-[1.5] text-[color:var(--fg)]/70"
                    >
                      · {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            Hard ABI line between v1.x and v2.0 · manifests written for v1.x carry across all v1.x releases (NFR-042/043).
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <p className="mt-2 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            Dates return when the first milestone is behind us, not before.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
