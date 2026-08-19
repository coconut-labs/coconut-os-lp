import { Reveal } from "./reveal";
import {
  KERNEL_COMMITS,
  MIRROR_COMMITS_URL,
  MIRROR_STATUS_URL,
  MIRROR_URL,
  PROGRESS_META,
  commitSpan,
  fact,
  factText,
  type KernelCommit,
} from "@/lib/kernel-progress";

/* Renders the kernel progress record from the committed snapshots in
   src/content/. Every number on this page comes out of those files. None is
   written into this component, so the section cannot drift from the tree. */

const RECENT_COUNT = 12;

const FACTS: { key: string; label: string; sub?: string }[] = [
  { key: "linux_base_version", label: "Fork base", sub: "Linux LTS" },
  {
    key: "syscall_table_entries_wired",
    label: "agent rows in the x86_64 syscall table",
  },
  {
    key: "syscalls_implemented",
    label: "Syscall handlers implemented",
    sub: `${factText("syscalls_stub")} still return -ENOSYS`,
  },
  { key: "lsm_hooks_registered", label: "LSM hooks registered" },
  {
    key: "conformance_invariants_registered",
    label: "Capability conformance invariants",
    sub: `${factText("conformance_invariants_proven")} proven, ${factText(
      "conformance_invariants_scaffold",
    )} scaffold`,
  },
  { key: "kunit_test_cases", label: "KUnit cases" },
];

function CommitRow({ c }: { c: KernelCommit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[92px_92px_1fr_190px_44px] gap-1.5 md:gap-6 px-5 sm:px-7 py-3.5 items-baseline">
      <div className="font-mono text-[11.5px] text-[color:var(--muted)] tracking-tight">
        {c.date}
      </div>
      <div className="font-mono text-[11.5px] text-[color:var(--accent)] tracking-tight">
        {c.sha.slice(0, 10)}
      </div>
      <div className="min-w-0 text-[14px] leading-[1.5] text-[color:var(--fg)]/85 break-words">
        {c.subject}
      </div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
        {c.areas.join(" · ")}
      </div>
      <div className="font-mono text-[11.5px] text-[color:var(--muted)] md:text-right tracking-tight">
        {c.coconut_files_touched === null ? (
          <span aria-label="not counted for a merge commit">·</span>
        ) : (
          c.coconut_files_touched
        )}
      </div>
    </div>
  );
}

export function Progress() {
  const span = commitSpan();
  const recent = KERNEL_COMMITS.slice(0, RECENT_COUNT);
  const rest = KERNEL_COMMITS.slice(RECENT_COUNT);

  const totals = [
    { n: PROGRESS_META.total_commits, label: "Commits on the kernel" },
    { n: PROGRESS_META.non_merge_commits, label: "Written directly" },
    { n: PROGRESS_META.merge_commits, label: "Branch merges" },
  ];

  return (
    <section id="progress" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            Progress
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[46rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            The kernel source is private. The record of the work is not.{" "}
            <span className="text-[color:var(--muted)]">
              Here is what has landed, generated from the tree.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 max-w-[42rem] space-y-4 text-[15px] leading-[1.62] text-[color:var(--fg)]/85">
            <p>
              The fork stays closed through Gate 1. That is a decision, not a
              stall. What does not need to stay closed is the evidence that work
              is happening, so the commit record and the numbers below are
              public.
            </p>
            <p>
              Every figure here is read out of the private repository by a
              script. It parses the syscall table, the handler file, the LSM
              hook registrations, the conformance document and the kernel
              Makefile, and it writes the result to a public mirror on GitLab.
              Nothing is entered by hand. Run the script against the same commit
              and you get the same numbers. If a value cannot be read out of its
              source file, it is published as absent rather than estimated.
            </p>
            <p>
              What the mirror does not carry is source. No diffs, no patches, no
              file names. Commit subject lines and counts, and nothing past
              that.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            Generated from coconutos-kernel at {PROGRESS_META.ref_sha} on{" "}
            {PROGRESS_META.generated_on}
            {span ? ` · commits span ${span.first} to ${span.last}` : ""}
          </p>
        </Reveal>

        {/* Totals */}
        <Reveal delay={0.2}>
          <div
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px rounded-[2px] overflow-hidden"
            style={{ background: "var(--rule)" }}
          >
            {totals.map((t) => (
              <div key={t.label} className="bg-[color:var(--canvas)] p-6">
                <div className="font-mono text-[30px] leading-none tracking-[-0.03em] text-[color:var(--fg)]">
                  {t.n}
                </div>
                <div className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Derived facts */}
        <Reveal delay={0.25}>
          <h3 className="mt-16 text-[20px] sm:text-[22px] tracking-tight">
            Read out of source, not asserted
          </h3>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-3 max-w-[40rem] text-[14.5px] leading-[1.6] text-[color:var(--fg)]/85">
            Each figure names the file it was derived from. Open any one to see
            it in the mirror.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FACTS.map((f, i) => {
            const { source } = fact(f.key);
            const text = factText(f.key);
            return (
              <Reveal key={f.key} delay={i * 0.04} amount={0.2}>
                <a
                  href={MIRROR_STATUS_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${f.label}: ${text}, derived from ${source}. Opens status.json in the public progress mirror.`}
                  className="group block h-full p-6 rounded-[2px] border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
                >
                  <div className="font-mono text-[27px] leading-none tracking-[-0.03em] text-[color:var(--fg)]">
                    {text}
                  </div>
                  <div className="mt-3 text-[13.5px] leading-[1.45] text-[color:var(--fg)]/85">
                    {f.label}
                  </div>
                  {f.sub ? (
                    <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                      {f.sub}
                    </div>
                  ) : null}
                  <div className="mt-4 pt-3 border-t hairline font-mono text-[10.5px] text-[color:var(--muted)] break-words">
                    {source}
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        {/* Commits */}
        <Reveal delay={0.2}>
          <h3 className="mt-16 text-[20px] sm:text-[22px] tracking-tight">
            The commits
          </h3>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mt-3 max-w-[42rem] text-[14.5px] leading-[1.6] text-[color:var(--fg)]/85">
            The {RECENT_COUNT} most recent, then the rest on request. Subject
            lines are reproduced exactly as they were written. The last column
            counts how many files in the Coconut subsystems the commit touched,
            and is blank for a merge because a merge reports none of its own.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 rounded-[2px] border hairline overflow-hidden">
            <div className="hidden md:grid grid-cols-[92px_92px_1fr_190px_44px] gap-6 px-7 py-3 border-b hairline font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)] bg-[color:var(--sunk)]">
              <div>Date</div>
              <div>Commit</div>
              <div>Subject</div>
              <div>Area</div>
              <div className="text-right">Files</div>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--hair)" }}>
              {recent.map((c) => (
                <CommitRow key={c.sha} c={c} />
              ))}
            </div>
            {rest.length > 0 ? (
              <details className="border-t hairline">
                <summary className="px-5 sm:px-7 py-3.5 cursor-pointer font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-200">
                  Show the earlier {rest.length}
                </summary>
                <div className="divide-y border-t hairline" style={{ borderColor: "var(--hair)" }}>
                  {rest.map((c) => (
                    <CommitRow key={c.sha} c={c} />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            Paths counted: {PROGRESS_META.paths.join(" · ")} · commits on or
            after {PROGRESS_META.since} · upstream Linux history is not counted
          </p>
        </Reveal>

        {/* The mirror */}
        <Reveal delay={0.2}>
          <div
            className="mt-14 p-7 sm:p-9 rounded-[2px] border"
            style={{
              borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
              background: "color-mix(in oklab, var(--canvas) 80%, var(--accent) 6%)",
            }}
          >
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--accent)]">
                  The mirror
                </div>
                <h3 className="mt-2 text-[20px] sm:text-[22px] tracking-tight text-[color:var(--fg)]">
                  Check it there, not here.
                </h3>
                <p className="mt-3 max-w-[36rem] text-[14.5px] leading-[1.6] text-[color:var(--fg)]/85">
                  This page renders a snapshot. The mirror holds the generated
                  files themselves, with the commit sha they came from. It is
                  metadata only and carries no kernel source. GitLab is where
                  Coconut OS work lives.
                </p>
                <p className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
                  <a
                    className="hover:text-[color:var(--fg)] transition-colors duration-200 underline underline-offset-4 decoration-[color:var(--rule)]"
                    href={MIRROR_STATUS_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    status.json
                  </a>
                  {" · "}
                  <a
                    className="hover:text-[color:var(--fg)] transition-colors duration-200 underline underline-offset-4 decoration-[color:var(--rule)]"
                    href={MIRROR_COMMITS_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    commits.json
                  </a>
                </p>
              </div>
              <a
                href={MIRROR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-11 px-[18px] rounded-[2px] bg-[color:var(--fg)] text-[color:var(--canvas)] font-mono text-[11.5px] uppercase tracking-[0.1em] hover:opacity-90 transition-opacity duration-300"
              >
                Open the mirror <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
