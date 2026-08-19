"use client";

/* LSM hook map · what security/coconut actually gates.
   Ten registered hooks, the cap id each one selects, and the 51 of 64
   cap ids no decision code reads. Every row is read from the tree at
   origin/main eef103d and carries its file:line. The figure is
   deliberately not flattering: ten hooks sounds like coverage, and
   thirteen of sixty-four does not, and both are true at the same commit.

   The mark and the cite come from the shared register primitive, so this
   figure speaks the same vocabulary as every other claim on the page. */

import { useState } from "react";

import { Cite, RegisterMark } from "@/components/register";

/* ---------------------------------------------------------------- register */

type Register = "built" | "designed" | "must-be";

/* -------------------------------------------------------------------- data */

type Posture = { id: string; label: string; body: string; cite: string };

const POSTURE: Posture[] = [
  {
    id: "stacked",
    label: "stacked",
    body: 'CONFIG_LSM="lockdown,yama,integrity,bpf,landlock,coconut" · coconut runs last, after landlock. LSM_ID_COCONUT is 114, the next id after LSM_ID_IPE 113.',
    cite: "include/uapi/linux/lsm.h:67-68 · arch/x86/configs/coconut_defconfig:50-51",
  },
  {
    id: "deny-only",
    label: "deny-only",
    body: "coconut_cap_check returns 0 or -EACCES. Three branches: NULL cap_set defers, cap_set_has allows, otherwise emit exactly one AE_CAP_DENIED and deny. It never grants what DAC would refuse.",
    cite: "security/coconut/enforce.c:88-101",
  },
  {
    id: "blob-less",
    label: "blob-less",
    body: ".blobs = NULL. The LSM keeps no per-object security state, so it can gate nothing the cred-resident cap_set does not already cover, and the blob-lifecycle bug class does not exist here.",
    cite: "security/coconut/setup.c:72-76",
  },
];

type Hook = {
  id: string;
  hook: string;
  file: string;
  caps: number[];
  rule: string;
  note?: string;
};

const HOOKS: Hook[] = [
  {
    id: "file_open",
    hook: "file_open",
    file: "security/coconut/enforce.c:185-195",
    caps: [2, 3],
    rule: "FILE_READ always. FILE_WRITE additionally when FMODE_WRITE is set. First deny wins.",
    note: "COCONUT_FILE_OPEN_MAX_CAPS is 2 at security/coconut/setup.h:118 · adapter at security/coconut/enforce.c:231-245",
  },
  {
    id: "inode_unlink",
    hook: "inode_unlink",
    file: "security/coconut/enforce.c:198-201",
    caps: [4],
    rule: "FILE_DELETE.",
  },
  {
    id: "inode_mkdir",
    hook: "inode_mkdir",
    file: "security/coconut/enforce.c:204-207",
    caps: [5],
    rule: "FILE_DIR_MUTATE.",
  },
  {
    id: "inode_rmdir",
    hook: "inode_rmdir",
    file: "security/coconut/enforce.c:204-207",
    caps: [5],
    rule: "FILE_DIR_MUTATE, the same cap as mkdir. Create and remove are one permission.",
  },
  {
    id: "bprm_check_security",
    hook: "bprm_check_security",
    file: "security/coconut/enforce.c:210-213",
    caps: [6],
    rule: "FILE_EXEC.",
  },
  {
    id: "socket_bind",
    hook: "socket_bind",
    file: "security/coconut/net.c:314-316",
    caps: [13, 14],
    rule: "NET_BIND unconditionally, then NET_BIND_PRIVILEGED additively when the port is non-zero and under 1024.",
    note: "COCONUT_PRIV_PORT_MAX is 1024 · security/coconut/net.c:105, tier picked at :247-248",
  },
  {
    id: "socket_connect",
    hook: "socket_connect",
    file: "security/coconut/net.c:342",
    caps: [15],
    rule: "NET_CONNECT.",
  },
  {
    id: "socket_create",
    hook: "socket_create",
    file: "security/coconut/net.c:368-378",
    caps: [17],
    rule: "NET_RAW, and only for SOCK_RAW.",
  },
  {
    id: "bpf_prog_load",
    hook: "bpf_prog_load",
    file: "security/coconut/bpf.c:85-88, :90",
    caps: [20],
    rule: "BPF. Registered only under CONFIG_BPF_SYSCALL, which arch/x86/configs/coconut_defconfig:129 sets to y.",
    note: "with that config off the registration function compiles to an empty body · security/coconut/bpf.c:131-141",
  },
  {
    id: "ptrace_access_check",
    hook: "ptrace_access_check",
    file: "security/coconut/ptrace.c:77-80",
    caps: [19],
    rule: "TRACE. The hook ignores both child and mode, so the cap is binary with no per-target scope.",
    note: "hook body at security/coconut/ptrace.c:102-120",
  },
];

type OffHook = { id: number; by: string; cite: string };

const OFF_HOOK: OffHook[] = [
  { id: 26, by: "agent_cap_grant authority gate", cite: "kernel/agent/caps.c:675" },
  { id: 27, by: "agent_cap_revoke authority gate", cite: "kernel/agent/syscalls.c:990" },
];

type RegList = { file: string; count: string; reg: string };

const REG_LISTS: RegList[] = [
  { file: "security/coconut/enforce.c:295-302", count: "5 hooks", reg: "registered at :304-308" },
  { file: "security/coconut/net.c:394-398", count: "3 hooks", reg: "registered at :400-404" },
  { file: "security/coconut/bpf.c:121-123", count: "1 hook", reg: "registered at :125-129, inside #ifdef CONFIG_BPF_SYSCALL" },
  { file: "security/coconut/ptrace.c:142-144", count: "1 hook", reg: "registered at :146-150" },
];

/* Full fast-path cap-id namespace, ids 0-63, each id its bit position in the
   u64 cap_bitmap. include/uapi/linux/coconut_caps.h:48-145. All are prefixed
   CAP_AGENT_ in the header. */
const CAP_NAMES: string[] = [
  "SPAWN", "FORK", "FILE_READ", "FILE_WRITE", "FILE_DELETE", "FILE_DIR_MUTATE", "FILE_EXEC", "FS_READ",
  "FS_WRITE", "FS_READ_DESC", "FS_WRITE_DESC", "FS_READ_OTHER", "FS_WRITE_GLOBAL", "NET_BIND", "NET_BIND_PRIVILEGED", "NET_CONNECT",
  "NET_ADMIN", "NET_RAW", "SIGNAL", "TRACE", "BPF", "MOUNT", "CTL", "CTL_GLOBAL",
  "QUOTA_SET", "MEM_TIER_SET", "CAP_DELEGATE", "CAP_REVOKE", "ATTEST", "AUDIT_READ", "AUDIT_SEAL", "AUDIT_PROOF",
  "INFER", "INFER_BROKER", "INFER_PRIVILEGED", "GPU_DIRECT", "CPU_PRIO_HIGH", "CPU_PRIO_LOW", "DEADLINE_SET", "PACKAGE_INSTALL",
  "PACKAGE_REMOVE", "POLICY_RELOAD", "SHELL_BIND", "CENTER_BIND", "KBD_GRAB", "SCREEN_CAPTURE", "PERSIST_STATE", "SUSPEND_OTHER",
  "REPARENT", "TIME_SET", "HARDWARE_QUERY", "HARDWARE_TUNE", "THERMAL_QUERY", "DEBUG", "PERF", "KEY_RING",
  "TPM_QUERY", "TPM_SIGN", "RANDOM_QUERY", "PIN_CPU", "NUMA_PIN", "HUGEPAGE", "MEMFD_SECRET", "UNSAFE_LEGACY",
];

/* id -> the reader that selects it. Derived from the two arrays above so the
   grid can never disagree with the hook rows. */
const READERS: Map<number, string> = (() => {
  const m = new Map<number, string>();
  for (const h of HOOKS) {
    for (const c of h.caps) {
      const prev = m.get(c);
      m.set(c, prev ? `${prev} · ${h.hook}` : h.hook);
    }
  }
  for (const o of OFF_HOOK) m.set(o.id, o.by);
  return m;
})();

type Card = { id: string; register: Register; title: string; body: string; cite: string };

const SCOPE_GAPS: Card[] = [
  {
    id: "bpf-cmd",
    register: "built",
    title: "only BPF_PROG_LOAD is gated",
    body: "The hook fires on one bpf() command. BPF_MAP_CREATE, BPF_MAP_UPDATE_ELEM, BPF_PROG_ATTACH, BPF_LINK_CREATE and BPF_OBJ_GET stay open, so an agent refused the load can still write maps or attach a program someone else loaded. Closing it needs the cmd-level bpf hook, which is not registered.",
    cite: "security/coconut/bpf.c:12-21",
  },
  {
    id: "traceme",
    register: "built",
    title: "ptrace_traceme is not hooked",
    body: "Only ptrace_access_check is registered, so the volunteer path is ungated: a tracee calls PTRACE_TRACEME and the parent becomes tracer without passing a cap. Gating current in the traceme hook would gate the tracee, which is the wrong actor, and gating the real tracer needs a cross-task __task_cred read the story declined to add.",
    cite: "security/coconut/ptrace.c:127-144",
  },
  {
    id: "l2-bind",
    register: "built",
    title: "AF_PACKET and L2 are not gated by the bind path",
    body: "Non-IP binds, AF_UNIX and AF_NETLINK included, fall to base NET_BIND, because SHELL_BIND (42) and CENTER_BIND (43) are wired to no hook at all. The NET_RAW gap on AF_PACKET is tracked as a K-8.4 follow-up and a STRIDE row, not closed here.",
    cite: "security/coconut/net.c:218-226",
  },
  {
    id: "socket-create",
    register: "built",
    title: "socket_create returns 0 for everything that is not SOCK_RAW",
    body: "The type test runs before any cred read, clock read or core call, so SOCK_STREAM and SOCK_DGRAM creation is never a Coconut decision at v1, agent or not.",
    cite: "security/coconut/net.c:367-369",
  },
];

const NOTES: Card[] = [
  {
    id: "af-unspec",
    register: "built",
    title: "socket_bind keys IP-ness on the socket, not the address",
    body: "coconut_sockaddr_port switches on sock->sk->sk_family rather than the caller-supplied sockaddr, which closes the AF_UNSPEC privileged-bind laundering path. The port parse is tri-state and fails closed: a truncated IP address yields _SHORT, and _SHORT maps to NET_BIND_PRIVILEGED.",
    cite: "security/coconut/net.c:300, :161-182, :232-255",
  },
  {
    id: "perf",
    register: "built",
    title: "every agent file_open pays an O(grants) walk",
    body: "cap_set_has with a non-zero now_ns walks the whole grant ledger to reach an expiry verdict. The cost is acknowledged in the file and unmeasured, since no agent path is live to measure. The no-expiry fast bit that would fix it is STORY-K-8.6, which is not in the tree.",
    cite: "security/coconut/enforce.c:37-40 · kernel/agent/caps.c:414-420",
  },
];

/* ---------------------------------------------------------------- component */

export function LsmHookMap() {
  const [hoverHook, setHoverHook] = useState<string | null>(null);
  const [hoverCap, setHoverCap] = useState<number | null>(null);

  const litCaps = hoverHook ? HOOKS.find((h) => h.id === hoverHook)?.caps ?? [] : null;
  const readout =
    hoverCap !== null
      ? `${String(hoverCap).padStart(2, "0")} · CAP_AGENT_${CAP_NAMES[hoverCap]} · ${
          READERS.get(hoverCap) ?? "no decision code reads it"
        }`
      : hoverHook
        ? `${hoverHook} · ${(litCaps ?? []).map((c) => `${c} ${CAP_NAMES[c]}`).join(" + ")}`
        : "hover a hook row or a filled cell";

  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">
        {/* title strip */}
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b hairline flex-wrap">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
              security/coconut · LSM_ID_COCONUT 114
            </div>
            <div className="mt-1 font-mono text-[14px] text-[color:var(--fg)] tracking-tight">
              10 hooks registered · 13 of 64 cap ids reach a decision
            </div>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <RegisterMark state="built" />
            <Cite source="security/coconut/setup.c:56-64" />
          </div>
        </div>

        {/* posture */}
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {POSTURE.map((p) => (
            <li
              key={p.id}
              className="rounded-[2px] border p-3.5"
              style={{
                background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
                borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
              }}
            >
              <div
                className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
                style={{ color: "var(--accent)" }}
              >
                {p.label}
              </div>
              <p className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/80 break-words">
                {p.body}
              </p>
              <div className="mt-2">
                <Cite source={p.cite} />
              </div>
            </li>
          ))}
        </ul>

        {/* the inert finding */}
        <div
          className="mt-3 rounded-[2px] border p-4 sm:p-5"
          style={{
            background: "color-mix(in oklab, var(--canvas) 88%, var(--warning) 12%)",
            borderColor: "color-mix(in oklab, var(--warning) 45%, transparent)",
          }}
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
              style={{ color: "var(--warning)" }}
            >
              what all ten do today
            </span>
            <RegisterMark state="built" />
          </div>
          <p className="mt-2 font-mono text-[12px] leading-snug text-[color:var(--fg)]/85 break-words">
            Every hook takes its NULL-defer branch. coconut_check_current reads
            READ_ONCE(current_cred()-&gt;cap_set) under rcu_read_lock and returns 0 before any
            clock read when it is NULL. Nothing in the tree ever installs a non-NULL cap_set: the
            three assignment sites all live in kernel/cred.c, two of them write NULL, and the third
            sits behind an if (new-&gt;cap_set) guard that is never true. Enforcement is compiled in,
            registered at boot, and inert.
          </p>
          <div className="mt-2">
            <Cite source="security/coconut/enforce.c:136-153 · kernel/cred.c:286-295, :737" />
          </div>
          <p className="mt-2.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/70">
            The KUnit suites manufacture a cap_set with override_creds() precisely because no
            production path can produce one. A green suite and an inert kernel are the same fact.
          </p>
          <div className="mt-2">
            <Cite source="security/coconut/setup.h:147-152 · security/coconut/enforce.c:130-134" />
          </div>
        </div>

        {/* hook rows */}
        <div className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
          hook · file · cap id selected
        </div>
        <ul className="mt-2.5 grid grid-cols-1 gap-2">
          {HOOKS.map((h) => {
            const lit =
              hoverHook === h.id || (hoverCap !== null && h.caps.includes(hoverCap));
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverHook(h.id)}
                  onMouseLeave={() => setHoverHook(null)}
                  onFocus={() => setHoverHook(h.id)}
                  onBlur={() => setHoverHook(null)}
                  className="w-full text-left rounded-[2px] border px-3.5 py-2.5 outline-none transition-[transform,background,border-color] duration-300 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
                  style={{
                    background: lit
                      ? "color-mix(in oklab, var(--canvas) 80%, var(--surface) 20%)"
                      : "color-mix(in oklab, var(--canvas) 94%, var(--surface) 6%)",
                    borderColor: lit
                      ? "color-mix(in oklab, var(--accent) 55%, transparent)"
                      : "color-mix(in oklab, var(--fg) 12%, transparent)",
                    transform: lit ? "translateX(2px)" : "translateX(0)",
                    transitionTimingFunction: "var(--ease-precise)",
                  }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="font-mono text-[12.5px] tracking-tight"
                      style={{ color: "var(--accent)" }}
                    >
                      {h.hook}
                    </span>
                    <Cite source={h.file} />
                    <span className="flex flex-wrap gap-1">
                      {h.caps.map((c) => (
                        <span
                          key={c}
                          className="font-mono text-[10.5px] px-1.5 py-0.5 rounded-[2px] border"
                          style={{
                            background: "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)",
                            borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          {c} {CAP_NAMES[c]}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
                    {h.rule}
                  </div>
                  {h.note && (
                    <div className="mt-1 font-mono text-[11px] text-[color:var(--muted)] leading-snug">
                      {h.note}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* off-hook consumers */}
        <dl className="mt-3 rounded-[2px] border hairline p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="sm:col-span-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            two more cap ids are read outside any hook
          </div>
          {OFF_HOOK.map((o) => (
            <div key={o.id}>
              <dt className="font-mono text-[12px]" style={{ color: "var(--accent)" }}>
                {o.id} CAP_AGENT_{CAP_NAMES[o.id]}
              </dt>
              <dd className="mt-0.5 font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
                {o.by} · <Cite source={o.cite} />
              </dd>
            </div>
          ))}
        </dl>

        {/* registration lists */}
        <div className="mt-3 rounded-[2px] border hairline p-3.5">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            four __ro_after_init hook lists, one shared lsm id
          </div>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
            {REG_LISTS.map((r) => (
              <li key={r.file} className="font-mono text-[11.5px] text-[color:var(--fg)]/75 leading-snug">
                <span style={{ color: "var(--accent)" }}>{r.file}</span> · {r.count} · {r.reg}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/70">
            All four are driven from coconut_lsm_init and all four register against the single
            shared {"&coconut_lsmid"}. The six-line Tier-A guard is not shared the same way:
            enforce.c and bpf.c call coconut_check_current, while net.c and ptrace.c open-code the
            identical sequence four times, at security/coconut/net.c:286-291, :335-340 and :371-376,
            and at security/coconut/ptrace.c:109-114. security/coconut/setup.h:83-84 calls that guard
            single-sourced.
          </p>
          <div className="mt-2">
            <Cite source="security/coconut/setup.c:56-64 · security/coconut/enforce.c:136-153" />
          </div>
        </div>

        {/* coverage grid */}
        <div className="mt-6 flex items-baseline justify-between gap-3 flex-wrap">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            fast-path cap-id namespace · ids 0-63 · bit position in the u64 cap_bitmap
          </div>
          <Cite source="include/uapi/linux/coconut_caps.h:48-145" />
        </div>

        <div
          className="mt-2 rounded-[2px] border hairline px-3 py-2 font-mono text-[11.5px] tracking-tight break-words"
          style={{ background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)" }}
          aria-live="polite"
        >
          <span style={{ color: hoverCap !== null || hoverHook ? "var(--accent)" : "var(--muted)" }}>
            {readout}
          </span>
        </div>

        <ul className="mt-2.5 grid grid-cols-8 gap-1 sm:gap-1.5">
          {CAP_NAMES.map((name, id) => {
            const mapped = READERS.has(id);
            const lit = litCaps ? litCaps.includes(id) : hoverCap === id;
            return (
              <li key={id} className="min-w-0">
                <button
                  type="button"
                  tabIndex={mapped ? 0 : -1}
                  onMouseEnter={() => setHoverCap(id)}
                  onMouseLeave={() => setHoverCap(null)}
                  onFocus={() => setHoverCap(id)}
                  onBlur={() => setHoverCap(null)}
                  className="w-full aspect-square rounded-[2px] border flex items-center justify-center outline-none transition-colors duration-300 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
                  style={{
                    background: mapped
                      ? lit
                        ? "color-mix(in oklab, var(--canvas) 62%, var(--accent) 38%)"
                        : "color-mix(in oklab, var(--canvas) 82%, var(--accent) 18%)"
                      : lit
                        ? "color-mix(in oklab, var(--canvas) 86%, var(--surface) 14%)"
                        : "var(--canvas)",
                    borderColor: mapped
                      ? "color-mix(in oklab, var(--accent) 60%, transparent)"
                      : "color-mix(in oklab, var(--fg) 12%, transparent)",
                    transitionTimingFunction: "var(--ease-precise)",
                  }}
                >
                  <span
                    className="font-mono text-[9px] leading-none"
                    style={{ color: mapped ? "var(--accent)" : "var(--muted)" }}
                    aria-hidden
                  >
                    {id}
                  </span>
                  <span className="sr-only">
                    cap id {id}, CAP_AGENT_{name},{" "}
                    {mapped ? `read by ${READERS.get(id)}` : "read by no decision code"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-2.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
          13 filled, 51 outline. The other 51 exist only as rows in the coconut_cap_id_names[]
          string table. No decision code references them, so a grant of any one of them changes
          nothing an operation can observe.
        </p>
        <div className="mt-2">
          <Cite source="kernel/agent/coconut_caps.c:174-274" />
        </div>

        {/* scope gaps */}
        <div className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
          four scope gaps the tree flags itself
        </div>
        <ul className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {SCOPE_GAPS.map((c) => (
            <li key={c.id}>
              <CardBody card={c} />
            </li>
          ))}
        </ul>

        {/* two more facts that belong with the hooks */}
        <div className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
          one thing the bind path gets right, one cost it does not measure
        </div>
        <ul className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {NOTES.map((c) => (
            <li key={c.id}>
              <CardBody card={c} />
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight leading-relaxed">
        read at origin/main eef103d from security/coconut/, kernel/agent/, kernel/cred.c,
        include/uapi/linux/lsm.h, include/uapi/linux/coconut_caps.h and
        arch/x86/configs/coconut_defconfig ·
        every hook row, cap id and registration list carries its file:line · 13 of 64 is a static
        read of the decision code, not a runtime measurement · no coverage instrumentation exists
        in this tree, and with every cap_set NULL there is nothing live to instrument
      </figcaption>
    </figure>
  );
}

function CardBody({ card }: { card: Card }) {
  const warn = card.id === "perf" || card.id === "bpf-cmd" || card.id === "traceme" || card.id === "l2-bind" || card.id === "socket-create";
  return (
    <div
      className="h-full rounded-[2px] border p-3.5"
      style={{
        background: "color-mix(in oklab, var(--canvas) 94%, var(--surface) 6%)",
        borderColor: warn
          ? "color-mix(in oklab, var(--warning) 32%, transparent)"
          : "color-mix(in oklab, var(--fg) 12%, transparent)",
      }}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        <RegisterMark state={card.register} />
        <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]">
          {card.title}
        </span>
      </div>
      <p className="mt-2 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
        {card.body}
      </p>
      <div className="mt-2">
        <Cite source={card.cite} />
      </div>
    </div>
  );
}
