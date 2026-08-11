"use client";

/* Six-layer Coconut OS stack — interactive: hover/focus a row to lift it slightly
   and reveal its components. Mobile collapses to a vertical reading order with
   row state expanded by default. */

import { useState } from "react";

type Layer = {
  n: string;
  name: string;
  tone: "muted" | "highlight" | "accent";
  short: string;
  parts: string[];
};

const LAYERS: Layer[] = [
  { n: "L5", name: "Brand + distribution",  tone: "muted",     short: "ISO build · signing · mirrors · marketing",
    parts: ["reproducible ISO build (x86_64 + ARM64)", "Coconut Labs GPG signing", "mirror network", "brand system"] },
  { n: "L4", name: "Showcase workloads",     tone: "muted",     short: "Dream Team · Coconut Studio",
    parts: ["Dream Team · 31-agent virtual eng org", "Coconut Studio · agent workbench"] },
  { n: "L3", name: "Shell + UX",             tone: "highlight", short: "Coconut Shell · Center · Terminal · DM",
    parts: ["Coconut Shell · Wayland compositor (Rust · Smithay)", "Coconut Center · Terminal · Display Manager"] },
  { n: "L2", name: "Inference substrate",    tone: "highlight", short: "kvwarden shipping · mlxd in research",
    parts: ["kvwarden · CUDA / x86_64", "mlxd · MLX / ARM64", "default brokers · integrated, not absorbed"] },
  { n: "L1", name: "System userspace",       tone: "accent",    short: "coconutd · coconutpkg · libcoconut",
    parts: ["coconutd · PID 1, agent supervisor (replaces systemd)", "coconutpkg · coconut-installer · coconutfs-tools", "libcoconut · userspace bindings"] },
  { n: "L0", name: "Kernel",                 tone: "accent",    short: "linux-6.12-coconut · agent-aware",
    parts: ["modified mm/ · fs/ · cred.c · sched/ · cgroup/", "new kernel/agent/ · kernel/audit/coconut/ · security/coconut/", "+8 syscalls forming the agent surface"] },
];

const TONE: Record<Layer["tone"], { bg: string; bd: string; tx: string }> = {
  muted:     { bg: "color-mix(in oklab, var(--canvas) 90%, var(--muted) 10%)",     bd: "color-mix(in oklab, var(--muted) 28%, transparent)",     tx: "var(--muted)" },
  highlight: { bg: "color-mix(in oklab, var(--canvas) 86%, var(--highlight) 14%)", bd: "color-mix(in oklab, var(--highlight) 42%, transparent)", tx: "var(--highlight)" },
  accent:    { bg: "color-mix(in oklab, var(--canvas) 84%, var(--accent) 16%)",    bd: "color-mix(in oklab, var(--accent) 50%, transparent)",    tx: "var(--accent)" },
};

export function LayerStack() {
  const [open, setOpen] = useState<string | null>("L0");

  return (
    <div className="relative">
      <ol className="space-y-2.5">
        {LAYERS.map((l) => {
          const tone = TONE[l.tone];
          const isOpen = open === l.n;
          return (
            <li key={l.n}>
              <button
                onClick={() => setOpen(isOpen ? null : l.n)}
                onMouseEnter={() => setOpen(l.n)}
                onFocus={() => setOpen(l.n)}
                aria-expanded={isOpen}
                className="group w-full text-left rounded-xl border transition-[transform,box-shadow,background] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
                style={{
                  background: tone.bg,
                  borderColor: tone.bd,
                  transform: isOpen ? "translateX(2px)" : "translateX(0)",
                  boxShadow: isOpen
                    ? `0 1px 0 ${tone.bd}, 0 18px 40px -22px color-mix(in oklab, var(--fg) 28%, transparent)`
                    : "none",
                  transitionTimingFunction: "var(--ease-precise)",
                }}
              >
                <div className="grid grid-cols-[60px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-3 sm:gap-5 items-center p-4 sm:p-5">
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-[12.5px] tracking-tight" style={{ color: tone.tx }}>{l.n}</span>
                    <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]/80">layer</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] tracking-tight text-[color:var(--fg)] leading-tight">{l.name}</div>
                    <div className="mt-1 font-mono text-[12px] text-[color:var(--muted)] leading-tight">{l.short}</div>
                  </div>
                  <div className="shrink-0 font-mono text-[18px] text-[color:var(--muted)] transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transitionTimingFunction: "var(--ease-precise)" }} aria-hidden>+</div>
                </div>
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-400"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    transitionTimingFunction: "var(--ease-precise)",
                  }}
                >
                  <div className="overflow-hidden">
                    <ul className="px-5 sm:px-7 pb-5 sm:pb-6 space-y-1.5 pt-1">
                      {l.parts.map((p) => (
                        <li key={p} className="font-mono text-[12.5px] leading-snug text-[color:var(--fg)]/80 break-words">
                          ↳ {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* a small annotation under */}
      <p className="mt-5 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        hover · focus · or tap a row · L0 + L1 are where Coconut OS does its work · L2 already ships
      </p>
    </div>
  );
}
