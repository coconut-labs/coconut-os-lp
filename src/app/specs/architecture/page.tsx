/* /specs/architecture

   The kernel in three registers: what I reasoned my way to, what is in the
   tree at origin/main eef103d with a path:line to check it, and what has to
   be true before v1.0 ships.

   Every BUILT claim on this page carries a Cite. Every DESIGNED claim names a
   story or a decision. Every MUST-BE claim names a version or a gate. A claim
   without its source is a defect.

   Server component. No hooks here; the interactive figures own their own
   client boundaries. */

import type { Metadata } from "next";
import { SpecShell, Section } from "@/components/spec-shell";
import { Reveal } from "@/components/reveal";
import { RegisterMark, RegisterKey, Cite, Drift } from "@/components/register";
import { SyscallAbiMatrix } from "@/components/diagrams/syscall-abi-matrix";
import { SpawnGauntlet } from "@/components/diagrams/spawn-gauntlet";
import { UapiStructMap } from "@/components/diagrams/uapi-struct-map";
import { CapTokenVerify } from "@/components/diagrams/cap-token-verify";
import { CapSetSplit } from "@/components/diagrams/capset-split";
import { CapSetLocking } from "@/components/diagrams/capset-locking";
import { LsmHookMap } from "@/components/diagrams/lsm-hook-map";
import { AgentStateMachine } from "@/components/diagrams/agent-state-machine";
import { InvariantRoster } from "@/components/diagrams/invariant-roster";
import { DecisionCards } from "@/components/diagrams/decision-cards";

export const metadata: Metadata = {
  title: "The architecture · Coconut OS",
  description:
    "The agent subsystem at origin/main, low level: syscall wiring, struct layouts, the cap-token gauntlet, lock discipline, and the one loop that is still open.",
};

/* ── shared shapes ──────────────────────────────────────────────────── */

type Register = "built" | "designed" | "must-be";

const COMMIT = "eef103d";

/* section 3 · the fork surface, by register */

type SurfaceRow = {
  path: string;
  register: Register;
  detail: string;
  cite: string;
};

const IN_TREE: SurfaceRow[] = [
  {
    path: "kernel/agent/",
    register: "built",
    detail:
      "8 objects: agent.o lifecycle.o registry.o issuer.o syscalls.o coconut_caps.o caps.o cap_token.o. CONFIG_KERNEL_AGENT is default y and the shipping defconfig sets it.",
    cite: "kernel/agent/Makefile:9-19 · kernel/agent/Kconfig:3-8 · arch/x86/configs/coconut_defconfig:33",
  },
  {
    path: "security/coconut/",
    register: "built",
    detail:
      "5 objects: setup.o enforce.o net.o bpf.o ptrace.o, out of 9 .c files in the directory. 10 LSM hooks across four __ro_after_init lists, each registered against the one shared coconut_lsmid. Deny-only, blob-less, stacked after landlock.",
    cite: "security/coconut/Makefile:9,16 · security/coconut/setup.c:51-76 · security/coconut/enforce.c:295-308 · security/coconut/net.c:394-404 · security/coconut/bpf.c:121-129 · security/coconut/ptrace.c:142-150 · arch/x86/configs/coconut_defconfig:50-51",
  },
  {
    path: "kernel/cred.c",
    register: "built",
    detail:
      "One appended pointer on struct cred, written at exactly three sites: NULL on clone failure, the fork deep copy, NULL for kernel creds. No remap of the POSIX capability bitmap and no AID field.",
    cite: "kernel/cred.c:286-295, :737 · include/linux/cred.h:177-182",
  },
];

const NAMED_ABSENT_V1: SurfaceRow[] = [
  {
    path: "kernel/audit/coconut/",
    register: "must-be",
    detail:
      "The TLV-encoded, BLAKE3-chained, per-CPU-ring audit emit. v1.0 · STORY-K-9.1. Today the whole audit surface is an atomic64 counter per event, a pr_debug line, and one global KUnit test-sink slot.",
    cite: "kernel/agent/caps.c:60-97 · arch/x86/configs/coconut_defconfig:77-78",
  },
  {
    path: "fs/agentfs/",
    register: "must-be",
    detail:
      "The per-agent inspector tree. v1.0 · STORY-K-6.x. CONFIG_AGENTFS is a commented placeholder in the defconfig and the directory does not exist.",
    cite: "arch/x86/configs/coconut_defconfig:84-85",
  },
  {
    path: "kernel/sched/agent.c",
    register: "must-be",
    detail:
      "The AID-aware scheduling class. v1.0 · STORY-K-4.x. git grep coconut over kernel/sched/ returns zero hits.",
    cite: "arch/x86/configs/coconut_defconfig:87-88",
  },
  {
    path: "kernel/cgroup/agent.c",
    register: "must-be",
    detail:
      "The agent cgroup-v2 controller that enforces the quota bucket. v1.0 · STORY-K-4.6 / K-7.x. coconut_cgroup_agent_can_spawn appears exactly once tree-wide, inside a comment.",
    cite: "kernel/agent/agent.h:81-82 · arch/x86/configs/coconut_defconfig:90-91",
  },
];

/* Not a v1.0 row. The MUST-BE legend reads "the working state at v1.0", so a
   v2-gated path cannot sit in the list above without the mark contradicting
   the row it marks. */

const NAMED_ABSENT_V2: SurfaceRow[] = [
  {
    path: "mm/agent_mm.c",
    register: "must-be",
    detail:
      "Tier-aware allocation. v2 · decision-rc1-capability-replacement-scope. The three mem_tier caps are hint-only at v1 and agent_memory_tier returns -ENOSYS, so mem_tier_pref can never leave DEFAULT.",
    cite: "Documentation/coconut/agent-syscalls.rst:105-108 · kernel/agent/syscalls.c:1268-1281",
  },
];

/* section 12 · the consolidated drift roster */

type DriftRow = { place: string; doc: string; code: string };

const DRIFT_ROSTER: DriftRow[] = [
  {
    place: "include/uapi/linux/agent.h:112",
    doc: "attestation is 132 bytes total",
    code: "the declaration at include/uapi/linux/agent.h:144-157 sums to 168, and :135 in the same comment block says 168 too. Nothing pins the size: kernel/agent/syscalls.c:484-485 asserts offsetof(signature) == AGENT_ATTESTATION_SIG_SCOPE_VER1, which include/uapi/linux/agent.h:184-185 defines as sizeof minus 64, so the assert fixes signature[64] as the trailing field and nothing else. kernel/agent/syscalls.c:478-479 records that the tautological size assertion was dropped on purpose.",
  },
  {
    place: "kernel/agent/agent.h:45-52",
    doc: "the transition table has 7 legal edges",
    code: "kernel/agent/lifecycle.c:74-97 codes 8. QUOTA_EXCEEDED to TERMINATING exists only in code. The kernel/agent/lifecycle.c:58-66 prologue also says 8, so two in-tree descriptions of the same table disagree with each other.",
  },
  {
    place: "include/uapi/linux/coconut_caps.h:158-161",
    doc: "an out-of-range cap_id returns -EINVAL",
    code: "kernel/agent/syscalls.c:1232-1233 rejects only values above U32_MAX, so 0xFFFFFFFF reaches cap_set_has and :1203-1204 hands back -EACCES with an AE_CAP_DENIED attached.",
  },
  {
    place: "kernel/agent/agent.h:116 · kernel/agent/Kconfig:12",
    doc: "task_struct carries a coconut_agent pointer",
    code: "git grep coconut include/linux/sched.h returns zero hits. There is no agent field on task_struct.",
  },
  {
    place: "kernel/agent/agent.c:16-22",
    doc: "the subsystem contributes zero bytes to the built kernel",
    code: "arch/x86/configs/coconut_defconfig:33 sets CONFIG_KERNEL_AGENT=y and kernel/agent/Kconfig:8 defaults it to y. The header comment is K-2.1 era and false at this commit.",
  },
  {
    place: "include/linux/coconut_cred.h:12-14",
    doc: "prepare_creds() bumps the refcount through coconut_caps_get()",
    code: "kernel/cred.c:287-288 clones the set and :294 publishes the clone. The comment at :267-271 says the raw pointer carried over by the memcpy is deliberately not coconut_caps_get'd, so no shared ref is taken.",
  },
  {
    place: "security/coconut/setup.h:82-84",
    doc: "the NULL-defer guard is single-sourced so it cannot drift between hook files",
    code: "the same six-line preamble is open-coded four more times: security/coconut/net.c:286-291, :335-340, :371-376 and security/coconut/ptrace.c:109-114, beside the security/coconut/enforce.c:142-147 original inside coconut_check_current.",
  },
  {
    place: "Documentation/coconut/agent-syscalls.rst:39-46",
    doc: "474 through 479 are -ENOSYS stubs",
    code: "474 through 477 are implemented and wired at arch/x86/entry/syscalls/syscall_64.tbl:403-406. Only 478 and 479 return -ENOSYS, and they are unreachable rather than stubbed.",
  },
  {
    place: "Documentation/coconut/cap-conformance-invariants.md:45-46, :592-600",
    doc: "4 SCAFFOLD",
    code: "the same file's per-invariant evidence lines split 05 and 11, at :239-243 and :401-403. Each is PROVEN on one arm and SCAFFOLD on the other. The honest tally is 13 PROVEN, 2 SPLIT, 2 SCAFFOLD. This one is doc against doc, not doc against code.",
  },
  {
    place: "kernel/agent/Makefile:5-7",
    doc: "CONFIG_KERNEL_AGENT depends on SECURITY_COCONUT and AUDIT_COCONUT",
    code: "kernel/agent/Kconfig:3-13 declares no depends on at all, and the dependency runs the other way: security/coconut/Kconfig:6 makes SECURITY_COCONUT depend on KERNEL_AGENT.",
  },
  {
    place: "kernel/agent/Kconfig.kunit:26-27",
    doc: "the suites run under UML",
    code: "the kunit-coconut job forces --arch=x86_64 at .gitlab-ci.yml:252, because UML under Docker seccomp emits zero KTAP and the job goes red. The reason is written out at .gitlab-ci.yml:202-207.",
  },
  {
    place: "kernel/agent/syscalls.c:11",
    doc: "477 is the hot path, budget under 200ns p99. Neither number carries a regime anywhere in the tree: no hardware, no workload, no n. Both are design budgets rather than measurements",
    code: "kernel/agent/syscalls.c:1123-1129 in the same file says 477 is explicitly not that path and its budget is around 5µs, with a crypto_alloc_shash per call flagged as a known perf TODO.",
  },
  {
    place: "Documentation/coconut/cap-conformance-invariants.md:61, :63-70",
    doc: "no landed errno exists for replay",
    code: "kernel/agent/syscalls.c:49-51 registers -EKEYREVOKED for a nonce reused within its TTL, and :803-804 returns it. The doc's refusal to freeze the value is stale, and cap_inv_02_replay still asserts non-success only, so the contract and the code can drift without a red run.",
  },
];

/* section 15 · the gap between here and v1.0 */

type Gap = { what: string; gate: string; detail: string; cite: string };

const GAPS: Gap[] = [
  {
    what: "coconutd",
    gate: "v1.0 · STORY-U-1.1",
    detail:
      "The userspace supervisor holds the issuer key, execs the agent image, and drives ATTESTING to RUNNING. It is not in the tree in any form, so the RUN leg of the round trip is deferred and every agent stops at ATTESTING.",
    cite: "tools/coconut/libcoconut/README.md:38-40 · Documentation/coconut/agent-syscalls.rst:87-91, :146-151, :228-230",
  },
  {
    what: "the grant to enforce bridge",
    gate: "v1.0 · EPIC-K-8 follow-up",
    detail:
      "A grant publishes agent->cap_set and the LSM reads cred->cap_set on the same task. No code fans one onto the other, so enforcement is inert. The tree says so itself and routes it.",
    cite: "kernel/agent/agent.h:139-144",
  },
  {
    what: "a teardown trigger",
    gate: "v1.0 · Gate 1",
    detail:
      "An agent that reaches RUNNING can be torn down. There is no exit hook, no kill path, and no coconut code in kernel/exit.c or kernel/fork.c, so every attested agent holds its slab object, registry slot and cap set for the rest of the boot.",
    cite: "kernel/agent/lifecycle.c:145-203 · kernel/agent/registry.c:32-36",
  },
  {
    what: "a real audit record",
    gate: "v1.0 · STORY-K-9.1",
    detail:
      "An auditor reads a chained, persisted event stream per agent. Today an event increments a counter and writes a pr_debug line. Nothing is encoded, chained, or kept.",
    cite: "kernel/agent/caps.c:60-97",
  },
  {
    what: "a signature that is a signature",
    gate: "v1.0 · STORY-K-9.1",
    detail:
      "Attestation is verifiable by a party that is not the kernel that issued it. Linux 6.12 ships X25519 ECDH and no Ed25519 signing, so v1 is a keyed BLAKE2b MAC with the 64-byte offset preserved for an ABI-neutral swap.",
    cite: "Documentation/coconut/agent-syscalls.rst:268-280 · kernel/agent/cap_token.c:18-25",
  },
  {
    what: "a locked syscall range",
    gate: "Sprint 4 · Gate 1",
    detail:
      "472 through 479 are frozen and the libc bindings ship against them. The range is reserved today, not locked, with 480-487 pre-conceded. The LKML note is written and deliberately unsent until Sprint 7.",
    cite: "kernel/agent/syscalls.c:15-17 · Documentation/coconut/lkml-reservation-note.txt:1-11, :46-50",
  },
  {
    what: "arm64",
    gate: "v1.0 · x86_64 only",
    detail:
      "An arm64 userspace gets __NR_agent_* and a dispatch entry. scripts/syscall.tbl ends at 462 mseal, so arm64 has neither, and nothing in the tree schedules the rows. The v1.0 surface is x86_64.",
    cite: "arch/arm64/tools/syscall_64.tbl:1 · scripts/syscall.tbl:405",
  },
];

const AGENTFS_REMNANT: { line: string; cite: string }[] = [
  { line: "/agent/<aid>/meta/cookie", cite: "Documentation/coconut/agent-syscalls.rst:110-112" },
  { line: 'CONFIG_AGENTFS_DEFAULT_MOUNT="/agent"', cite: "arch/x86/configs/coconut_defconfig:243-244" },
  { line: "agent_audit_query(478) is the read path", cite: "kernel/agent/syscalls.c:1253-1266" },
  { line: "none of it exists · fs/agentfs/ is absent", cite: "arch/x86/configs/coconut_defconfig:84-85" },
];

/* section 16 · still open */

type OpenQ = { register: Register; q: string; body: string; cite: string };

const OPEN_QUESTIONS: OpenQ[] = [
  {
    register: "designed",
    q: "Which bridge closes the loop, and which clock wins when it does?",
    body: "Three options with different security properties: snapshot into cred at bind time, borrow the RCU-published pointer, or resolve the agent on every hook. Snapshotting makes revocation unreachable without a second mechanism. Borrowing makes it instant and forces a rethink of the fork deep copy. Resolving pays a registry lookup on every open(2). Whichever wins also has to pick realtime or monotonic, because today the two paths disagree.",
    cite: "kernel/agent/agent.h:139-144 · kernel/agent/caps.c:418 · kernel/agent/syscalls.c:746, :1195 · security/coconut/enforce.c:148 · EPIC-K-8 follow-up",
  },
  {
    register: "designed",
    q: "Is a dead asm-generic edit intentional?",
    body: "The edit defines __NR_agent_spawn 472 and __NR_agent_attest 473 and bumps __NR_syscalls to 474, and nothing reads it. No Makefile, no arch header and no C file in the tree pulls that header, and every non-x86 architecture generates its table from scripts/syscall.tbl, which ends at 462 mseal. So the edit adds dispatch on no architecture at all, including the arm64 it looks aimed at. I do not know whether a header edit that wires nothing was the intent or an artifact of editing the wrong file for arm64.",
    cite: "include/uapi/asm-generic/unistd.h:844-863 · scripts/syscall.tbl:405 · arch/arm64/tools/syscall_64.tbl:1 · STORY-K-2.8",
  },
  {
    register: "must-be",
    q: "Is an unprivileged agent flood accepted for v1?",
    body: "472 performs no capability check of any kind, and the registry comment says its upper bound is the slab cache size, which is unbounded. Either the flood is an accepted v1 risk or the CAP_AGENT_SPAWN gate lands before Gate 1 rather than at STORY-K-6.x.",
    cite: "kernel/agent/syscalls.c:170-320 · kernel/agent/registry.c:32-36 · Gate 1",
  },
  {
    register: "designed",
    q: "Should the privilege check on 475 move ahead of the copy-in?",
    body: "Today an unprivileged caller drives up to 66 copy_from_user calls and a 17,304 byte kmalloc before capable(CAP_SYS_ADMIN) is evaluated, only to be denied. Moving the check also changes the emit contract, because pre-gate rejections currently emit nothing.",
    cite: "kernel/agent/syscalls.c:124-126, :869-902, :915 · bears on CAP-INV-04 · no decision recorded, which is what leaves it open",
  },
  {
    register: "must-be",
    q: "What triggers teardown?",
    body: "A process exit hook, an agent_drop_self in the 478 or 479 slot, or an agentfs control write. The answer decides whether the registry needs a hard bound before Gate 1, because until then nothing reclaims an agent.",
    cite: "kernel/agent/lifecycle.c:145-203 · Gate 1",
  },
  {
    register: "designed",
    q: "Is the spawn_rate truncation a placeholder or a live bug?",
    body: "agent->quota.spawn_rate = (u32)kargs.refill_per_sec puts a token refill rate into an agents-per-second field and truncates u64 to u32 on the way. It matters now, before STORY-K-4.6 wires a reader, because after that it stops being dead state and becomes a behavior regression.",
    cite: "kernel/agent/syscalls.c:239-248 · kernel/agent/agent.h:80-86 · STORY-K-4.6",
  },
  {
    register: "must-be",
    q: "Does 472-479 survive contact with LKML at all?",
    body: "The range is coordination-only and we are not seeking to merge the syscalls. The note pre-concedes 480-487, and it also concedes a completely different range with a re-cascade through every table and every userspace consumer.",
    cite: "Documentation/coconut/lkml-reservation-note.txt:46-50, :99-103, :105-109 · Sprint 7",
  },
];

/* ── local render helpers ───────────────────────────────────────────── */

function Note({
  register,
  heading,
  cite,
  children,
}: {
  register: Register;
  heading: string;
  cite: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <RegisterMark state={register} />
        <span className="font-mono text-[11px] text-[color:var(--fg)]/85 tracking-tight">{heading}</span>
      </div>
      <p className="mt-2.5 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{children}</p>
      <div className="mt-2">
        <Cite source={cite} />
      </div>
    </div>
  );
}

function SurfaceList({ rows }: { rows: SurfaceRow[] }) {
  return (
    <ul className="rounded-[2px] border hairline">
      {rows.map((r) => (
        <li key={r.path} className="p-4 sm:p-5 border-b hairline last:border-b-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[13px] text-[color:var(--accent)] tracking-tight break-all">{r.path}</span>
            <RegisterMark state={r.register} />
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{r.detail}</p>
          <div className="mt-2">
            <Cite source={r.cite} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── page ───────────────────────────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <SpecShell
      slug="architecture"
      tag="what"
      title={
        <>
          The kernel, as I designed it · as it is at{" "}
          <span className="text-[color:var(--accent)]">{COMMIT}</span> · as it must be.
        </>
      }
      blurb={
        <>
          Three registers, marked on every claim. What I reasoned my way to, what is actually in the tree today
          with the file and line to check it, and what has to be true before v1.0 ships. They are not the same
          thing and this page never lets them blur.
        </>
      }
    >
      {/* 1 ───────────────────────────────────────────────────────────── */}
      <Section eyebrow="how to read this">
        <Reveal>
          <p className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            origin/main {COMMIT} · Thu Aug 13 2026 · every fact below is read with git show origin/main:&lt;path&gt;
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <RegisterKey commit={COMMIT} className="mt-6" />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Note
              register="built"
              heading="the spine fact"
              cite="security/coconut/enforce.c:136-153 · security/coconut/net.c:367-369 · kernel/cred.c:286-295 · CAP-INV-13 · security/coconut/setup.h:147-152"
            >
              No production path ever installs a non-NULL cred-&gt;cap_set. Every one of the 10 registered LSM
              hooks that reaches its cred read finds NULL and returns 0 before it reads a clock. socket_create
              returns 0 earlier still, at security/coconut/net.c:367-369, for anything that is not SOCK_RAW, so it never reaches
              the cred read at all. Capability enforcement is compiled in, registered at boot, and inert. The
              KUnit suites manufacture a cap set through override_creds precisely because no production path
              can produce one.
            </Note>
            <Note
              register="built"
              heading="what is real"
              cite="arch/x86/entry/syscalls/syscall_64.tbl:389-406 · include/uapi/linux/lsm.h:68 · arch/x86/configs/coconut_defconfig:50-51 · kernel/agent/cap_token.c:84-93, :174-289 · .gitlab-ci.yml:97-117, :103-105, :419-425, :438-441, :533-539"
            >
              Six agent syscalls are dispatch-live on x86_64. LSM_ID_COCONUT is enum value 114 and sits after
              landlock in the boot stack. cap_token_verify is an 8-step fail-closed gauntlet with distinct
              errnos and compile-time layout locks. roundtrip-qemu boots the coconut bzImage and requires a
              ^coconut-selftest: PASS marker or exits 1, and it scores a SKIP as a FAIL. Its red is
              conditional. workflow:rules at .gitlab-ci.yml:97-117 creates a pipeline only for a merge request,
              a web trigger, a schedule, or a push to main that touches kernel paths, so a doc-only commit on
              main is never gated by it at all. Rule 1 at :103-105 suppresses all four on a [skip ci] or [ci
              skip] in the commit message, so a commit message defeats the hard gate. The job&apos;s own rules
              at :438-441 are schedule then when: never, so the one pipeline the weekly schedule does create
              never runs it.
            </Note>
          </div>
        </Reveal>
      </Section>

      {/* 2 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="why a fork"
        title={
          <>
            A capability the kernel does not already have. <RegisterMark state="designed" />{" "}
            <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Note
              register="designed"
              heading="in the kernel, not above it"
              cite="README.md:18-26 · decision-rc1-capability-replacement-scope"
            >
              I put the capability token and the audit emit in the kernel rather than in eBPF, an out-of-tree
              module, or a userspace supervisor. eBPF can observe a syscall and it can refuse one, but its
              programs are loadable and unloadable by the same privilege the agent is trying to escape. An
              out-of-tree module has no seat in the LSM stack ordering. A userspace daemon is a process, and a
              process can be raced, stopped, or ptraced. The root README.md:24 states the position in one
              line: capability token plus audit-everything as kernel primitives, not a userspace overlay.
            </Note>
            <Note
              register="designed"
              heading="the deliberate non-goal"
              cite="Documentation/coconut/lkml-reservation-note.txt:40-44, :94-103 · STORY-K-2.9"
            >
              I am not upstreaming these syscalls. The reservation note says why in its own words: they are
              tightly coupled to Coconut-specific infrastructure and would not generalize. What I want from
              LKML is a range nobody else claims, so a future mainline syscall does not collide with an ABI
              already shipped in binaries. The pre-send checklist tells me to accept whatever range the
              maintainers prefer and not to defend the design.
            </Note>
            <Note
              register="built"
              heading="the trade study is not in this tree"
              cite="Documentation/coconut/README.md:28-34 · Documentation/coconut/ · 9 files, none of them a trade study"
            >
              Documentation/coconut/ holds nine files at {COMMIT}: README.md, agent-syscalls.rst,
              cap-conformance-invariants.md, ci-on-gitlab.md, dev-environment.md, rebase-runbook.md,
              spike-6-iso-build-poc.md, nvidia-cred-shim-reproducer.md and lkml-reservation-note.txt. None of
              them weighs eBPF or an out-of-tree module against an in-kernel primitive.
              Documentation/coconut/README.md:28-34 scopes this tree to how to operate the kernel work. The
              canonical what and why lives in the private spec repo coconutlabs/coconutos, referenced here by
              section number only, and that repo wins on conflict.
            </Note>
          </div>
        </Reveal>
      </Section>

      {/* 3 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the fork surface"
        title={
          <>
            Three new subsystems on paper. Two in the tree. The third is a counter and a pr_debug.{" "}
            <RegisterMark state="built" /> <RegisterMark state="must-be" />
          </>
        }
      >
        <Reveal>
          <Note
            register="built"
            heading="the paper list, checked against the tree"
            cite="README.md:20-21 · kernel/agent/caps.c:60-97"
          >
            The root README.md:20 names three new subsystems: kernel/agent/, security/coconut/,
            kernel/audit/coconut/. The first two are directories with objects in them. The third has no file
            at any path. The whole audit surface is an atomic64 counter array, one global KUnit sink slot and
            a pr_debug line, all inside kernel/agent/caps.c, with the real emit left as a TODO against
            STORY-K-9.1. The root README.md:21 lists kernel/cred.c, mm/, fs/agentfs/, kernel/sched/agent.c and
            kernel/cgroup/agent.c as modified rather than new.
          </Note>
        </Reveal>
        <Reveal delay={0.02}>
          <div className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            in the tree at {COMMIT} · two new subsystems, then the one modified file
          </div>
        </Reveal>
        <Reveal delay={0.04}>
          <div className="mt-3">
            <SurfaceList rows={IN_TREE} />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Drift
            className="mt-4"
            docSays={<>kernel/agent/agent.c:16-22 · the subsystem contributes zero bytes to the built kernel</>}
            codeDoes={<>arch/x86/configs/coconut_defconfig:33 sets CONFIG_KERNEL_AGENT=y and kernel/agent/Kconfig:8 defaults it to y</>}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            named across the tree, absent from it · due at v1.0
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-3">
            <SurfaceList rows={NAMED_ABSENT_V1} />
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            named across the tree, absent from it · scoped to v2, not v1.0
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-3">
            <SurfaceList rows={NAMED_ABSENT_V2} />
          </div>
        </Reveal>
      </Section>

      {/* 4 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the syscall surface"
        title={
          <>
            Six live on x86_64. Two unreachable on every arch. Zero on arm64, and the asm-generic
            edit wires nothing. <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <SyscallAbiMatrix />
        </Reveal>
      </Section>

      {/* 5 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="agent_spawn, check by check"
        title={
          <>
            Ten checks, in the order they run, with the errno each returns. <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <SpawnGauntlet />
        </Reveal>
      </Section>

      {/* 6 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the ABI on the wire"
        title={
          <>
            Six structs. Four pinned in the kernel, two only by the userspace mirror.{" "}
            <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <UapiStructMap />
        </Reveal>
      </Section>

      {/* 7 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the cap token"
        title={
          <>
            Eight steps. The eighth is the MAC, and the MAC is not a signature.{" "}
            <RegisterMark state="built" />{" "}
            <RegisterMark state="designed" />
          </>
        }
      >
        <Reveal>
          <CapTokenVerify />
        </Reveal>
      </Section>

      {/* 8 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="where the loop is open"
        title={
          <>
            Grant writes one object. Enforcement reads another. <RegisterMark state="built" />{" "}
            <RegisterMark state="must-be" />
          </>
        }
      >
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Note
              register="built"
              heading="the finding, stated plainly"
              cite="kernel/agent/syscalls.c:835 · security/coconut/enforce.c:143 · kernel/cred.c:286-295"
            >
              agent_cap_grant publishes into agent-&gt;cap_set. The LSM hooks read cred-&gt;cap_set. Those are
              two disjoint objects and no code in the tree moves one to the other. The single write site that
              could is guarded by if (new-&gt;cap_set), which is never true, so that line is dead. This is not
              a rough edge on the capability system. It is the capability system, not yet connected.
            </Note>
            <Note
              register="built"
              heading="what that costs today"
              cite="kernel/agent/syscalls.c:1189-1193, :1243, :915, :1111 · security/coconut/enforce.c:136-153 · kernel/agent/caps.c:660-679"
            >
              agent_cap_present returns -EACCES for every caller on a booted system, and emits an
              AE_CAP_DENIED on the way out. Every LSM hook returns 0 for every task. Grant and revoke succeed
              only through the capable(CAP_SYS_ADMIN) bootstrap door, because cap_grant_check_authority with a
              NULL set is always -EACCES.
            </Note>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-8">
            <CapSetSplit />
          </div>
        </Reveal>
      </Section>

      {/* 9 ───────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="lock discipline"
        title={
          <>
            One spinlock, one sleepable mutex, and RCU clone-then-publish. <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <CapSetLocking />
        </Reveal>
      </Section>

      {/* 10 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="what the LSM gates"
        title={
          <>
            Ten hooks. Eleven cap ids of sixty-four, plus two the grant and revoke gates read outside
            any hook. <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <LsmHookMap />
        </Reveal>
      </Section>

      {/* 11 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the lifecycle"
        title={
          <>
            Six states. Eight legal edges. Three edges with a production caller.{" "}
            <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <AgentStateMachine />
        </Reveal>
      </Section>

      {/* 12 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="where the tree lies to itself"
        title={
          <>
            Thirteen places the tree disagrees with itself. Eleven a doc against the code, two a
            document against itself. <RegisterMark state="built" />
          </>
        }
      >
        <Reveal>
          <Note
            register="built"
            heading="the rule"
            cite="include/uapi/linux/agent.h:112, :144-157, :184-185 · kernel/agent/syscalls.c:11, :478-485, :1123-1129 · Documentation/coconut/cap-conformance-invariants.md:239-243, :401-403, :581-602"
          >
            Eleven rows resolve against an artifact that executes: a struct declaration, a transition
            table, a Kconfig, a CI job. In those the code is the truth and the doc claim is the defect.
            Two rows do not. Row nine is a document disagreeing with its own evidence lines. Row twelve
            is kernel/agent/syscalls.c:11 calling 477 the hot path and :1123-1129 denying it, both comments
            in the same file. Row one is not one of the two: include/uapi/linux/agent.h:112 says 132 bytes and the struct
            declaration at :144-157 sums to 168.
          </Note>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-6 overflow-x-auto rounded-[2px] border hairline">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                Thirteen disagreements at origin/main eef103d, eleven of them a doc against the code and
                two a document against itself, with the place, what the document claims, and what the
                code does.
              </caption>
              <thead>
                <tr className="border-b hairline">
                  <th
                    scope="col"
                    className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                  >
                    place
                  </th>
                  <th
                    scope="col"
                    className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                  >
                    doc says
                  </th>
                  <th
                    scope="col"
                    className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                  >
                    code does
                  </th>
                </tr>
              </thead>
              <tbody>
                {DRIFT_ROSTER.map((d) => (
                  <tr key={d.place} className="border-b hairline last:border-b-0 align-top">
                    <th
                      scope="row"
                      className="p-3 font-mono text-[11px] font-normal text-[color:var(--fg)]/85 w-[26%] break-words"
                    >
                      {d.place}
                    </th>
                    <td className="p-3 font-mono text-[11px] leading-snug text-[color:var(--muted)] w-[26%]">
                      {d.doc}
                    </td>
                    <td className="p-3 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/85">
                      {d.code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* 13 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="what proves it"
        title={
          <>
            Seventeen invariants, all gate-blocking. The doc counts thirteen proven and four
            scaffold. <RegisterMark state="built" /> Two of those four carry a proven arm, so the
            honest tally is thirteen, two split, two scaffold. That reconciliation is mine, not the
            tree&apos;s. The invariants doc has no SPLIT state and never uses the word.{" "}
            <RegisterMark state="designed" />
          </>
        }
      >
        <Reveal>
          <InvariantRoster />
        </Reveal>
      </Section>

      {/* 14 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="the calls I made"
        title={
          <>
            Six decisions and the alternatives they beat. <RegisterMark state="designed" />
          </>
        }
      >
        <Reveal>
          <DecisionCards />
        </Reveal>
      </Section>

      {/* 15 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="what must be true at v1.0"
        title={
          <>
            The working state, end to end, and the distance to it. <RegisterMark state="must-be" />
          </>
        }
      >
        <Reveal>
          <Note
            register="must-be"
            heading="the path, narrated once"
            cite="Documentation/coconut/spike-6-iso-build-poc.md:161-164, :176-178 · Documentation/coconut/agent-syscalls.rst:110-112, :143-151 · v1.0"
          >
            coconutpkg installs a capability-annotated package onto an rpm-ostree A/B image. coconutd holds
            the issuer key, execs the agent image, and drives the agent from ATTESTING to RUNNING.
            agent_cap_grant publishes a cap set and the LSM reads that same set on that same task, so an
            open(2) without CAP_AGENT_FILE_READ comes back -EACCES with one audit event behind it.
            agent_audit_query reads the chain back per agent, and /agent/&lt;aid&gt;/ shows the same state as a
            directory tree. Every sentence in this paragraph is the target. None of it runs today.
          </Note>
        </Reveal>
        <Reveal delay={0.06}>
          <ul className="mt-6 rounded-[2px] border hairline">
            {GAPS.map((g) => (
              <li key={g.what} className="p-4 sm:p-5 border-b hairline last:border-b-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <RegisterMark state="must-be" />
                  <span className="font-mono text-[12.5px] text-[color:var(--fg)]/85 tracking-tight">{g.what}</span>
                  <span className="font-mono text-[11px] text-[color:var(--highlight)] tracking-tight">{g.gate}</span>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{g.detail}</p>
                <div className="mt-2">
                  <Cite source={g.cite} />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <RegisterMark state="must-be" />
              <span className="font-mono text-[11px] text-[color:var(--fg)]/85 tracking-tight">
                the /agent tree, in four lines
              </span>
              <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
                v1.0 · STORY-K-6.x
              </span>
            </div>
            <dl className="mt-3 space-y-2">
              {AGENTFS_REMNANT.map((r) => (
                <div key={r.line} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <dt className="font-mono text-[12px] text-[color:var(--fg)]/85 tracking-tight break-all">
                    {r.line}
                  </dt>
                  <dd className="min-w-0">
                    <Cite source={r.cite} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      {/* 16 ──────────────────────────────────────────────────────────── */}
      <Section
        eyebrow="still open"
        title={
          <>
            Questions I have not answered. <RegisterMark state="designed" /> <RegisterMark state="must-be" />
          </>
        }
      >
        <Reveal>
          <ol className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {OPEN_QUESTIONS.map((o, i) => (
              <li key={o.q} className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-mono text-[11px] text-[color:var(--muted)]" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <RegisterMark state={o.register} />
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.45] text-[color:var(--fg)]/90">{o.q}</p>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/75">{o.body}</p>
                <div className="mt-2">
                  <Cite source={o.cite} />
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>
    </SpecShell>
  );
}
