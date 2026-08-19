/* The register device. One vocabulary, three states, learned once.

   Border treatment is the primary signal, not color. solid / dashed / dotted
   for built / designed / must-be. In light mode --highlight is #4A4A55 and
   --muted is #6A6A78: two greys about 10% apart in lightness. A color-only
   device fails for every reader and fails in print. Tone is secondary
   reinforcement only. Do not "simplify" this back to color.

   Drift is deliberately not a fourth chip. It is a borderless annotation that
   hangs off a BUILT cite, because doc-versus-code drift is not a call anyone
   made. Block level: place it after the paragraph, never inside one. */

type RegisterState = "built" | "designed" | "must-be";

type MarkSpec = {
  /** what the chip prints */
  label: string;
  /** what a screen reader gets */
  reader: string;
  /** the primary signal */
  border: "solid" | "dashed" | "dotted";
  /** chip fill */
  fill: string;
  /** secondary reinforcement */
  tone: string;
  /** border color, keyed to the tone */
  edge: string;
  /** the legend line in RegisterKey */
  legend: string;
};

const MARKS: Record<RegisterState, MarkSpec> = {
  built: {
    label:  "BUILT",
    reader: "built",
    border: "solid",
    fill:   "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)",
    tone:   "var(--accent)",
    edge:   "color-mix(in oklab, var(--accent) 50%, transparent)",
    legend: "in the tree at {commit} · cites file:line",
  },
  designed: {
    label:  "DESIGNED",
    reader: "designed",
    border: "dashed",
    fill:   "transparent",
    tone:   "var(--muted)",
    edge:   "color-mix(in oklab, var(--muted) 65%, transparent)",
    legend: "a call I made · the reasoning and what I rejected",
  },
  "must-be": {
    label:  "MUST-BE",
    reader: "must be",
    border: "dotted",
    fill:   "transparent",
    tone:   "var(--highlight)",
    edge:   "color-mix(in oklab, var(--highlight) 70%, transparent)",
    legend: "the working state it has to reach · not in the tree yet · every row names its version",
  },
};

const MARK_ORDER: readonly RegisterState[] = ["built", "designed", "must-be"];

const CHIP =
  "inline-flex items-center align-middle shrink-0 whitespace-nowrap leading-none " +
  "rounded-[2px] border font-mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5";

/* The mark itself. Applied to every section header, every prose card, every
   diagram node. */
export function RegisterMark({
  state,
  className,
}: {
  state: "built" | "designed" | "must-be";
  className?: string;
}) {
  const m = MARKS[state];
  return (
    <span
      className={className ? `${CHIP} ${className}` : CHIP}
      style={{
        color: m.tone,
        background: m.fill,
        borderStyle: m.border,
        borderWidth: "1px",
        borderColor: m.edge,
      }}
    >
      <span aria-hidden>{m.label}</span>
      <span className="sr-only">{m.reader}</span>
    </span>
  );
}

/* The legend. Rendered exactly once, in section 1. Three lines teach the whole
   device: the mark, the border word that carries it, and what it claims. */
export function RegisterKey({
  commit = "eef103d",
  className,
}: {
  commit?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-5">
        <dl className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] gap-x-4 gap-y-2 sm:gap-y-3 items-baseline">
          {MARK_ORDER.map((state) => {
            const m = MARKS[state];
            return (
              <div key={state} className="contents">
                <dt className="col-start-1">
                  <RegisterMark state={state} />
                </dt>
                <dd className="col-start-2 font-mono text-[11px] text-[color:var(--fg)]/70 tracking-tight">
                  {m.border}
                </dd>
                <dd className="col-span-2 sm:col-span-1 sm:col-start-3 min-w-0 font-mono text-[11px] text-[color:var(--muted)] tracking-tight break-words">
                  {m.legend.replace("{commit}", commit)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        every claim on this page carries one mark · the border is the signal, the
        tone only repeats it
      </figcaption>
    </figure>
  );
}

/* The source annotation. Renders immediately after whatever it marks.
   A BUILT thing without one is a defect. */
export function Cite({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const base =
    "not-italic font-mono text-[11px] text-[color:var(--muted)] tracking-tight break-words";
  return <cite className={className ? `${base} ${className}` : base}>{source}</cite>;
}

/* Doc versus code. Hangs off a BUILT cite. The code is the truth and the doc
   claim is the defect, so the code line carries the readable weight. */
export function Drift({
  docSays,
  codeDoes,
  className,
}: {
  docSays: React.ReactNode;
  codeDoes: React.ReactNode;
  className?: string;
}) {
  const base = "border-l hairline pl-3 sm:pl-4 py-0.5";
  return (
    <div className={className ? `${base} ${className}` : base}>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.1em] leading-none"
        style={{ color: "var(--warning)" }}
      >
        drift
      </span>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-baseline">
        <dt className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight whitespace-nowrap">
          doc says
        </dt>
        <dd className="min-w-0 font-mono text-[11px] text-[color:var(--muted)] tracking-tight break-words">
          {docSays}
        </dd>
        <dt className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight whitespace-nowrap">
          code does
        </dt>
        <dd className="min-w-0 font-mono text-[11px] text-[color:var(--fg)]/85 tracking-tight break-words">
          {codeDoes}
        </dd>
      </dl>
    </div>
  );
}
