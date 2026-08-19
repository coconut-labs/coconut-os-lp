"use client";

/* agent_spawn, check by check.

   Every check sys_agent_spawn runs, in source order, with the errno each one
   returns and the cleanup each failure performs. Read at origin/main eef103d
   from kernel/agent/syscalls.c:170-320, kernel/agent/lifecycle.c:145-178 and
   kernel/agent/registry.c:74-115.

   Replaces syscall-hotpath.tsx, four of whose six stages named functions that
   do not exist. Rollback text is always in the DOM. Hover and focus only raise
   a row, because at 375px there is no hover and the rollback is the mechanism
   a kernel reader came for. */

import { useState } from "react";
import { RegisterMark, Cite, Drift } from "@/components/register";

type Step = {
  /** printed order badge */
  n: string;
  /** the condition, verbatim from the source */
  cond: string;
  /** what the syscall returns when the condition holds */
  errno: string;
  /** line in kernel/agent/syscalls.c */
  line: string;
  /** the regime the number travels with */
  note?: string;
  /** cleanup performed on this failure */
  rollback?: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    cond: "!uargs",
    errno: "-EINVAL",
    line: ":177-178",
  },
  {
    n: "02",
    cond: "copy_from_user(&kargs, uargs, sizeof(kargs)) fails",
    errno: "-EFAULT",
    line: ":180-181",
    note: "656 bytes, unconditional. no size argument, so no size negotiation.",
  },
  {
    n: "03",
    cond: "kargs.version != 1",
    errno: "-EINVAL",
    line: ":188-189",
  },
  {
    n: "04",
    cond: "kargs.flags & ~SPAWN_FLAG__ALL",
    errno: "-EINVAL",
    line: ":191-192",
    note: "six flag bits are recorded onto struct agent at :230. only ATTESTABLE has a bit reader, at :416. :317 prints the word and reads no bit.",
  },
  {
    n: "05",
    cond: "!memchr(name, 0, 64) / image_path, 256 / workdir, 256",
    errno: "-EINVAL",
    line: ":201-202, :203-204, :205-206",
  },
  {
    n: "06",
    cond: "argc || envc || initial_cap_count",
    errno: "-EINVAL",
    line: ":213-214",
  },
  {
    n: "07",
    cond: "trailing_size > COCONUT_SPAWN_TRAILING_MAX_V1",
    errno: "-EINVAL",
    line: ":215-216",
    note: "the constant is literally 0 at :110, so a spawn cannot carry initial capabilities at all.",
  },
  {
    n: "08",
    cond: "coconut_agent_alloc(GFP_KERNEL) returns NULL",
    errno: "-ENOMEM",
    line: ":223-225",
  },
  {
    n: "09",
    cond: "coconut_agent_set_attesting() fails",
    errno: "-EINVAL / -EFAULT",
    line: ":258-269",
    note: "-EINVAL disallowed transition, -EFAULT NULL agent. kernel/agent/lifecycle.c:228-233 forwards straight to :145-178.",
    rollback: "coconut_agent_free(agent)",
  },
  {
    n: "10",
    cond: "coconut_agent_register() fails",
    errno: "-ENOMEM / -EBUSY / -EINVAL / -EIO",
    line: ":284-295",
    note: "xa_insert plus readback. kernel/agent/registry.c:74-115.",
    rollback: "agent forced to TERMINATED, then reaped",
  },
];

const CARD =
  "rounded-[2px] border hairline p-4 bg-[color:var(--surface)]/40";

export function SpawnGauntlet() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <figure>
      <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/30 p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-3 border-b hairline">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            check · source order · errno returned
          </span>
          <Cite source="kernel/agent/syscalls.c:170-320" />
        </div>

        <ol className="mt-3 space-y-1.5">
          {STEPS.map((s) => (
            <StepRow
              key={s.n}
              s={s}
              active={active === s.n}
              onHover={() => setActive(s.n)}
              onLeave={() => setActive(null)}
            />
          ))}
        </ol>

        {/* terminal state */}
        <div
          className="mt-5 rounded-[2px] border p-4"
          style={{
            background: "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)",
            borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
              style={{ color: "var(--accent)" }}
            >
              returns
            </span>
            <RegisterMark state="built" />
          </div>
          <div className="mt-2 font-mono text-[12px] text-[color:var(--fg)]/85 leading-snug break-words">
            (long)aid, a per-boot counter whose first agent is 1. state is ATTESTING.
            nothing has been exec&apos;d.
          </div>
          <div className="mt-2 font-mono text-[11.5px] text-[color:var(--muted)] leading-snug break-words">
            the kernel does not exec the agent image. image_path and workdir are
            NUL-validated and then discarded, never stored on struct agent.{" "}
            <Cite source="kernel/agent/syscalls.c:88-98 · :161-163 · :228-249 · :319 · Documentation/coconut/agent-syscalls.rst:87-95" />
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <RegisterMark state="must-be" />
            <span className="min-w-0 font-mono text-[11.5px] text-[color:var(--muted)] leading-snug break-words">
              userspace coconutd is the intended exec&apos;er and the driver of
              ATTESTING to RUNNING. it is not in the tree in any form.{" "}
              <Cite source="STORY-U-1.1 · Documentation/coconut/agent-syscalls.rst:87-91 · :146-151 · :228-230" />
            </span>
          </div>
        </div>
      </div>

      {/* annotations */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={CARD}>
          <RegisterMark state="built" />
          <p className="mt-2.5 font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-relaxed break-words">
            472 performs no capability check of any kind. every capable() call
            site in kernel/agent/syscalls.c sits outside it, at :397 attest, :603
            quota, :915 grant and :1111 revoke, and the file calls no security_
            hook at all.
            any unprivileged task can create agents against a registry whose own
            comment says the upper bound is the slab cache size, which is
            unbounded.
          </p>
          <div className="mt-2">
            <Cite source="kernel/agent/syscalls.c:170-320 · kernel/agent/registry.c:30-35" />
          </div>
        </div>

        <div className={CARD}>
          <RegisterMark state="designed" />
          <p className="mt-2.5 font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-relaxed break-words">
            The gate I specified is security_agent_spawn(). The caller holds
            CAP_AGENT_SPAWN or the call returns -EACCES. I routed it to a later
            story and shipped 472 without it. CAP_AGENT_SPAWN exists today as cap
            id 0 in the uapi registry. Outside a name table and the KUnit suites
            nothing reads it, and no path checks it before a spawn, so the door
            stays open until that story lands.
          </p>
          <div className="mt-2">
            <Cite source="STORY-K-6.x · kernel/agent/syscalls.c:157-158 · include/uapi/linux/coconut_caps.h:48 · kernel/agent/coconut_caps.c:176 · Documentation/coconut/agent-syscalls.rst:131-141" />
          </div>
        </div>

        <div className={CARD}>
          <RegisterMark state="built" />
          <p className="mt-2.5 font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-relaxed break-words">
            Four fields of the args struct are accepted and dropped:
            initial_tokens, mem_tier_hbm_max, mem_tier_dram_max, mem_tier_ssd_max.{" "}
            <span style={{ color: "var(--warning)" }}>read by nothing.</span>{" "}
            refill_per_sec is consumed, but written into quota.spawn_rate, an
            agents-per-second field, with a u64 to u32 truncation.
          </p>
          <div className="mt-2">
            <Cite source="kernel/agent/syscalls.c:228-249 · include/uapi/linux/agent.h:59-63" />
          </div>
          <Drift
            className="mt-3"
            docSays={
              <>
                kernel/agent/syscalls.c:242-243 · &quot;The memory-tier maxes from
                args are recorded on the agent&quot;
              </>
            }
            codeDoes={
              <>struct agent has no such fields · kernel/agent/agent.h:127-250 · all three are dropped</>
            }
          />
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        ten checks, read in source order at eef103d · lines are offsets into
        kernel/agent/syscalls.c unless the row names another file · the two
        rollback paths are the only cleanup on this syscall
      </figcaption>
    </figure>
  );
}

function StepRow({
  s,
  active,
  onHover,
  onLeave,
}: {
  s: Step;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const tone = s.rollback ? "var(--warning)" : "var(--accent)";
  return (
    <li>
      <button
        type="button"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onFocus={onHover}
        onBlur={onLeave}
        className="w-full text-left rounded-[2px] border px-3 py-2.5 outline-none transition-[transform,background,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
        style={{
          background: active
            ? "color-mix(in oklab, var(--canvas) 80%, var(--surface) 20%)"
            : "color-mix(in oklab, var(--canvas) 94%, var(--surface) 6%)",
          borderColor: active
            ? `color-mix(in oklab, ${tone} 55%, transparent)`
            : "color-mix(in oklab, var(--fg) 12%, transparent)",
          transform: active ? "translateX(2px)" : "translateX(0)",
          transitionTimingFunction: "var(--ease-precise)",
        }}
      >
        <div className="grid grid-cols-[26px_1fr] gap-x-3 gap-y-1 items-baseline">
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: "var(--muted)" }}
          >
            {s.n}
          </span>

          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4 gap-y-1">
              <span className="min-w-0 font-mono text-[12px] text-[color:var(--fg)]/85 leading-snug break-words">
                {s.cond}
              </span>
              <span className="flex items-baseline gap-2 shrink-0">
                <span
                  className="font-mono text-[11.5px] whitespace-nowrap"
                  style={{ color: "var(--accent)" }}
                >
                  {s.errno}
                </span>
                <Cite source={s.line} />
              </span>
            </div>

            {s.note && (
              <div className="mt-1 font-mono text-[11px] text-[color:var(--muted)] leading-snug break-words">
                {s.note}
              </div>
            )}

            {s.rollback && (
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className="font-mono text-[11px] leading-snug shrink-0"
                  style={{ color: "var(--warning)" }}
                >
                  <span aria-hidden>&#8617;</span> rollback
                </span>
                <span className="min-w-0 font-mono text-[11px] leading-snug break-words text-[color:var(--fg)]/75">
                  {s.rollback}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
