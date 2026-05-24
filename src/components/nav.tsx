"use client";

import { useEffect, useState } from "react";
import { CoconutGlyph } from "./coconut-glyph";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/specs/thesis",       label: "Thesis" },
  { href: "/specs/architecture", label: "Architecture" },
  { href: "/specs/security",     label: "Security" },
  { href: "/specs/roadmap",      label: "Roadmap" },
  { href: "/specs/team",         label: "Team" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[backdrop-filter,background-color,border-color] duration-300",
        scrolled
          ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--canvas)_72%,transparent)] border-b hairline"
          : "bg-transparent border-b border-transparent",
      )}
      style={{ transitionTimingFunction: "var(--ease-precise)" }}
    >
      <div className="container-x flex h-14 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group" aria-label="Coconut OS home">
          <span className="text-[color:var(--fg)] transition-transform duration-500 group-hover:rotate-[-8deg]" style={{ transitionTimingFunction: "var(--ease-precise)" }}>
            <CoconutGlyph size={20} />
          </span>
          <span className="font-mono text-[13px] tracking-[0.02em] text-[color:var(--fg)]">
            Coconut <span className="text-[color:var(--muted)]">OS</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12.5px] tracking-tight text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex chip" title="Coconut OS 1.0 ships 2027 Q4">
            <span className="chip-dot" />
            <span>v1.0 · 2027 Q4</span>
          </span>
          <a
            href="https://github.com/coconut-labs/coconut-os-lp"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] tracking-tight text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-300"
          >
            github →
          </a>
        </div>
      </div>
    </header>
  );
}
