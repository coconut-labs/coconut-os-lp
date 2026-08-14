/* Status strip: three true states, sits directly under the fixed nav.
   Every line here has to be checkable against the kernel tree. */

export function StatusStrip() {
  return (
    <div className="pt-14">
      <div className="border-b hairline">
        <div className="container-x flex flex-wrap items-center gap-x-2.5 gap-y-1 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} aria-hidden />
            Six agent syscalls wired on x86_64
          </span>
          <span aria-hidden>·</span>
          <span>Ten LSM hooks enforcing</span>
          <span aria-hidden>·</span>
          <span>No public ISO yet</span>
        </div>
      </div>
    </div>
  );
}
