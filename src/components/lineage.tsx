"use client";

import { Reveal } from "./reveal";

const PROJECTS = [
  {
    name: "kvwarden",
    layer: "Layer 2 · x86 · CUDA",
    blurb: "Tenant-fair GPU inference broker. Show HN 2026-05-12. Cut starver tail 29× vs FIFO at A100 + vLLM 0.19.1.",
    href: "https://github.com/coconut-labs/kvwarden",
  },
  {
    name: "mlxd",
    layer: "Layer 2 · ARM · MLX",
    blurb: "Same fairness thesis on Apple Silicon NPUs. G3 launch 2026-06-09 → 06-16.",
    href: "https://github.com/coconut-labs/mlxd",
  },
  {
    name: "Dream Team",
    layer: "Layer 4 · showcase",
    blurb: "31-agent virtual engineering organisation. Existing Python codebase, ported to Coconut OS as the v1.0 hero workload.",
    href: "https://coconutlabs.org",
  },
];

export function Lineage() {
  return (
    <section className="relative py-20 sm:py-28 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            § 03·5 — From Coconut Labs
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[42rem] text-[clamp(1.4rem,3vw,2.1rem)] leading-[1.15] tracking-[-0.012em]">
            Coconut OS isn't a first attempt.{" "}
            <span className="text-[color:var(--muted)]">
              It is the OS layer above projects already shipping.
            </span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} amount={0.25}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group block h-full p-6 rounded-xl border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-mono text-[15px] text-[color:var(--accent)] tracking-tight">
                    {p.name}
                  </div>
                  <span className="font-mono text-[11px] text-[color:var(--muted)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ transitionTimingFunction: "var(--ease-precise)" }}>
                    open →
                  </span>
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {p.layer}
                </div>
                <p className="mt-4 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/85">
                  {p.blurb}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
