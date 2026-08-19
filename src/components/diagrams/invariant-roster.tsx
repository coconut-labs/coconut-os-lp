/* What proves it. The 17 registered capability conformance invariants by
   evidence state, the six KUnit suites behind them, and the CI ladder that
   is supposed to hold the line.

   Static figure. No state, no motion, no client boundary.

   Every fact below is read at origin/main eef103d from
   Documentation/coconut/cap-conformance-invariants.md, .gitlab-ci.yml,
   kernel/agent/, security/coconut/ and the six *_kunit.c case arrays.
   Cite grammar: a `:line` with no path in front of it is into that doc; a
   `:line` that follows a named path belongs to that path. */

import { Cite, RegisterMark } from "@/components/register";

/* ---------------------------------------------------------------- register */

type Register = "built" | "designed" | "must-be";

/* The one thing this figure does NOT take from the shared primitive.

   The shared Drift hard-codes "doc says" over "code does" and puts the
   readable weight on the code row, because the tree is the truth and the doc
   claim is the defect. That is right everywhere else on the page and wrong
   here. This figure's drift is doc versus doc: cap-conformance-invariants.md
   disagrees with its own per-invariant evidence lines. Labeling the second
   row "code does" would claim the 13 / 2 / 2 tally comes from the tree, which
   it does not, and neither row outranks the other, so both keep the same
   weight. Swapping this for the shared component would change what the figure
   claims. The mark and the cite are shared; this stays local on purpose. */
function Drift({
  saysLabel = "doc says",
  doesLabel = "code does",
  says,
  does,
}: {
  saysLabel?: string;
  doesLabel?: string;
  says: React.ReactNode;
  does: React.ReactNode;
}) {
  return (
    <div
      className="mt-4 pl-3 border-l"
      style={{ borderColor: "color-mix(in oklab, var(--warning) 55%, transparent)" }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ color: "var(--warning)" }}
      >
        drift
      </div>
      <dl className="mt-1.5 space-y-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-[86px_1fr] gap-x-3">
          <dt className="font-mono text-[11px] text-[color:var(--muted)]">{saysLabel}</dt>
          <dd className="font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-snug break-words">{says}</dd>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[86px_1fr] gap-x-3">
          <dt className="font-mono text-[11px] text-[color:var(--muted)]">{doesLabel}</dt>
          <dd className="font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-snug break-words">{does}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------- data */

type Evidence = "proven" | "split" | "scaffold";

type Invariant = {
  id: string;
  /* the property, in one clause */
  property: string;
  evidence: Evidence;
  /* what encodes it, or what does not */
  encoding: string;
  /* line range in cap-conformance-invariants.md */
  doc: string;
  /* CAP-INV-03 only: tagged gate-blocking with no mechanism of any kind */
  noMechanism?: boolean;
};

const INVARIANTS: Invariant[] = [
  {
    id: "CAP-INV-01",
    property: "signature covers the constraints too",
    evidence: "proven",
    encoding: "cap_inv_01_tamper_header + _tamper_constraint",
    doc: ":80-108",
  },
  {
    id: "CAP-INV-02",
    property: "no nonce accepted twice in TTL",
    evidence: "proven",
    encoding:
      "cap_inv_02_replay · doc says no landed errno at :61-63 · kernel/agent/syscalls.c:49-51, :802-805 return -EKEYREVOKED · see drift roster",
    doc: ":112-137",
  },
  {
    id: "CAP-INV-03",
    property: "revoke and present never interleave",
    evidence: "scaffold",
    encoding: "tools/testing/selftests/coconut/cap_revoke_present_interleave.c not in tree · routed to KCSAN",
    doc: ":141-167",
    noMechanism: true,
  },
  {
    id: "CAP-INV-04",
    property: "exactly one audit record per cap-op",
    evidence: "proven",
    encoding: "seven cap_inv_04_* cases against a counter and a KUnit sink",
    doc: ":171-199",
  },
  {
    id: "CAP-INV-05",
    property: "mapped but unheld fails closed",
    evidence: "split",
    encoding: "arm a proven at K-8.1 and K-8.3 · arm b routed to STORY-K-8.5",
    doc: ":203-244",
  },
  {
    id: "CAP-INV-06",
    property: "a grant cannot amplify authority",
    evidence: "proven",
    encoding: "cap_inv_06_authority",
    doc: ":248-269",
  },
  {
    id: "CAP-INV-07",
    property: "a token binds one target agent",
    evidence: "proven",
    encoding: "cap_inv_07_binding",
    doc: ":273-291",
  },
  {
    id: "CAP-INV-08",
    property: "an expired token is rejected",
    evidence: "proven",
    encoding: "cap_inv_08_expired · -ESTALE",
    doc: ":295-311",
  },
  {
    id: "CAP-INV-09",
    property: "cap_set growth stays bounded",
    evidence: "proven",
    encoding: "cap_inv_09_growth + cap_inv_09_ledger_bound",
    doc: ":315-334",
  },
  {
    id: "CAP-INV-10",
    property: "spawn caps take the same checks",
    evidence: "scaffold",
    encoding: "tools/testing/selftests/coconut/spawn_initial_caps_non_amplification.c not in tree · parser unlanded",
    doc: ":338-363",
  },
  {
    id: "CAP-INV-11",
    property: "the cred shim is strictly additive",
    evidence: "split",
    encoding: "lsm_defers_when_cap_set_null proven · security/coconut/cred_shim_kunit.c not in tree",
    doc: ":367-404",
  },
  {
    id: "CAP-INV-12",
    property: "rcu_head stays last in coconut_caps",
    evidence: "proven",
    encoding: "static_assert at kernel/agent/coconut_caps.c:53",
    doc: ":408-436",
  },
  {
    id: "CAP-INV-13",
    property: "spawn inherits no capability",
    evidence: "proven",
    encoding: "cap_inv_13_spawn_empty + _fork_deepcopy_independence",
    doc: ":440-473",
  },
  {
    id: "CAP-INV-14",
    property: "get and put stay balanced",
    evidence: "proven",
    encoding: "agent_kunit_coconut_caps_get_bumps_refcount + _get_put_null_safe",
    doc: ":477-498",
  },
  {
    id: "CAP-INV-15",
    property: "an out of range cap_id returns NULL",
    evidence: "proven",
    encoding: "four kernel/agent/agent_kunit.c cases · bound check precedes the index",
    doc: ":502-527",
  },
  {
    id: "CAP-INV-16",
    property: "the name table is FAST_MAX wide",
    evidence: "proven",
    encoding: "static_assert at kernel/agent/coconut_caps.c:283 + a sweep of [0, 64)",
    doc: ":531-551",
  },
  {
    id: "CAP-INV-17",
    property: "cap_token layout is pinned",
    evidence: "proven",
    encoding: "cap_inv_17_layout at kernel/agent/cap_token_kunit.c:144-147 · cap_token 152 sig@88, cap_proof 136 sig@72",
    doc: ":555-577",
  },
];

/* Evidence state is this figure's inner mark. It maps onto the page register,
   and the mapping is read from the per-invariant evidence lines rather than
   chosen: 05 and 11 are registered built, 03 and 10 are registered designed. */
const EVIDENCE: Record<
  Evidence,
  { label: string; register: Register; meaning: string; cell: React.CSSProperties }
> = {
  proven: {
    label: "proven",
    register: "built",
    meaning: "encoded and running",
    cell: {
      borderStyle: "solid",
      borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
      background: "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)",
    },
  },
  split: {
    label: "split",
    register: "built",
    meaning: "one arm encoded, one arm not",
    cell: {
      borderTopStyle: "solid",
      borderLeftStyle: "solid",
      borderRightStyle: "dashed",
      borderBottomStyle: "dashed",
      borderTopColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
      borderLeftColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
      borderRightColor: "color-mix(in oklab, var(--muted) 55%, transparent)",
      borderBottomColor: "color-mix(in oklab, var(--muted) 55%, transparent)",
      background: "color-mix(in oklab, var(--canvas) 94%, var(--accent) 6%)",
    },
  },
  scaffold: {
    label: "scaffold",
    register: "designed",
    meaning: "the property is authored, the encoding is not in tree",
    cell: {
      borderStyle: "dashed",
      borderColor: "color-mix(in oklab, var(--muted) 55%, transparent)",
      background: "var(--canvas)",
    },
  },
};

type Suite = { name: string; cases: number; cite: string };

/* Column regime, carried on the header so every number below inherits it:
   KUNIT_CASE entries in tree at eef103d, executed count unasserted by any job. */
const SUITES: Suite[] = [
  { name: "coconut_agent", cases: 22, cite: "kernel/agent/agent_kunit.c:621-650" },
  { name: "coconut_cap_token", cases: 20, cite: "kernel/agent/cap_token_kunit.c:994-1014" },
  { name: "coconut_lsm", cases: 14, cite: "security/coconut/lsm_kunit.c:553-571" },
  { name: "coconut_net", cases: 23, cite: "security/coconut/net_kunit.c:796-820" },
  { name: "coconut_ptrace", cases: 5, cite: "security/coconut/ptrace_kunit.c:297-301" },
  { name: "coconut_bpf", cases: 3, cite: "security/coconut/bpf_kunit.c:210-212" },
];

const SUITE_TOTAL = 87;

type Qualifier = { head: string; body: string; cite: string };

const QUALIFIERS: Qualifier[] = [
  {
    head: "the asserted count is stale",
    body:
      "The gate spec demands the job report a positive `Ran N tests: passed: N` line, today N=42. 42 is coconut_agent plus coconut_cap_token. The four security/coconut suites add 45 more.",
    cite: "Documentation/coconut/cap-conformance-invariants.md:666-670",
  },
  {
    head: "and nothing reads it",
    body:
      "No CI job greps the KTAP summary. kunit-coconut is a bare `kunit.py run --arch=x86_64` inside an `if [ -f kernel/agent/.kunitconfig ]` guard whose else branch echoes a warning and passes.",
    cite: ".gitlab-ci.yml:250-256",
  },
  {
    head: "and one suite may not build at all",
    body:
      "kernel/agent/.kunitconfig is 6 CONFIG lines and sets no CONFIG_NET, while SECURITY_COCONUT selects SECURITY_NETWORK. Whether the 23 coconut_net cases build under the gate config is not determinable from the tree. If they do not, nothing would notice.",
    cite: "kernel/agent/.kunitconfig:1-14 · security/coconut/Kconfig:3-7",
  },
];

type CiJob = {
  job: string;
  stage: string;
  red: "yes" | "no" | "partly";
  proves: string;
};

const CI_LADDER: CiJob[] = [
  {
    job: "build:gcc-x86_64",
    stage: "build",
    red: "yes",
    proves:
      "`make coconut_defconfig` then a full build plus modules. Reproducibility env pinned. Uploads bzImage.",
  },
  {
    job: "build:clang-x86_64",
    stage: "build",
    red: "partly",
    proves:
      "Never on a push or an MR. Runs unguarded on the weekly schedule, where it can turn the pipeline red. allow_failure: true covers the manual web trigger only. No artifacts.",
  },
  {
    job: "kunit-coconut",
    stage: "test",
    red: "yes",
    proves:
      "QEMU x86_64, never UML. UML under Docker seccomp emits zero KTAP and is red. No count assertion.",
  },
  {
    job: "kunit-upstream-allTests",
    stage: "test",
    red: "no",
    proves: "Manual only. allow_failure: true.",
  },
  {
    job: "selftest-agent",
    stage: "test",
    red: "yes",
    proves:
      "Compile plus link plus execute, and a per-field offsetof ABI cross-check that fails to build on drift.",
  },
  {
    job: "roundtrip-qemu",
    stage: "test",
    red: "yes",
    proves:
      "The one hard end to end gate. Boots the coconut bzImage with a hand-rolled initramfs and requires `^coconut-selftest: PASS` or exits 1. Scores a SKIP as a FAIL. No soft-pass.",
  },
  {
    job: "boot-smoke",
    stage: "smoke",
    red: "no",
    proves:
      "Both branches of its `coconut` grep are bare echoes and the qemu call ends in `|| true`.",
  },
  {
    job: "lsm-coverage",
    stage: "coverage",
    red: "partly",
    proves:
      "Layer 1a is real. Layer 1b greps the whole file once. Layer 2 inverted into a silent pass the moment LSM_HOOK_INIT appeared in security/coconut.",
  },
  {
    job: "iso:build-x86_64",
    stage: "release",
    red: "yes",
    proves: "Manual trigger only. Fedora 41 image. allow_failure deliberately not set.",
  },
];

const RED_TONE: Record<CiJob["red"], string> = {
  yes: "var(--accent)",
  no: "var(--muted)",
  partly: "var(--highlight)",
};

/* -------------------------------------------------------------- component */

export function InvariantRoster() {
  return (
    <div className="space-y-10">
      <figure>
        <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-5 sm:p-7">
          {/* header */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
              conformance invariants
            </span>
            <RegisterMark state="built" />
            <Cite source="17 registered, all tagged GATE-BLOCKING · Documentation/coconut/cap-conformance-invariants.md:72, :601" />
          </div>

          {/* legend: the inner mark, learned once, and what it maps to */}
          <dl className="mt-5 border-t hairline pt-4 space-y-2">
            {(Object.keys(EVIDENCE) as Evidence[]).map((k) => {
              const e = EVIDENCE[k];
              const count = INVARIANTS.filter((i) => i.evidence === k).length;
              return (
                <div
                  key={k}
                  className="grid grid-cols-[88px_1fr] sm:grid-cols-[92px_26px_92px_1fr] gap-x-3 gap-y-1 items-center"
                >
                  <dt className="flex items-center gap-2">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-[2px] border shrink-0"
                      style={e.cell}
                      aria-hidden
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--fg)]/85">
                      {e.label}
                    </span>
                  </dt>
                  <dd className="font-mono text-[11px] text-[color:var(--muted)] tabular-nums hidden sm:block">
                    {count}
                  </dd>
                  <dd className="hidden sm:block">
                    <RegisterMark state={e.register} />
                  </dd>
                  <dd className="col-span-1 font-mono text-[11px] text-[color:var(--muted)] leading-snug">
                    <span className="sm:hidden">{count} · </span>
                    {e.meaning}
                  </dd>
                </div>
              );
            })}
          </dl>

          {/* the roster */}
          <ol className="mt-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {INVARIANTS.map((inv) => {
              const e = EVIDENCE[inv.evidence];
              return (
                <li
                  key={inv.id}
                  className="relative min-w-0 rounded-[2px] border p-2 sm:p-2.5"
                  style={e.cell}
                >
                  {inv.noMechanism && (
                    <>
                      <span
                        className="absolute top-0 right-0 w-4 h-px"
                        style={{ background: "var(--warning)" }}
                        aria-hidden
                      />
                      <span
                        className="absolute top-0 right-0 w-px h-4"
                        style={{ background: "var(--warning)" }}
                        aria-hidden
                      />
                    </>
                  )}
                  <div className="font-mono text-[10px] tracking-tight text-[color:var(--fg)]/90 break-words">
                    {inv.id}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                    {e.label}
                  </div>
                  <div className="mt-1.5 font-mono text-[10.5px] leading-snug text-[color:var(--fg)]/80 break-words">
                    {inv.property}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-snug text-[color:var(--muted)] break-words">
                    {inv.encoding}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-[color:var(--muted)]">{inv.doc}</div>
                  {inv.noMechanism && (
                    <div
                      className="mt-1.5 font-mono text-[10px] leading-snug break-words"
                      style={{ color: "var(--warning)" }}
                    >
                      gate-blocking · zero mechanism
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-3">
            <Cite source="a bare :line cite is into Documentation/coconut/cap-conformance-invariants.md, 863 lines · a :line after a named path belongs to that path" />
          </div>

          {/* the drift, on the 05 and 11 pair */}
          <Drift
            saysLabel="counts block"
            doesLabel="evidence lines"
            says=":581-602 tallies 13 PROVEN and 4 SCAFFOLD, listing 03, 05, 10, 11."
            does={
              <>
                :239-243 reads &quot;PROVEN (arm a) ; SCAFFOLD (arm b)&quot; and :401-403 reads &quot;PROVEN
                (LSM-defer arm) ; SCAFFOLD (layout-additivity arm)&quot;. The honest tally is 13 proven, 2 split, 2
                scaffold. The file disagrees with itself, so this figure counts the per-invariant lines.
              </>
            }
          />

          {/* suite counts, below the roster so the grid keeps full width */}
          <div className="mt-8 border-t hairline pt-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                KUNIT_CASE entries in tree at eef103d · executed count unasserted by any job
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {SUITES.map((s) => (
                <div
                  key={s.name}
                  className="grid grid-cols-[1fr_auto] gap-x-3 items-baseline py-1.5 border-b hairline"
                >
                  <dt className="min-w-0">
                    <span className="font-mono text-[12px] text-[color:var(--fg)]/85 break-words">{s.name}</span>
                    <span className="block font-mono text-[10.5px] text-[color:var(--muted)] break-words">
                      {s.cite}
                    </span>
                  </dt>
                  <dd className="font-mono text-[13px] tabular-nums text-[color:var(--accent)]">{s.cases}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_auto] gap-x-3 items-baseline py-1.5 sm:col-span-2 mt-1">
                <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  total · KUNIT_CASE entries in tree at eef103d, executed count unasserted
                </dt>
                <dd className="font-mono text-[13px] tabular-nums text-[color:var(--fg)]">{SUITE_TOTAL}</dd>
              </div>
            </dl>

            {/* qualifiers, not footnotes */}
            <ol className="mt-4 space-y-3">
              {QUALIFIERS.map((q, i) => (
                <li
                  key={q.head}
                  className="grid grid-cols-[22px_1fr] gap-x-3 items-start"
                >
                  <span className="font-mono text-[10px] text-[color:var(--muted)] pt-0.5 tabular-nums" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono text-[11.5px] text-[color:var(--fg)]/85">{q.head}</div>
                    <p className="mt-1 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75 break-words">
                      {q.body}
                    </p>
                    <div className="mt-1">
                      <Cite source={q.cite} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* the gate that does not block */}
          <div
            className="mt-8 rounded-[2px] border p-4 sm:p-5"
            style={{
              borderStyle: "dotted",
              borderColor: "color-mix(in oklab, var(--highlight) 55%, transparent)",
              background: "var(--canvas)",
            }}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <RegisterMark state="must-be" />
              <span className="font-mono text-[11px] text-[color:var(--fg)]/85">
                the gate blocks on CAP-INV-03 the day someone writes its runner
              </span>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">
              CAP-INV-03 is tagged GATE-BLOCKING like the other sixteen. Its only named encoding is
              tools/testing/selftests/coconut/cap_revoke_present_interleave.c, which is not in the tree, and
              confirmation is routed to KCSAN. There is no KCSAN, KASAN or lockdep job anywhere in
              .gitlab-ci.yml. So a green pipeline today says nothing about revoke and present racing. The doc&apos;s
              own &quot;BLOCKED until 476/477 are wired&quot; rationale is stale. Both are wired at
              arch/x86/entry/syscalls/syscall_64.tbl:405-406.
            </p>
            <div className="mt-2">
              <Cite source="gate: tagged GATE-BLOCKING · Documentation/coconut/cap-conformance-invariants.md:601, :141-167, :623-628" />
            </div>
          </div>

          {/* the doc's own epistemics */}
          <div className="mt-4 rounded-[2px] border hairline p-4 sm:p-5 bg-[color:var(--canvas)]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <RegisterMark state="designed" />
              <span className="font-mono text-[11px] text-[color:var(--fg)]/85">what a green run is worth</span>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">
              The doc says it at line 3, so I will not soften it here. &quot;Green = the 17 registered invariants
              held, NOT proof the system is secure. It says nothing about the property nobody authored, the
              entry path nobody enumerated, or the race nobody scheduled under KCSAN.&quot; Seven such items are
              named in the file and routed to a person or a tool rather than closed. I reconciled the author
              pass and the adversary pass into one roster instead of four verdicts because the binding
              constraint is human review bandwidth.
            </p>
            <div className="mt-2">
              <Cite source="Documentation/coconut/cap-conformance-invariants.md:3-17, :608-661" />
            </div>
          </div>
        </div>

        <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight leading-snug">
          Read at origin/main eef103d from Documentation/coconut/cap-conformance-invariants.md,
          .gitlab-ci.yml, kernel/agent/, security/coconut/, arch/x86/entry/syscalls/syscall_64.tbl and
          tools/testing/selftests/coconut/Makefile. Every count here is a KUNIT_CASE entry in the tree.
          None of them is an executed test.
        </figcaption>
      </figure>

      {/* Companion table, not a figure. The interesting column is negative. */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            the CI ladder
          </span>
          <RegisterMark state="built" />
          <Cite source=".gitlab-ci.yml:55-60 · 5 stages: build, test, smoke, coverage, release" />
        </div>

        <div className="mt-4 overflow-x-auto rounded-[2px] border hairline">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              CI jobs at origin/main eef103d, their stage, whether the job can fail a pipeline that
              workflow:rules created, and what the job actually proves.
            </caption>
            <thead>
              <tr className="border-b hairline">
                <th
                  scope="col"
                  className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                >
                  job
                </th>
                <th
                  scope="col"
                  className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                >
                  stage
                </th>
                <th
                  scope="col"
                  className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                >
                  can it go red, given a pipeline
                </th>
                <th
                  scope="col"
                  className="p-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--muted)]"
                >
                  what it actually proves
                </th>
              </tr>
            </thead>
            <tbody>
              {CI_LADDER.map((j) => (
                <tr key={j.job} className="border-b hairline last:border-b-0 align-top">
                  <th
                    scope="row"
                    className="p-3 font-mono text-[11.5px] font-normal text-[color:var(--fg)]/85 whitespace-nowrap"
                  >
                    {j.job}
                  </th>
                  <td className="p-3 font-mono text-[11px] text-[color:var(--muted)]">{j.stage}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-[2px] border"
                        style={{
                          borderColor: RED_TONE[j.red],
                          borderStyle: j.red === "yes" ? "solid" : j.red === "partly" ? "dashed" : "dotted",
                          background:
                            j.red === "yes" ? "color-mix(in oklab, var(--accent) 45%, transparent)" : "transparent",
                        }}
                        aria-hidden
                      />
                      <span className="font-mono text-[11px]" style={{ color: RED_TONE[j.red] }}>
                        {j.red}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">{j.proves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
          Every row is downstream of workflow:rules at .gitlab-ci.yml:101-117. A [skip ci] or [ci skip] commit
          message creates no pipeline at all (:103-105), and a push to main that touches no kernel path falls
          past rule 5 (:113-114) to the default never at :117. build:gcc-x86_64 (:143-146), kunit-coconut
          (:226-229), selftest-agent (:314-317), boot-smoke (:364-367), roundtrip-qemu (:438-441) and
          lsm-coverage (:556-559) additionally carry schedule then when: never, so none of them runs on
          the weekly scheduled pipeline. build:clang-x86_64 (:173-178) is the only job that runs there
          without a manual trigger.
        </p>

        <ul className="mt-4 space-y-2">
          <li className="font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
            Roughly 62 min of runner time per push against a 400 min per month GitLab.com free tier.{" "}
            <Cite source=".gitlab-ci.yml:30-32" />
          </li>
          <li className="font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
            Only 2 of the 8 kselftests are referenced by any CI job. agent_spawn_test and agent_attest_test.
            The other six are compiled by nothing and run by nothing.{" "}
            <Cite source=".gitlab-ci.yml:339-343 · tools/testing/selftests/coconut/Makefile:38" />
          </li>
          <li className="font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
            Every agent-bound kselftest case is a permanent SKIP. No v1 path fans a published cap_set onto a
            live task&apos;s cred, so CAP-INV-05&apos;s end to end wiring proof is a no-op in practice.{" "}
            <Cite source="Documentation/coconut/cap-conformance-invariants.md:223-224" />
          </li>
        </ul>
      </div>
    </div>
  );
}
