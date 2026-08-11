"use client";

import { motion, useReducedMotion } from "motion/react";
import { KernelTail } from "./kernel-tail";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section id="top" className="relative pt-14 sm:pt-20 pb-16 sm:pb-24">
      <div className="container-x grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start">
        {/* LEFT: manifesto */}
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.3, 0, 0.2, 1] }}
            className="chip"
          >
            <span className="chip-dot" />
            <span>Coconut Labs · pre-implementation</span>
          </motion.span>

          <h1 className="mt-7 sm:mt-9 font-mono leading-[0.96] tracking-[-0.018em] text-[clamp(2.6rem,6.8vw,5.6rem)] text-[color:var(--fg)]">
            <RevealWord delay={0.05}>Agents</RevealWord>{" "}
            <RevealWord delay={0.13}>as</RevealWord>{" "}
            <RevealWord delay={0.21}>first-class</RevealWord>
            <br />
            <RevealWord delay={0.31}>kernel</RevealWord>{" "}
            <RevealWord delay={0.39} accent>
              primitives.
            </RevealWord>
          </h1>

          <motion.p
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.3, 0, 0.2, 1] }}
            className="mt-7 max-w-[36rem] text-[17px] sm:text-[18px] xl:text-[19px] leading-[1.55] text-[color:var(--fg)]/85"
          >
            A Linux distribution where every agent gets an{" "}
            <span className="font-mono text-[color:var(--accent)]">AID</span>, a
            capability bundle, an attestation chain, and a row in the audit log,{" "}
            <span className="text-[color:var(--muted)]">
              the same way every process gets a PID today.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: [0.3, 0, 0.2, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <a
              href="#thesis"
              className="group inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[color:var(--fg)] text-[color:var(--canvas)] font-mono text-[13px] tracking-tight hover:opacity-90 transition-opacity duration-300"
            >
              Read the thesis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5" style={{ transitionTimingFunction: "var(--ease-precise)" }}>↓</span>
            </a>
            <a
              href="#spec"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border hairline font-mono text-[13px] tracking-tight text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors duration-300"
            >
              Browse the spec →
            </a>
          </motion.div>

          {/* metric strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            className="mt-12 grid grid-cols-3 gap-x-6 gap-y-2 border-t hairline pt-6 max-w-[36rem]"
          >
            <Stat k="Kernel surface" v="Linux 6.12 LTS, hard fork" />
            <Stat k="Team" v="Two engineers today" />
            <Stat k="Status" v="Spec phase · prototypes" />
          </motion.div>
        </div>

        {/* RIGHT: signature kernel tail */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.45, ease: [0.3, 0, 0.2, 1] }}
          className="relative"
        >
          <KernelTail />
          <p className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            simulation · drawn from{" "}
            <span className="text-[color:var(--fg)]/80">docs/05-LLD §9 audit-chain</span>{" "}
            · what `coconut-tail` looks like at first agent spawn
          </p>
        </motion.div>
      </div>

      {/* subtle ambient gradient bloom — only on light, never on the foreground text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[420px] -z-0 opacity-[0.45] dark:opacity-25"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 10%, color-mix(in oklab, var(--highlight) 22%, transparent), transparent 70%), radial-gradient(50% 40% at 80% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />
    </section>
  );
}

function RevealWord({
  children,
  delay = 0,
  accent = false,
}: {
  children: React.ReactNode;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: "0.35em" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.78, delay, ease: [0.3, 0, 0.2, 1] }}
      className={`inline-block ${accent ? "text-[color:var(--accent)]" : ""}`}
    >
      {children}
    </motion.span>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[color:var(--muted)]">
        {k}
      </div>
      <div className="mt-1 text-[13px] leading-snug text-[color:var(--fg)]">{v}</div>
    </div>
  );
}
