/* Status strip — three true states, sits directly under the fixed nav.
   Replaces the old team/date stats with what is verifiable today. */

export function StatusStrip() {
  return (
    <div className="pt-14">
      <div className="border-b hairline">
        <div className="container-x flex flex-wrap items-center gap-x-2.5 gap-y-1 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} aria-hidden />
            Spec phase
          </span>
          <span aria-hidden>·</span>
          <span>Kernel prototypes</span>
          <span aria-hidden>·</span>
          <span>Open progress every 2 weeks</span>
        </div>
      </div>
    </div>
  );
}
