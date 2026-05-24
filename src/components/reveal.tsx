"use client";

/* A single reveal primitive used across sections. Type-once-on-first-view —
   the line slides up 14px and fades in once, then never moves again.
   Honors prefers-reduced-motion. */

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
  amount?: number;
};

export function Reveal({
  children,
  delay = 0,
  y = 14,
  duration = 0.7,
  className,
  as = "div",
  once = true,
  amount = 0.3,
}: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.3, 0, 0.2, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealLines({
  lines,
  className,
  stagger = 0.06,
  startDelay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  stagger?: number;
  startDelay?: number;
}) {
  return (
    <>
      {lines.map((l, i) => (
        <Reveal key={i} delay={startDelay + i * stagger} className={className}>
          {l}
        </Reveal>
      ))}
    </>
  );
}
