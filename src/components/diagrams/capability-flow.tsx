"use client";

/* Capability presentation flow.
   Userspace agent issues a syscall, presents a capability, the LSM hook checks
   the cap_set bound at spawn, then grants or denies and appends to the audit. Public preview
   shows the *shape*; the LSM-hook internals + cred-shim mechanics publish
   with the security drop. */

const STEPS = [
  { tag: "userspace",     label: "agent issues syscall",                    detail: "open(\"/home/maya/notes\", O_RDONLY)" },
  { tag: "libcoconut",    label: "present capability",                      detail: "agent_cap_present(aid, cap.fs.read)" },
  { tag: "security/coconut", label: "LSM hook gates the call",             detail: "lookup cap_set bound at spawn" },
  { tag: "kernel/audit",  label: "audit append · chain-sealed",             detail: "ev=cap_use · chain=blake3:…" },
  { tag: "kernel",        label: "VFS executes, or returns -ECAPABILITY",  detail: "no cap = no reach · deny before the operation" },
];

export function CapabilityFlow() {
  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">
        <ol className="relative space-y-3.5">
          {/* spine */}
          <div className="absolute left-[132px] sm:left-[160px] top-3 bottom-3 w-px bg-[color-mix(in_oklab,var(--fg)_15%,transparent)]" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={i} className="grid grid-cols-[132px_24px_1fr] sm:grid-cols-[160px_24px_1fr] gap-2 sm:gap-4 items-start">
              <div className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight pt-1.5 text-right whitespace-nowrap leading-tight overflow-hidden text-ellipsis">
                {s.tag}
              </div>
              <div className="relative pt-2">
                <span className="block w-2.5 h-2.5 rounded-full" style={{
                  background: i === 2 || i === 3 ? "var(--accent)" : "var(--canvas)",
                  border: "1.5px solid var(--accent)",
                }} />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] text-[color:var(--fg)] leading-tight tracking-tight">{s.label}</div>
                <div className="mt-1 font-mono text-[12px] text-[color:var(--muted)] leading-tight break-words">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>

        {/* outcome row */}
        <div className="mt-7 pt-5 border-t hairline grid grid-cols-2 gap-3">
          <div className="p-3 rounded-[2px]" style={{ background: "color-mix(in oklab, var(--success) 12%, var(--canvas))", border: "1px solid color-mix(in oklab, var(--success) 35%, transparent)" }}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--success)" }}>grant</div>
            <div className="mt-1 font-mono text-[12px] text-[color:var(--fg)]/85">syscall returns · audit row sealed</div>
          </div>
          <div className="p-3 rounded-[2px]" style={{ background: "color-mix(in oklab, var(--accent) 12%, var(--canvas))", border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)" }}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--accent)" }}>deny</div>
            <div className="mt-1 font-mono text-[12px] text-[color:var(--fg)]/85">-ECAPABILITY · parent agent notified</div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        capability presentation is in the syscall hot path · never bypassable from userspace
      </figcaption>
    </figure>
  );
}
