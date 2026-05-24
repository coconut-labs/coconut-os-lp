"use client";

import { CoconutGlyph } from "./coconut-glyph";

export function Footer() {
  return (
    <footer className="relative pt-16 pb-12 border-t hairline">
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[color:var(--fg)]">
                <CoconutGlyph size={22} />
              </span>
              <span className="font-mono text-[14px] tracking-tight text-[color:var(--fg)]">
                Coconut OS
              </span>
            </div>
            <p className="mt-4 max-w-[26rem] text-[13.5px] leading-[1.55] text-[color:var(--fg)]/75">
              A Linux distribution where agents are first-class kernel primitives.
              Built at <a className="underline decoration-[color:var(--muted)] hover:decoration-[color:var(--fg)] underline-offset-4" href="https://coconutlabs.org">Coconut Labs</a>.
            </p>
            <p className="mt-4 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
              Coconut OS 1.0 ships 2027 Q4 · this site is the manifesto, not the product.
            </p>
          </div>

          <FooterCol title="Spec">
            <FooterLink href="/specs/thesis">Thesis</FooterLink>
            <FooterLink href="/specs/architecture">Architecture</FooterLink>
            <FooterLink href="/specs/security">Capabilities + audit</FooterLink>
            <FooterLink href="/specs/roadmap">Roadmap</FooterLink>
            <FooterLink href="/specs/team">Team + cadence</FooterLink>
          </FooterCol>

          <FooterCol title="Coconut Labs">
            <FooterLink href="https://coconutlabs.org">Lab home</FooterLink>
            <FooterLink href="https://github.com/coconut-labs/kvwarden">kvwarden</FooterLink>
            <FooterLink href="https://github.com/coconut-labs/coconut-os-lp">LP repo</FooterLink>
            <FooterLink href="https://github.com/coconut-labs">GitHub org</FooterLink>
          </FooterCol>

          <FooterCol title="More">
            <FooterLink href="#top">Top</FooterLink>
            <FooterLink href="#thesis">Thesis</FooterLink>
            <FooterLink href="#roadmap">Roadmap</FooterLink>
            <FooterLink href="#spec">Spec</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-16 pt-7 border-t hairline flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            © 2026 Coconut Labs · all things considered, mostly typography
          </p>
          <p className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            brand · sibling of <a className="hover:text-[color:var(--fg)]" href="https://coconutlabs.org">coconutlabs.org</a> warm-paper palette
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
        {title}
      </div>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="text-[13.5px] text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] transition-colors duration-200"
      >
        {children}
      </a>
    </li>
  );
}
