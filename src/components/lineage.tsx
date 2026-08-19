"use client";

import { Reveal } from "./reveal";

const PROJECTS = [
  {
    name: "kvwarden",
    layer: "Layer 2 · x86 · CUDA",
    blurb: "Tenant-fair GPU inference broker. v0.1.6 on PyPI. Token-bucket admission cut the starved tenant's p99 TTFT 26× vs FIFO, from 1,585 ms to 61.5 ms post-warmup, measured on one A100 with vLLM 0.19.1, n=311. Artifacts in the repo.",
    href: "https://github.com/coconut-labs/kvwarden",
    links: [
      { label: "github", href: "https://github.com/coconut-labs/kvwarden" },
      { label: "pypi", href: "https://pypi.org/project/kvwarden/" },
    ],
  },
  {
    name: "mlxd",
    layer: "Layer 2 · ARM · MLX",
    blurb: "The same fairness thesis on Apple Silicon. In research; measured results publish when the repo does.",
    href: "https://coconutlabs.org/projects",
    links: [{ label: "the lab's projects", href: "https://coconutlabs.org/projects" }],
  },
  {
    name: "Dream Team",
    layer: "Layer 4 · showcase",
    blurb: "A 31-agent virtual engineering organisation. Existing Python codebase, the planned v1.0 hero workload.",
    href: "https://coconutlabs.org",
    links: [{ label: "coconutlabs.org", href: "https://coconutlabs.org" }],
  },
];

export function Lineage() {
  return (
    <section className="relative py-20 sm:py-28 border-t hairline">
      <div className="container-x">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            From Coconut Labs
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-[42rem] text-[clamp(1.4rem,3vw,2.1rem)] leading-[1.15] tracking-[-0.03em]">
            The lab built the layer below this one first.{" "}
            <span className="text-[color:var(--muted)]">
              Coconut OS is the OS layer above the lab's existing projects.
            </span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} amount={0.25}>
              <div className="group flex flex-col h-full p-6 rounded-[2px] border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300">
                <div className="font-mono text-[15px] text-[color:var(--accent)] tracking-tight">
                  {p.name}
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {p.layer}
                </div>
                <p className="mt-4 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/85">
                  {p.blurb}
                </p>
                <div className="mt-auto pt-5 flex flex-wrap gap-x-4 gap-y-1">
                  {p.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-200"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-6 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            measured numbers live at{" "}
            <a
              href="https://coconutlabs.org/benchmarks"
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--accent)] hover:text-[color:var(--fg)] transition-colors duration-200"
            >
              coconutlabs.org/benchmarks
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
