"use client";

/* Shared layout for /specs/* sub-pages. Top nav with breadcrumb, hero header,
   children, bottom prev/next + back. Keeps the LP brand language intact. */

import { Nav } from "./nav";
import { StatusStrip } from "./status-strip";
import { Footer } from "./footer";
import { ScrollProgress } from "./scroll-progress";
import { SPECS } from "@/lib/spec-previews";
import { Reveal } from "./reveal";

export function SpecShell({
  slug,
  number,
  tag,
  title,
  blurb,
  children,
}: {
  slug: string;
  number: string;
  tag: string;
  title: React.ReactNode;
  blurb: React.ReactNode;
  children: React.ReactNode;
}) {
  const idx = SPECS.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? SPECS[idx - 1] : null;
  const next = idx >= 0 && idx < SPECS.length - 1 ? SPECS[idx + 1] : null;

  return (
    <main className="relative">
      <ScrollProgress />
      <Nav />
      <StatusStrip />

      <header className="relative pt-12 sm:pt-16 pb-10 sm:pb-14">
        <div className="container-x">
          <Reveal>
            <div className="flex items-center gap-3">
              <a href="/" className="font-mono text-[11.5px] tracking-tight text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-200">
                ← back to overview
              </a>
              <span className="font-mono text-[11px] text-[color:var(--muted)] opacity-50">/</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                spec § {number} · {tag}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-7 max-w-[52rem] text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.06] tracking-[-0.018em] font-mono">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[44rem] text-[17px] sm:text-[18px] xl:text-[19px] leading-[1.55] text-[color:var(--fg)]/85">
              {blurb}
            </p>
          </Reveal>
        </div>
        {/* soft bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 h-[360px] -z-0 opacity-40 dark:opacity-25"
          style={{
            background:
              "radial-gradient(50% 50% at 30% 20%, color-mix(in oklab, var(--highlight) 16%, transparent), transparent 70%), radial-gradient(40% 40% at 80% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)",
          }}
        />
      </header>

      <div className="container-x">
        <div className="border-t hairline" />
      </div>

      {children}

      <section className="border-t hairline py-12">
        <div className="container-x grid grid-cols-1 md:grid-cols-2 gap-3">
          {prev ? (
            <a
              href={`/specs/${prev.slug}`}
              className="group p-5 rounded-xl border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">← prev · spec § {prev.no}</div>
              <div className="mt-1.5 font-mono text-[14px] text-[color:var(--accent)] tracking-tight">{prev.name}</div>
              <div className="mt-1 text-[13.5px] text-[color:var(--fg)]/75 leading-snug">{prev.blurb.slice(0, 92)}…</div>
            </a>
          ) : <div />}
          {next ? (
            <a
              href={`/specs/${next.slug}`}
              className="group p-5 rounded-xl border hairline bg-[color:var(--canvas)] hover:bg-[color:var(--surface)] transition-colors duration-300 md:text-right"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">next · spec § {next.no} →</div>
              <div className="mt-1.5 font-mono text-[14px] text-[color:var(--accent)] tracking-tight">{next.name}</div>
              <div className="mt-1 text-[13.5px] text-[color:var(--fg)]/75 leading-snug">{next.blurb.slice(0, 92)}…</div>
            </a>
          ) : <div />}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export function Section({ title, eyebrow, children }: { title?: React.ReactNode; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="py-16 sm:py-24 border-t hairline first:border-t-0">
      <div className="container-x">
        {eyebrow && (
          <Reveal>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">{eyebrow}</div>
          </Reveal>
        )}
        {title && (
          <Reveal delay={0.05}>
            <h2 className="mt-3 max-w-[48rem] text-[clamp(1.7rem,3.3vw,2.65rem)] leading-[1.18] tracking-[-0.012em]">
              {title}
            </h2>
          </Reveal>
        )}
        <div className={`${title || eyebrow ? "mt-10" : ""}`}>{children}</div>
      </div>
    </section>
  );
}

export function LockedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 p-5 rounded-xl border hairline bg-[color:var(--surface)]/40">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--accent)]">held back</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{children}</p>
    </div>
  );
}
