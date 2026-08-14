/* Spec card previews. The overlay reads from this — single source of truth.
   Voice is the same as the LP: distilled, specific, restrained. Show the
   shape; the sources land alongside v0.1 spec drop. */

import type { SpecPreview } from "@/components/spec-overlay";

export const SPECS: SpecPreview[] = [
  {
    slug: "thesis",
    no: "01",
    name: "The thesis",
    tag: "why",
    blurb:
      "The unit of compute is no longer the Unix process. The OS substrate has to be rebuilt around the agent.",
    bullets: [
      "A 5-year horizon: Coconut OS as the default substrate for safe multi-agent AI compute.",
      "The mission: ship v1.0, a Linux distribution that runs a 31-agent swarm with capability isolation and a tamper-evident audit chain out of the box.",
      "Built on the layer below: kvwarden (x86/CUDA, v0.1.6 on PyPI) ships the fair-share inference floor; mlxd (ARM/MLX) carries it in research.",
    ],
    status: "preview · the full thesis lives in PRD §1-2 (publishes with v0.1)",
  },
  {
    slug: "architecture",
    no: "02",
    name: "The architecture",
    tag: "what",
    blurb:
      "One ISO, two install profiles, six layers: modified mm/, fs/, cred.c, sched/, cgroup/ plus a new kernel/agent/, kernel/audit/coconut/ and security/coconut/.",
    bullets: [
      "Eight new syscalls form the agent surface. Six are implemented and wired on x86_64; two are still reserved numbers returning -ENOSYS.",
      "coconutd replaces systemd as PID 1, supervising agents the way systemd supervises services.",
      "Coconut Shell is a custom Wayland compositor on Smithay: agent-aware window management with the audit log as a first-class workspace.",
    ],
    status: "preview · architecture sources publish alongside v0.1 spec drop",
  },
  {
    slug: "security",
    no: "03",
    name: "Capabilities, audit chain, attestation",
    tag: "how · the load-bearing line",
    blurb:
      "DAC reduced to a compatibility layer. The capability bundle is the primary access-control object, and a missing capability is denied at the syscall, before the operation reaches VFS.",
    bullets: [
      "Capabilities are signed, bound at spawn, revocable mid-execution. The spec calls for Ed25519; the tokens in the tree today use a keyed MAC.",
      "Every agent-relevant event appends to a BLAKE3-chained audit log, rooted in TPM-NV on supported hardware.",
      "Five adversary classes are in-scope at v1.0: hostile agent, supply chain, local non-agent, network attacker, insider with admin caps but not signing keys.",
    ],
    status: "preview · mechanism details harden as the prototypes land",
  },
  {
    slug: "roadmap",
    no: "04",
    name: "Roadmap",
    tag: "when",
    blurb:
      "The sequence. Versions are ordered, not dated; v1.0 when the spec survives review.",
    bullets: [
      "v1.0: x86_64 + NVIDIA, Workstation + Server profiles.",
      "v1.1 / v1.2: ARM64 server, then Apple Silicon via Asahi bootstrap.",
      "v2.0: full mm/ + cred.c replacement, the only planned ABI break after the v1.x line.",
    ],
    status: "preview · sprint-level commitments move with the build",
  },
  {
    slug: "team",
    no: "05",
    name: "Team + cadence",
    tag: "how · the build",
    blurb:
      "Two engineers today. The plan is sized for a team; the spec is sized for review.",
    bullets: [
      "Planned roles: kernel · userspace · compositor · brand + design · platform + CI · security · release engineering.",
      "Three projects run at once: kvwarden, mlxd, Coconut OS. The lab has only ever shipped solo work before this.",
      "Sprint cadence is two weeks. Sprint 0 is behind us and kernel stories are landing.",
    ],
    status: "preview · the topology is the plan · bios publish when names attach",
  },
];

export function getSpec(slug: string) {
  return SPECS.find((s) => s.slug === slug);
}
