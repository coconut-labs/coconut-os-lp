"use client";

/* Umbrella band. Coconut OS is one surface of Coconut Labs; the footer's job
   is the path back to the lab, the project page, the benchmarks, and the org.
   No date promises. */

import { CoconutGlyph } from "./coconut-glyph";

const UMBRELLA = [
  { label: "lab home", href: "https://coconutlabs.org" },
  { label: "project page", href: "https://coconutlabs.org/projects/coconut-os" },
  { label: "benchmarks", href: "https://coconutlabs.org/benchmarks" },
  { label: "masterclass", href: "https://masterclass.coconutlabs.org" },
  { label: "github", href: "https://github.com/coconut-labs" },
];

export function Footer() {
  return (
    <footer className="relative pt-12 pb-12 border-t hairline">
      <div className="container-x">
        <div className="flex items-center gap-2.5">
          <span className="text-[color:var(--fg)]">
            <CoconutGlyph size={20} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[color:var(--fg)]">
            coconut<span className="text-[color:var(--accent)]">OS</span>
          </span>
        </div>

        <p className="mt-5 text-[14px] leading-[1.55] text-[color:var(--fg)]/80">
          Coconut OS is one surface of Coconut Labs.
        </p>

        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Coconut Labs surfaces">
          {UMBRELLA.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11.5px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t hairline">
          <p className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            © 2026 Coconut Labs · this site is the manifesto, not the product.
          </p>
        </div>
      </div>
    </footer>
  );
}
