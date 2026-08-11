"use client";

/* Kernel Tail — the signature.
   Live, monospaced journalctl-style stream that types itself. Agent events appear
   as first-class kernel events alongside systemd / udev / kernel lines, with the
   coconut accent (claret for caps, honey for grants, moss for audit-append).
   Pauses when out of viewport. Honors prefers-reduced-motion (no typing — full lines
   appear at once, with a slow fade). */

import { useEffect, useRef, useState } from "react";

type Tone = "fg" | "muted" | "accent" | "highlight" | "success" | "warning";

type Line = {
  ts: string;        // mono ts in "[ N.NNN]" form
  source: string;    // e.g. "kernel" | "systemd[1]" | "coconutd[847]"
  body: string;
  tone?: Tone;
  highlightSpan?: [number, number]; // optional [start,end] within `body` for accent
};

const TONE: Record<Tone, string> = {
  fg: "text-[color:var(--fg)]",
  muted: "text-[color:var(--muted)]",
  accent: "text-[color:var(--accent)]",
  highlight: "text-[color:var(--highlight)]",
  success: "text-[color:var(--success)]",
  warning: "text-[color:var(--warning)]",
};

const SCRIPT: Line[] = [
  { ts: "  0.000", source: "kernel",        body: "Linux 6.12.18-coconut #1 SMP PREEMPT_DYNAMIC", tone: "muted" },
  { ts: "  0.014", source: "kernel",        body: "Coconut LSM: capability-mediated access initialised", tone: "muted" },
  { ts: "  0.082", source: "kernel/agent",  body: "agent subsystem online · 8 syscalls registered", tone: "muted" },
  { ts: "  0.117", source: "kernel/audit",  body: "audit-chain root sealed via TPM-NV (blake3:8c7e…b21a)", tone: "success" },
  { ts: "  0.498", source: "systemd[1]",    body: "(skipped · coconutd is PID 1 on Coconut OS)", tone: "muted" },
  { ts: "  0.499", source: "coconutd[1]",   body: "PID 1 ready · supervising 0 agents · 0 caps held", tone: "fg" },
  { ts: "  1.204", source: "coconutd[1]",   body: "user maya@workstation authenticated · session opened", tone: "fg" },
  { ts: "  1.881", source: "coconutd[1]",   body: "agent_spawn  aid=a:00001  class=dream-team-coord", tone: "accent" },
  { ts: "  1.882", source: "kernel/agent",  body: "AID a:00001 attested · manifest sig OK (ed25519)", tone: "success" },
  { ts: "  1.883", source: "kernel/agent",  body: "caps granted to a:00001: fs.read(/home/maya/dream/*), net.connect(api.kvwarden.local:443)", tone: "muted" },
  { ts: "  1.901", source: "coconutd[1]",   body: "spawned 31 child agents under a:00001 · fair-share lane: tenant-maya", tone: "accent" },
  { ts: "  2.046", source: "kernel/agent",  body: "a:00017 requested fs.read(/home/maya/.ssh/id_ed25519)", tone: "warning" },
  { ts: "  2.046", source: "kernel/coconut", body: "DENIED a:00017 → -ECAPABILITY (no fs.read on ~/.ssh)", tone: "accent" },
  { ts: "  2.047", source: "kernel/audit",  body: "audit append · ev=cap_deny · chain=blake3:1f3a…cc04", tone: "highlight" },
  { ts: "  2.301", source: "kvwarden",      body: "admission: 4 tenants · maya@50% budget · p99/p50=1.18×", tone: "muted" },
  { ts: "  2.412", source: "coconut-center",body: "notification → 'cap_deny on a:00017 · review attempt?'", tone: "highlight" },
  { ts: "  3.000", source: "coconutd[1]",   body: "steady state · 32 agents active · 0.41 GB HBM · 12.3 W", tone: "muted" },
];

const TYPING_CHAR_MS = 6;     // mean ms per char during typewriter
const TYPING_JITTER = 4;      // +/- jitter
const LINE_PAUSE_MS = 110;    // pause between lines
const MAX_VISIBLE = 11;       // rolling buffer height (rows)

function jitteredDelay() {
  return TYPING_CHAR_MS + (Math.random() * 2 - 1) * TYPING_JITTER;
}

export function KernelTail() {
  const [printed, setPrinted] = useState<Array<{ line: Line; partialLen: number; key: number }>>([]);
  const [cursorOn, setCursorOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduceMotionRef = useRef(false);
  const visibleRef = useRef(true);
  const pausedRef = useRef(false);
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const keyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Pause/resume when out of viewport
  useEffect(() => {
    if (!rootRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.12 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn((c) => !c), 520);
    return () => clearInterval(id);
  }, []);

  // The driver
  useEffect(() => {
    let cancelled = false;

    function trim(arr: typeof printed) {
      return arr.length > MAX_VISIBLE ? arr.slice(arr.length - MAX_VISIBLE) : arr;
    }

    function tick() {
      if (cancelled) return;
      if (!visibleRef.current || pausedRef.current) {
        timerRef.current = setTimeout(tick, 220);
        return;
      }

      const reduced = reduceMotionRef.current;
      const i = indexRef.current % SCRIPT.length;
      const line = SCRIPT[i];

      if (reduced) {
        // Just push the whole line, slow fade via CSS, then next.
        setPrinted((p) => trim([...p, { line, partialLen: line.body.length, key: keyRef.current++ }]));
        indexRef.current = i + 1;
        charRef.current = 0;
        timerRef.current = setTimeout(tick, 380);
        return;
      }

      if (charRef.current === 0) {
        // Start a new line — push the line with 0 chars typed yet
        setPrinted((p) => trim([...p, { line, partialLen: 0, key: keyRef.current++ }]));
      }

      if (charRef.current < line.body.length) {
        charRef.current += 1;
        setPrinted((p) => {
          const next = [...p];
          const last = next[next.length - 1];
          if (last) next[next.length - 1] = { ...last, partialLen: charRef.current };
          return trim(next);
        });
        timerRef.current = setTimeout(tick, jitteredDelay());
      } else {
        // Line done, pause then advance.
        indexRef.current = i + 1;
        charRef.current = 0;
        timerRef.current = setTimeout(tick, LINE_PAUSE_MS);
      }
    }

    timerRef.current = setTimeout(tick, 220);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // we deliberately don't depend on `printed` — it's driven via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setPause(p: boolean) {
    pausedRef.current = p;
    setPaused(p);
  }

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)}
      onBlur={() => setPause(false)}
      tabIndex={0}
      className="group relative rounded-[2px] border hairline overflow-hidden cursor-default outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
      style={{
        background:
          "color-mix(in oklab, var(--canvas) 60%, var(--surface) 40%)",
      }}
      aria-label="Live simulation of the Coconut OS kernel event stream. Hover to pause."
    >
      {/* terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b hairline bg-[color:var(--surface)]">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 55%, var(--canvas))" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--highlight) 55%, var(--canvas))" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--success) 55%, var(--canvas))" }} />
        <span className="ml-2 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
          coconut-tail · /var/log/coconut/kernel
        </span>
        <span className="ml-auto chip !text-[10px]">
          <span
            className="chip-dot"
            style={paused ? { animation: "none", background: "var(--highlight)" } : undefined}
          />
          {paused ? "paused" : "live"}
        </span>
      </div>

      {/* the stream */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 font-mono text-[11.5px] sm:text-[12.5px] leading-[1.55] min-h-[300px] sm:min-h-[360px]">
        {printed.map(({ line, partialLen, key }, idx) => {
          const isLast = idx === printed.length - 1;
          const text = line.body.slice(0, partialLen);
          return (
            <div
              key={key}
              className="grid grid-cols-[auto_auto_1fr] gap-3 sm:gap-4 items-baseline whitespace-pre-wrap break-words"
            >
              <span className="text-[color:var(--muted)] opacity-75 tabular-nums">[{line.ts}]</span>
              <span className="text-[color:var(--muted)]">{line.source}:</span>
              <span className={TONE[line.tone ?? "fg"]}>
                {text}
                {isLast && (
                  <span
                    className="inline-block w-[6px] h-[12px] sm:h-[13px] align-[-1px] ml-[1px] -mb-[1px]"
                    style={{
                      background: cursorOn ? "var(--fg)" : "transparent",
                      transition: "background 60ms linear",
                    }}
                    aria-hidden
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
