/* The two disjoint cap_set stores. Grant publishes into agent->cap_set.
   Every enforcement reader reads cred->cap_set. Nothing in the tree copies
   one into the other, so the loop from grant to enforcement is open and the
   capability LSM is inert at runtime.

   Every BUILT row is read from the tree at origin/main eef103d and cites
   path:line. Panel C is a genuine open question, not a plan: the tree does
   not name the bridge. Static figure, no state, no animation. */

import { RegisterMark, Cite, Drift } from "@/components/register";

const CARD_BG = "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)";
const CARD_BORDER = "color-mix(in oklab, var(--fg) 12%, transparent)";
const GAP_EDGE = "color-mix(in oklab, var(--highlight) 55%, transparent)";
const WARN_BG = "color-mix(in oklab, var(--warning) 8%, var(--canvas))";
const WARN_BORDER = "color-mix(in oklab, var(--warning) 32%, transparent)";

const LEDE =
  "Grant writes one object. Enforcement reads another. No code path in the tree copies " +
  "the first into the second, so a granted capability reaches zero decision points and a " +
  "revoked one withdraws from zero decision points.";

type Line = {
  text: string;
  cite: string;
  /** rendered in warning tone under the line. the finding, not decoration. */
  note?: string;
};

type Block = {
  label: string;
  lines: Line[];
};

type Store = {
  key: string;
  name: string;
  decl: string;
  declCite: string;
  blocks: Block[];
};

/* Left store: the canonical per-agent set. kernel/agent/agent.h:151,
   kernel/agent/syscalls.c:835 and :1078. */
const AGENT_STORE: Store = {
  key: "agent",
  name: "agent->cap_set",
  decl: "struct coconut_caps __rcu *cap_set;",
  declCite: "kernel/agent/agent.h:151",
  blocks: [
    {
      label: "written by",
      lines: [
        {
          text: "agent_cap_grant (475) · rcu_assign_pointer(agent->cap_set, newcaps) under agent->cap_mutex, after clone and mutate",
          cite: "kernel/agent/syscalls.c:835",
        },
        {
          text: "agent_cap_revoke (476) · same publish, same lock, on a clone with the grants removed",
          cite: "kernel/agent/syscalls.c:1078",
        },
      ],
    },
    {
      label: "read by",
      lines: [
        {
          text: "Nothing outside those two syscalls. No LSM hook file names agent->cap_set or coconut_agent_find_get at all.",
          cite: "security/coconut/enforce.c · net.c · bpf.c · ptrace.c, zero references",
          note: "the canonical cap store is write-only with respect to enforcement",
        },
      ],
    },
  ],
};

/* Right store: the field the enforcement path actually consults.
   include/linux/cred.h:182, kernel/cred.c:286-295 and :737. */
const CRED_STORE: Store = {
  key: "cred",
  name: "cred->cap_set",
  decl: "struct coconut_caps *cap_set;",
  declCite: "include/linux/cred.h:182",
  blocks: [
    {
      label: "read by",
      lines: [
        {
          text: "All 10 registered LSM hooks, counted off the four LSM_HOOK_INIT tables · READ_ONCE(current_cred()->cap_set) under rcu_read_lock, then defer with 0 when it is NULL",
          cite:
            "tables at security/coconut/enforce.c:296-301 · security/coconut/net.c:395-397 · security/coconut/ptrace.c:143 · security/coconut/bpf.c:122 · reads at security/coconut/enforce.c:143 in 136-153 · security/coconut/net.c:287 in 286-291 · :336 in 335-340 · :372 in 371-376 · security/coconut/ptrace.c:110 in 109-114",
        },
        {
          text: "agent_cap_present (477) · __cap_present_core(current_cred()->cap_set, ...)",
          cite: "kernel/agent/syscalls.c:1243",
        },
        {
          text: "The grant and revoke authority gates, which read the caller's own set as grantor_caps and revoker_caps",
          cite: "kernel/agent/syscalls.c:914 · :1110",
        },
      ],
    },
    {
      label: "written by",
      lines: [
        {
          text: "new->cap_set = NULL · clone failure, fail closed",
          cite: "kernel/cred.c:291",
        },
        {
          text: "new->cap_set = copy · the fork deep copy of the parent's set",
          cite: "kernel/cred.c:294",
          note: "dead. reached only when the if (new->cap_set) guard at kernel/cred.c:286 is true, and no path ever makes it true",
        },
        {
          text: "new->cap_set = NULL · prepare_kernel_cred",
          cite: "kernel/cred.c:737",
        },
      ],
    },
  ],
};

const GAP_LABEL = ["no bridge", "in tree"];

const GAP_CITE = "v1.0 · EPIC-K-8 · kernel/agent/agent.h:142-145";

const GAP_QUOTE =
  "Distinct from cred->cap_set, whose K-2.6 role is only fork-inheritance refcount " +
  "discipline (CAP-INV-11/14); fanning a published cap_set out to every task's cred " +
  "is EPIC-K-8 (routed).";

const GAP_AFTER =
  "STORY-K-8.1 through K-8.5 landed, and all four hook files came with them. None of them " +
  "added the fan-out. The only K-8 story the tree still names as open is K-8.6, a no-expiry " +
  "fast-bit for cap_set_has. The exhaustive grep across every assignment form returns three " +
  "writes, all in kernel/cred.c, and none of them installs a set. The init_cred initializer " +
  "has no cap_set entry either, so every task on a running system carries cap_set == NULL. " +
  "Building the set from a spawn request is deferred to STORY-K-3.1, which is not in the tree.";

/* The three consequences that fall straight out of the split. */
const CONSEQUENCES: Line[] = [
  {
    text:
      "agent_cap_present (477) returns -EACCES for every caller on a booted system, and emits an AE_CAP_DENIED on the way out. A token granted through 475 is not presentable through 477.",
    cite: "kernel/agent/syscalls.c:1189-1193 · :1243",
  },
  {
    text:
      "Every registered LSM hook takes its NULL-defer branch and returns 0 for every task. Capability enforcement is compiled in, registered at boot, and inert.",
    cite: "security/coconut/enforce.c:136-153 · security/coconut/net.c:286-291 · :335-340 · :371-376 · security/coconut/ptrace.c:109-114",
  },
  {
    text:
      "agent_cap_grant and agent_cap_revoke succeed only through the capable(CAP_SYS_ADMIN) bootstrap door. cap_grant_check_authority(NULL, ...) returns -EACCES on its first line, revoke denies inline on the same NULL, and NULL is what both always get.",
    cite: "kernel/agent/caps.c:664-679 · kernel/agent/syscalls.c:913-915 · :988-994 · :1110-1111",
  },
];

const DRIFT_DOC =
  "security/coconut/setup.h:82-84 calls the NULL-defer guard single-sourced so it cannot drift between hook files.";

const DRIFT_CODE =
  "coconut_check_current() at security/coconut/enforce.c:136-153 is one copy. security/coconut/net.c:286-291, :335-340, :371-376 and security/coconut/ptrace.c:109-114 open-code the same five lines four more times. The helper is called by five adapters in security/coconut/enforce.c, at :239, :253, :267, :272 and :282, and by the one adapter in security/coconut/bpf.c at :108. The net and ptrace adapters never reach it.";

type ClockRow = {
  label: string;
  body: string;
  cite: string;
};

/* Panel B. The mismatch is latent behind the split and goes live with it. */
const CLOCK_LEDE =
  "Second finding, and it only matters once the first one is fixed. The expiry timestamp is " +
  "stored in one clock domain and compared against another.";

const CLOCK: ClockRow[] = [
  {
    label: "stored",
    body:
      "Token expires_ns is CLOCK_REALTIME absolute. cap_token_verify checks it against ktime_get_real_ns(), and grant stores that same absolute value into the ledger record.",
    cite: "kernel/agent/cap_token.c:221-226 · kernel/agent/syscalls.c:767 · :815",
  },
  {
    label: "read, syscall",
    body:
      "The grant, revoke and present paths all read ktime_get_real_ns(). They match the stored domain, so expiry evaluates correctly there.",
    cite: "kernel/agent/syscalls.c:746 · :980 · :1195",
  },
  {
    label: "read, LSM",
    body: "Every LSM adapter passes ktime_get_mono_fast_ns() instead.",
    cite: "security/coconut/enforce.c:148 · security/coconut/net.c:302 · :341 · :377 · security/coconut/ptrace.c:115",
  },
  {
    label: "compared",
    body: "cap_set_has evaluates !g->expires_ns || g->expires_ns >= now_ns and returns true.",
    cite: "kernel/agent/caps.c:418-419",
  },
];

const CLOCK_RESULT =
  "Realtime nanoseconds run near 1.7e18. Monotonic-since-boot nanoseconds run near 1e13. The " +
  "stored value always exceeds the clock the hooks hand it, so on the LSM path an expired cap " +
  "reads as held and the expiry branch can never fire. It costs nothing today because the hooks " +
  "never receive a cap_set to check. It becomes a live security bug the day the bridge lands.";

type Bridge = {
  id: string;
  mech: string;
  cost: string;
};

/* Panel C. MUST-BE. Three options the code leaves available. */
const BRIDGE_LEDE =
  "An agent presents a cap and the LSM reads the same set the grant published. Today those are " +
  "two disjoint objects. Three bridges are possible and they do not have the same security " +
  "properties. The tree does not indicate which one wins.";

const BRIDGES: Bridge[] = [
  {
    id: "a",
    mech: "attest or spawn does prepare_creds plus commit_creds on the bound task.",
    cost:
      "Caps snapshot at bind time. Revocation then cannot reach a live agent without a second mechanism.",
  },
  {
    id: "b",
    mech: "cred->cap_set borrows the agent's RCU-published pointer.",
    cost:
      "Revocation is instant. The fork deep copy at kernel/cred.c:286-295 has to be rethought, because a child would need its own snapshot.",
  },
  {
    id: "c",
    mech: "The hooks resolve the agent behind current and read agent->cap_set directly.",
    cost: "Costs a registry lookup on every open(2).",
  },
];

const BRIDGE_CLOSE =
  "Whichever bridge wins also has to answer which clock wins, because the domain mismatch in " +
  "panel B goes live at the same instant.";

const BRIDGE_GATE =
  "v1.0 · routed to EPIC-K-8 at kernel/agent/agent.h:142-145 · K-8.1 through K-8.5 landed without it";

const CAPTION =
  "every line read from the tree at origin/main eef103d. the write set is an exhaustive grep " +
  "across all assignment forms, not a reading of call sites. the READ_ONCE line and the clock " +
  "line are two different lines inside each hook preamble, so they are cited separately: all " +
  "five READ_ONCE lines are cited exactly, each followed by the NULL-defer block it opens, and " +
  "each block stops one line short of the ktime_get_mono_fast_ns() call, which panel b cites on " +
  "its own. panel c is an open question and not a plan: nothing in the tree names the bridge, " +
  "so the three options are the ones the code leaves available and no more.";

function PanelHead({ state, label }: { state: "built" | "must-be"; label: string }) {
  return (
    <div className="flex items-baseline gap-2.5 flex-wrap">
      <RegisterMark state={state} />
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
        {label}
      </span>
    </div>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <div
      className="min-w-0 rounded-[2px] border p-4 sm:p-5"
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}
    >
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <RegisterMark state="built" />
        <span className="font-mono text-[12.5px] tracking-tight break-words text-[color:var(--accent)]">
          {store.name}
        </span>
      </div>
      <div className="mt-2 font-mono text-[11.5px] leading-[1.5] break-words text-[color:var(--fg)]/75">
        {store.decl}
      </div>
      <div className="mt-1">
        <Cite source={store.declCite} />
      </div>

      <dl className="mt-4 space-y-4">
        {store.blocks.map((b) => (
          <div key={b.label} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {b.label}
            </dt>
            <dd className="mt-2 space-y-2.5">
              {b.lines.map((l) => (
                <div key={l.cite} className="min-w-0">
                  <div className="font-mono text-[11.5px] leading-[1.55] break-words text-[color:var(--fg)]/85">
                    {l.text}
                  </div>
                  <div className="mt-1">
                    <Cite source={l.cite} />
                  </div>
                  {l.note ? (
                    <div
                      className="mt-1 font-mono text-[11px] leading-[1.5] break-words"
                      style={{ color: "var(--warning)" }}
                    >
                      {l.note}
                    </div>
                  ) : null}
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CapSetSplit() {
  return (
    <figure>
      <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-5 sm:p-7">
        {/* the assertion */}
        <PanelHead state="built" label="panel a · two stores, one gap" />
        <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-[color:var(--fg)]/85">
          {LEDE}
        </p>

        {/* the two stores and the channel between them */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_120px_1fr] gap-4 items-stretch">
          <StoreCard store={AGENT_STORE} />

          <div className="flex items-center justify-center gap-3 md:flex-col">
            <span
              aria-hidden
              className="md:hidden h-0 flex-1 border-t border-dotted"
              style={{ borderColor: GAP_EDGE }}
            />
            <span
              aria-hidden
              className="hidden md:block w-0 flex-1 self-center border-l border-dotted"
              style={{ borderColor: GAP_EDGE }}
            />
            <span className="flex shrink-0 flex-col items-center gap-1.5">
              <RegisterMark state="must-be" />
              <span
                className="text-center font-mono text-[10px] uppercase leading-[1.4] tracking-[0.12em]"
                style={{ color: "var(--highlight)" }}
              >
                {GAP_LABEL[0]}
                <br />
                {GAP_LABEL[1]}
              </span>
              <Cite source={GAP_CITE} className="block max-w-[112px] text-center" />
            </span>
            <span
              aria-hidden
              className="md:hidden h-0 flex-1 border-t border-dotted"
              style={{ borderColor: GAP_EDGE }}
            />
            <span
              aria-hidden
              className="hidden md:block w-0 flex-1 self-center border-l border-dotted"
              style={{ borderColor: GAP_EDGE }}
            />
          </div>

          <StoreCard store={CRED_STORE} />
        </div>

        <Drift className="mt-5" docSays={DRIFT_DOC} codeDoes={DRIFT_CODE} />

        {/* the tree's own admission */}
        <div
          className="mt-5 rounded-[2px] border p-4 sm:p-5"
          style={{ background: CARD_BG, borderColor: CARD_BORDER }}
        >
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <RegisterMark state="built" />
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
              the header says it in its own words
            </span>
          </div>
          <blockquote className="mt-2.5 font-mono text-[11.5px] leading-[1.6] break-words text-[color:var(--fg)]/85">
            {GAP_QUOTE}
          </blockquote>
          <div className="mt-1.5">
            <Cite source="kernel/agent/agent.h:142-145" />
          </div>
          <p className="mt-3 max-w-[70ch] text-[13px] leading-[1.55] text-[color:var(--fg)]/75">
            {GAP_AFTER}
          </p>
          <div className="mt-1.5">
            <Cite source="kernel/cred.c:52-71 · :286-295 · :737 · kernel/agent/syscalls.c:152-154 · security/coconut/ptrace.c:5 · security/coconut/enforce.c:37-40" />
          </div>
        </div>

        {/* what falls out of it */}
        <div className="mt-6 border-t hairline pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
            what that costs, today
          </span>
          <ul className="mt-3 space-y-3">
            {CONSEQUENCES.map((c) => (
              <li key={c.cite} className="min-w-0 flex gap-3 flex-wrap sm:flex-nowrap">
                <RegisterMark state="built" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[13px] leading-[1.55] text-[color:var(--fg)]/85">{c.text}</p>
                  <div className="mt-1">
                    <Cite source={c.cite} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel B */}
        <div className="mt-8 border-t hairline pt-6">
          <PanelHead state="built" label="panel b · the clock domains do not match" />
          <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-[color:var(--fg)]/85">
            {CLOCK_LEDE}
          </p>

          <dl className="mt-4 space-y-3">
            {CLOCK.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-1 sm:grid-cols-[112px_1fr] gap-1 sm:gap-4 items-baseline"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
                  {r.label}
                </dt>
                <dd className="min-w-0">
                  <div className="font-mono text-[11.5px] leading-[1.55] break-words text-[color:var(--fg)]/85">
                    {r.body}
                  </div>
                  <div className="mt-1">
                    <Cite source={r.cite} />
                  </div>
                </dd>
              </div>
            ))}
          </dl>

          <div
            className="mt-4 rounded-[2px] border p-4"
            style={{ background: WARN_BG, borderColor: WARN_BORDER }}
          >
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ color: "var(--warning)" }}
            >
              result
            </span>
            <p className="mt-2 max-w-[70ch] text-[13px] leading-[1.55] text-[color:var(--fg)]/85">
              {CLOCK_RESULT}
            </p>
            <div className="mt-1.5">
              <Cite source="kernel/agent/caps.c:418-419 · :442-444 · security/coconut/enforce.c:148" />
            </div>
          </div>
        </div>

        {/* Panel C */}
        <div className="mt-8 border-t hairline pt-6">
          <PanelHead state="must-be" label="panel c · the bridge, and it is undecided" />
          <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-[color:var(--fg)]/85">
            {BRIDGE_LEDE}
          </p>

          <dl className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {BRIDGES.map((b) => (
              <div
                key={b.id}
                className="min-w-0 rounded-[2px] border border-dotted p-3.5"
                style={{ borderColor: GAP_EDGE }}
              >
                <dt
                  className="font-mono text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: "var(--highlight)" }}
                >
                  option {b.id}
                </dt>
                <dd className="mt-2 font-mono text-[11.5px] leading-[1.55] break-words text-[color:var(--fg)]/85">
                  {b.mech}
                </dd>
                <dd className="mt-2 text-[12.5px] leading-[1.5] text-[color:var(--muted)]">
                  {b.cost}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 max-w-[70ch] text-[13px] leading-[1.55] text-[color:var(--fg)]/75">
            {BRIDGE_CLOSE}
          </p>
          <div className="mt-1.5">
            <Cite source={BRIDGE_GATE} />
          </div>
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] leading-[1.6] tracking-tight text-[color:var(--muted)]">
        {CAPTION}
      </figcaption>
    </figure>
  );
}
