/* Lock discipline on struct agent, and the RCU clone-mutate-publish sequence
   that lands a cap grant. Every row is BUILT: read from the tree at
   origin/main eef103d. A bare line number is kernel/agent/syscalls.c and a
   bare .c or .h name is kernel/agent/ too; anything outside kernel/agent/
   carries its full path. Static figure, no state, no animation.

   The mark, the cite and the drift annotation come from the shared register
   primitive, so this figure speaks the same vocabulary as every other claim
   on the page. */

import { Cite, Drift, RegisterMark } from "@/components/register";

type Tier = {
  decl: string;
  role: string;
  body: string;
  cite: string;
};

/* Panel A. Three declarations on struct agent: two locks and the object
   they protect. agent.h:132, :153-160, :136-151. */
const TIERS: Tier[] = [
  {
    decl: "spinlock_t state_lock",
    role: "lifecycle + quota",
    body:
      "Serializes every lifecycle transition and the four quota u64 writes. Check and act are folded into one critical section. No allocation, no observer call, no audit emit runs inside it.",
    cite: "kernel/agent/agent.h:132 · :213-219 · lifecycle.c:145-187 · syscalls.c:644-653",
  },
  {
    decl: "struct mutex cap_mutex",
    role: "cap-set publish",
    body:
      "Serializes cap-set clone and publish. It is sleepable because coconut_caps_clone allocates GFP_KERNEL. That allocation is the whole reason this is a mutex and not a spinlock.",
    cite: "kernel/agent/agent.h:153-160 · STORY-K-2.6 named at :154",
  },
  {
    decl: "struct coconut_caps __rcu *cap_set",
    role: "the published object",
    body:
      "Read with rcu_dereference, written with rcu_assign_pointer under cap_mutex. NULL until the first grant, per CAP-INV-13. A published set is never edited in place. Every mutation clones, mutates the clone, then publishes.",
    cite: "kernel/agent/agent.h:136-151 · syscalls.c:835",
  },
];

type Step = {
  n: string;
  op: string;
  note?: string;
  errno?: string;
  cite: string;
  held: boolean;
  denies: boolean;
};

/* Panel B. The grant path, __cap_grant_core, kernel/agent/syscalls.c:735-853. */
const PUBLISH: Step[] = [
  {
    n: "01",
    op: "now = ktime_get_real_ns()",
    note: "outside the lock. realtime, matching the token expires_ns domain",
    cite: ":746",
    held: false,
    denies: false,
  },
  {
    n: "02",
    op: "mutex_lock(&agent->cap_mutex)",
    cite: ":798",
    held: true,
    denies: false,
  },
  {
    n: "03",
    op: "oldcaps = rcu_dereference_protected(agent->cap_set, lockdep_is_held(&agent->cap_mutex))",
    note: "NULL on a freshly spawned agent, which is why step 04 is conditional on oldcaps",
    cite: ":799-800",
    held: true,
    denies: false,
  },
  {
    n: "04",
    op: "cap_nonce_is_revoked(oldcaps, tok->nonce, now)",
    errno: "-EKEYREVOKED",
    note: "replay check. skipped entirely when oldcaps is NULL",
    cite: ":803-805",
    held: true,
    denies: true,
  },
  {
    n: "05",
    op: "coconut_caps_clone(oldcaps, GFP_KERNEL) NULL",
    errno: "-ENOMEM",
    note: "the sleeping allocation. the clone, not the live set, is what gets mutated",
    cite: ":808-811",
    held: true,
    denies: true,
  },
  {
    n: "06",
    op: "cap_set_grant(...) with ++newcaps->grant_seq",
    errno: "-E2BIG / -ENOMEM / -EINVAL",
    note: "a cap is never half-installed. the ledger kzalloc failure rolls back slow_count and the bitmap bit",
    cite: ":815-821 · caps.c:306-373",
    held: true,
    denies: true,
  },
  {
    n: "07",
    op: "cap_nonce_mark_revoked(...)",
    errno: "-ENOMEM",
    note: "fail closed. the clone is dropped and nothing is published",
    cite: ":828-833",
    held: true,
    denies: true,
  },
  {
    n: "08",
    op: "rcu_assign_pointer(agent->cap_set, newcaps)",
    note: "the publish. one store, one release barrier, readers see old or new and never a mix",
    cite: ":835",
    held: true,
    denies: false,
  },
  {
    n: "09",
    op: "mutex_unlock(&agent->cap_mutex)",
    cite: ":836",
    held: true,
    denies: false,
  },
  {
    n: "10",
    op: "coconut_caps_put(oldcaps)",
    note: "last put does call_rcu(&caps->rcu, coconut_caps_free_rcu), so the old set outlives readers in flight",
    cite: ":837 · coconut_caps.c:116-123",
    held: false,
    denies: false,
  },
];

type Note = { label: string; body: string; cite: string };

/* Panel C. Three facts that belong with the locks. NOTES.length is 3 and the
   visible label counts the same array. */
const NOTES: Note[] = [
  {
    label: "layout guard",
    body:
      "static_assert(offsetof(struct coconut_caps, rcu) + sizeof(struct rcu_head) == sizeof(struct coconut_caps)). Sound here, unlike the retracted assertion on struct cred, because struct coconut_caps is not __randomize_layout. The doc labels it a defensive layout guard rather than free-path correctness. The container_of math is right whatever position rcu holds.",
    cite: "kernel/agent/coconut_caps.c:44-55 · CAP-INV-12",
  },
  {
    label: "the one side effect",
    body:
      "TERMINATED is the only transition that does anything outside its own state write. It kicks the per-agent reaper work item after spin_unlock and relies on queue_work() for the barrier. Nothing else in the state machine touches a lock it does not own.",
    cite: "kernel/agent/lifecycle.c:202-203",
  },
  {
    label: "revoke uses the same three primitives",
    body:
      "Revoke is not a second discipline. It clones, mutates the clone, and republishes under the same cap_mutex. A real revoke discards the removed count and returns 0 regardless.",
    cite: "syscalls.c:1043 · :1053 · :1078 · :1085-1086",
  },
];

const HELD_BORDER = "color-mix(in oklab, var(--accent) 40%, transparent)";
const CARD_BG = "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)";
const CARD_BORDER = "color-mix(in oklab, var(--fg) 12%, transparent)";

export function CapSetLocking() {
  const firstHeld = PUBLISH.findIndex((s) => s.held);
  /* the unlock step itself is the release boundary, so the label sits under it */
  const releaseAt = PUBLISH.findIndex((s) => s.op.startsWith("mutex_unlock"));

  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">

        {/* Panel A · the three declarations. TIERS.length is 3. */}
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <RegisterMark state="built" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            panel a · three declarations on struct agent
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {TIERS.map((t) => (
            <div
              key={t.decl}
              className="min-w-0 rounded-[2px] border p-3 sm:p-3.5"
              style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            >
              <dt className="min-w-0">
                <span className="block font-mono text-[12px] tracking-tight break-words" style={{ color: "var(--accent)" }}>
                  {t.decl}
                </span>
                <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  {t.role}
                </span>
              </dt>
              <dd className="mt-2 text-[13px] leading-[1.5] text-[color:var(--fg)]/80">{t.body}</dd>
              <dd className="mt-2">
                <Cite source={t.cite} />
              </dd>
            </div>
          ))}
        </dl>

        {/* Panel B · the publish sequence */}
        <div className="mt-8 pt-6 border-t hairline flex items-baseline gap-2.5 flex-wrap">
          <RegisterMark state="built" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            panel b · clone, mutate, publish · syscall 475 grant
          </span>
        </div>

        <ol className="mt-4 space-y-1.5">
          {PUBLISH.map((s, i) => (
            <li key={s.n} className="min-w-0">
              {i === firstHeld && (
                <div className="flex items-center gap-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--accent)" }}>
                  <span className="w-3 h-px shrink-0" style={{ background: HELD_BORDER }} aria-hidden />
                  cap_mutex held
                  <span className="flex-1 h-px" style={{ background: "color-mix(in oklab, var(--fg) 8%, transparent)" }} aria-hidden />
                </div>
              )}
              <div
                className="min-w-0 rounded-[2px] border p-3"
                style={{
                  background: CARD_BG,
                  borderColor: CARD_BORDER,
                  borderLeft: s.held ? `2px solid ${HELD_BORDER}` : `1px solid ${CARD_BORDER}`,
                }}
              >
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--muted)] shrink-0">{s.n}</span>
                  <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]/90 break-words min-w-0">{s.op}</span>
                  {s.errno && (
                    <span
                      className="inline-block rounded-[2px] font-mono text-[11px] px-1.5 py-0.5 shrink-0"
                      style={{
                        border: "1px solid color-mix(in oklab, var(--highlight) 40%, transparent)",
                        color: "var(--highlight)",
                      }}
                    >
                      {s.errno}
                    </span>
                  )}
                </div>
                {s.note && (
                  <div className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/70 break-words">{s.note}</div>
                )}
                <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                  <Cite source={s.cite} />
                  {s.denies && (
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--accent)" }}>
                      goto unlock_deny
                    </span>
                  )}
                </div>
              </div>
              {i === releaseAt && (
                <div className="flex items-center gap-2 pt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
                  <span className="w-3 h-px shrink-0" style={{ background: "color-mix(in oklab, var(--fg) 20%, transparent)" }} aria-hidden />
                  released
                  <span className="flex-1 h-px" style={{ background: "color-mix(in oklab, var(--fg) 8%, transparent)" }} aria-hidden />
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* the deny funnel */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="min-w-0 p-3 rounded-[2px]"
            style={{
              background: "color-mix(in oklab, var(--accent) 10%, var(--canvas))",
              border: "1px solid color-mix(in oklab, var(--accent) 38%, transparent)",
            }}
          >
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--accent)" }}>
              the funnel
            </div>
            <div className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/85 break-words">
              04 05 06 07 all jump to one label. unlock_deny: unlocks and emits exactly one AE_CAP_DENIED. Zero would be audit blindness. Two would be a non-canonical chain. That is CAP-INV-04.
            </div>
            <div className="mt-1.5">
              <Cite source=":843-852 · CAP-INV-04" />
            </div>
          </div>
          <div
            className="min-w-0 p-3 rounded-[2px]"
            style={{
              background: "color-mix(in oklab, var(--success) 10%, var(--canvas))",
              border: "1px solid color-mix(in oklab, var(--success) 35%, transparent)",
            }}
          >
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--success)" }}>
              the success exit
            </div>
            <div className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/85 break-words">
              AE_CAP_GRANTED is emitted after the unlock and the put, then return 0. The emit itself is an atomic64_inc into coconut_cap_audit_counts, an optional KUnit test sink, and a pr_debug. Nothing is persisted anywhere.
            </div>
            <div className="mt-1.5">
              <Cite source=":839-841 · kernel/agent/caps.c:60-97" />
            </div>
          </div>
        </div>

        {/* drift on step 04. the step reference sits above the block because the
            shared annotation carries its own label and no slot for a qualifier. */}
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
            step 04
          </div>
          <Drift
            className="mt-1.5"
            docSays="Documentation/coconut/cap-conformance-invariants.md:61-70 says no landed errno exists for replay, refuses to freeze -EKEYREVOKED because it reads it off an LLD line that is not in this tree, and tells every negative test to assert on -EACCES, -ESTALE and -EBADF only"
            codeDoes="syscalls.c:49-51 registers -EKEYREVOKED in the landed ABI block, and :804 sets it on a reused nonce for the unlock_deny funnel at :843-852 to return. The doc's own pointer at cap-conformance-invariants.md:51 names syscalls.c:32-38, which is the cross-reference list. The errno table it means sits at syscalls.c:39-56, seven lines further down. The replay KUnit case distinguishes replay from expiry by test setup, not by errno, so the contract and the code can drift apart without a red run"
          />
          <div className="mt-1.5 pl-3 sm:pl-4">
            <Cite source="syscalls.c:32-38 · :39-56 · :49-51 · :804 · :843-852 · Documentation/coconut/cap-conformance-invariants.md:51 · :61-70" />
          </div>
        </div>

        {/* Panel C */}
        <div className="mt-8 pt-6 border-t hairline flex items-baseline gap-2.5 flex-wrap">
          <RegisterMark state="built" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            panel c · three facts that live with the locks
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {NOTES.map((n) => (
            <div
              key={n.label}
              className="min-w-0 rounded-[2px] border p-3 sm:p-3.5"
              style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">{n.label}</dt>
              <dd className="mt-1.5 text-[13px] leading-[1.5] text-[color:var(--fg)]/80">{n.body}</dd>
              <dd className="mt-2">
                <Cite source={n.cite} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] leading-[1.6] text-[color:var(--muted)] tracking-tight">
        every row read from the tree at origin/main eef103d. a bare line number is kernel/agent/syscalls.c. a bare .c or .h name is
        kernel/agent/ as well. anything outside kernel/agent/ carries its path from the repo root.
        limits: the ordering is read from source, not observed. no lockdep, KCSAN, KASAN or syzkaller job exists in .gitlab-ci.yml,
        and the 100-thread state_lock stress case promised at lifecycle.c:324-332 is not in the tree. every KUnit helper that drives
        an agent to TERMINATED holds an extra refcount across the reaper kick so the reaper sees refs above one and does not free,
        per agent_kunit.c:77-79 and :121-127, which leaves the 1-to-0 arm of coconut_agent_reaper_fn at agent.c:74-121 unexercised.
        CAP-INV-03, the one invariant that would cover a half-applied revoke racing a present, is SCAFFOLD, and the property test it
        names at tools/testing/selftests/coconut/cap_revoke_present_interleave.c is not in the tree.
      </figcaption>
    </figure>
  );
}
