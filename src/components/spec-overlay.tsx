"use client";

/* Glassy preview overlay. Click a spec card → this slides into view with a quick
   read; "Read more →" links to the dedicated sub-page. Backdrop blur, translucent house surface, ESC + click-outside to close, focus-trap on the dialog. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export type SpecPreview = {
  slug: string;
  no: string;
  name: string;
  tag: string;             // "Why" / "What" / "How" etc.
  blurb: string;
  bullets: string[];
  status: string;          // small footer note, e.g. "spec lockdown · v0.1 drop pending"
};

export function SpecOverlay({
  open,
  spec,
  onClose,
}: {
  open: boolean;
  spec: SpecPreview | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Initial focus
  useEffect(() => {
    if (open && panelRef.current) {
      const t = setTimeout(() => panelRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && spec && (
        <motion.div
          key="spec-overlay"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.3, 0, 0.2, 1] }}
        >
          {/* backdrop */}
          <button
            aria-label="Close overlay"
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-md cursor-default"
            style={{
              background:
                "color-mix(in oklab, var(--canvas) 30%, transparent)",
            }}
          />

          {/* panel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spec-overlay-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.3, 0, 0.2, 1] }}
            className="relative w-full sm:w-[min(640px,calc(100vw-2rem))] mx-3 sm:mx-0 mb-3 sm:mb-0 rounded-[2px] sm:rounded-[2px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
            style={{
              background:
                "color-mix(in oklab, var(--canvas) 84%, var(--surface) 16%)",
              boxShadow:
                "0 1px 0 color-mix(in oklab, var(--fg) 12%, transparent), 0 28px 80px -20px color-mix(in oklab, var(--fg) 28%, transparent)",
              border: "1px solid color-mix(in oklab, var(--fg) 12%, transparent)",
              backdropFilter: "saturate(140%)",
            }}
          >
            {/* top hairline + close */}
            <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4 border-b hairline">
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-[0.08em]">
                  §{spec.no}
                </span>
                <span className="font-mono text-[14px] text-[color:var(--accent)] tracking-tight">
                  {spec.name}
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  · {spec.tag}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-[2px] text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* body */}
            <div className="px-6 sm:px-8 py-7 sm:py-9">
              <h3 id="spec-overlay-title" className="text-[clamp(1.45rem,3vw,1.85rem)] leading-[1.15] tracking-[-0.03em] text-[color:var(--fg)]">
                {spec.blurb}
              </h3>

              <ul className="mt-7 space-y-3.5">
                {spec.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                    <span className="text-[14.5px] leading-[1.55] text-[color:var(--fg)]/90">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* footer */}
            <div className="px-6 sm:px-8 py-4 border-t hairline flex items-center justify-between gap-3 bg-[color:var(--surface)]/60">
              <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
                {spec.status}
              </span>
              <a
                href={`/specs/${spec.slug}`}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[2px] bg-[color:var(--fg)] text-[color:var(--canvas)] font-mono text-[11px] uppercase tracking-[0.1em] hover:opacity-90 transition-opacity duration-200"
              >
                Read more
                <span aria-hidden>→</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
