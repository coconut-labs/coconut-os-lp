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
      "The unit of compute is no longer the Unix process. The OS substrate has to be rebuilt around the agent — capability-bound, attested, audit-everything.",
    bullets: [
      "A 5-year horizon: Coconut OS as the default substrate for safe multi-agent AI compute.",
      "An 18-month mission: ship v1.0 — a Linux distribution that runs a 31-agent swarm with capability isolation + tamper-evident audit out of the box.",
      "Built on the layer below: kvwarden (x86/CUDA) and mlxd (ARM/MLX) already ship the fair-share inference floor.",
    ],
    status: "preview · the full thesis lives in PRD §1-2 (publishes with v0.1)",
  },
  {
    slug: "architecture",
    no: "02",
    name: "The architecture",
    tag: "what",
    blurb:
      "One ISO, two install profiles, six layers — modified mm/, fs/, cred.c, sched/, cgroup/ plus a new kernel/agent/, kernel/audit/coconut/ and security/coconut/.",
    bullets: [
      "Eight new syscalls form the agent surface: spawn, attest, quota, cap_grant, cap_revoke, cap_present, audit_query, memory_tier.",
      "coconutd replaces systemd as PID 1, supervising agents the way systemd supervises services.",
      "Coconut Shell is a custom Wayland compositor on Smithay — agent-aware window management with the audit log as a first-class workspace.",
    ],
    status: "preview · architecture sources publish alongside v0.1 spec drop",
  },
  {
    slug: "security",
    no: "03",
    name: "Capabilities, audit chain, attestation",
    tag: "how — the load-bearing line",
    blurb:
      "DAC reduced to a compatibility layer. The capability bundle is the primary access-control object — denied at syscall before the operation reaches VFS.",
    bullets: [
      "Capabilities are Ed25519-signed, bound at spawn, revocable mid-execution.",
      "Every agent-relevant event appends to a BLAKE3-chained audit log, rooted in TPM-NV on supported hardware.",
      "Five adversary classes are in-scope at v1.0 — hostile agent, supply chain, local non-agent, network attacker, insider with admin caps but not signing keys.",
    ],
    status: "preview · mechanism details harden through Sprint 18-22",
  },
  {
    slug: "roadmap",
    no: "04",
    name: "Roadmap",
    tag: "when",
    blurb:
      "12-18 months to v1.0. Then a four-year curve to the default substrate.",
    bullets: [
      "v1.0 (2027 Q4): x86_64 + NVIDIA — Workstation + Server profiles.",
      "v1.1 / v1.2 (2028): ARM64 server, then Apple Silicon via Asahi bootstrap.",
      "v2.0 (~2029-30): full mm/ + cred.c replacement — the only planned ABI break in the v1.x line.",
    ],
    status: "preview · sprint-level commitments move with the build",
  },
  {
    slug: "team",
    no: "05",
    name: "Team + cadence",
    tag: "how — the build",
    blurb:
      "Ten engineers, named and committed. Twenty-six two-week sprints. Coconut Labs' first multi-engineer project.",
    bullets: [
      "Roles: kernel · userspace · compositor · brand + design · platform + CI · security · release engineering.",
      "Three parallel projects run concurrently: kvwarden, mlxd, Coconut OS — solo-builder DNA, multi-engineer first.",
      "Sprint cadence is two weeks. Sprint 0 starts when the spec set is locked.",
    ],
    status: "preview · names + per-role bios publish at Sprint 0 kickoff",
  },
];

export function getSpec(slug: string) {
  return SPECS.find((s) => s.slug === slug);
}
