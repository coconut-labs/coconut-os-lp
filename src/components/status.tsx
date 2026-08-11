"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { SpecOverlay, type SpecPreview } from "./spec-overlay";
import { SPECS } from "@/lib/spec-previews";

export function Status() {
  const [open, setOpen] = useState<SpecPreview | null>(null);

  return (
    <section id="spec" className="relative py-24 sm:py-32 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 08 · The spec, in five rooms
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[44rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.12] tracking-[-0.03em]">
            Click any room for a preview.{" "}
            <span className="text-[color:var(--muted)]">
              Each opens a fuller page. The full spec drops when the set is locked.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[40rem] text-[15px] leading-[1.6] text-[color:var(--fg)]/85">
            Coconut OS does not exist yet. What exists is the spec: the why, the what, the when, the how. Five entry points cover the load-bearing surface. Some specifics are intentionally held back until the spec drop; the rest is here.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SPECS.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.04} amount={0.2}>
              <button
                onClick={() => setOpen(s)}
                className="group text-left h-full p-6 rounded-[2px] border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-[background,transform] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30 cursor-pointer"
                style={{ transitionTimingFunction: "var(--ease-precise)" }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-[0.08em]">
                    §{s.no}
                  </span>
                  <span className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">
                    {s.name}
                  </span>
                  <span className="ml-auto font-mono text-[12px] text-[color:var(--muted)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ transitionTimingFunction: "var(--ease-precise)" }}>
                    preview →
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {s.tag}
                </div>
                <p className="mt-4 text-[14px] leading-[1.55] text-[color:var(--fg)]/85">
                  {s.blurb}
                </p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-14 p-7 sm:p-9 rounded-[2px] border" style={{ borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)", background: "color-mix(in oklab, var(--canvas) 80%, var(--accent) 6%)" }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--accent)]">
                  Coming
                </div>
                <h3 className="mt-2 text-[20px] sm:text-[22px] tracking-tight text-[color:var(--fg)]">
                  Open progress, sprint by sprint.
                </h3>
                <p className="mt-3 max-w-[34rem] text-[14.5px] leading-[1.6] text-[color:var(--fg)]/85">
                  Open-progress reports land every two weeks. ISOs land when they're real. No early signups, no waitlists, no exclusivity.
                </p>
              </div>
              <a
                href="https://github.com/coconut-labs/coconut-os-lp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-11 px-[18px] rounded-[2px] bg-[color:var(--fg)] text-[color:var(--canvas)] font-mono text-[11.5px] uppercase tracking-[0.1em] hover:opacity-90 transition-opacity duration-300"
              >
                Watch the LP repo →
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <SpecOverlay open={!!open} spec={open} onClose={() => setOpen(null)} />
    </section>
  );
}
