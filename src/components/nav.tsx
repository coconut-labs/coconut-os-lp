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
        <a href="/" className="flex items-center gap-2.5 group" aria-label="Coconut OS home">
          <span className="text-[color:var(--fg)] transition-transform duration-500 group-hover:rotate-[-8deg]" style={{ transitionTimingFunction: "var(--ease-precise)" }}>
            <CoconutGlyph size={20} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[color:var(--fg)]">
            coconut<span className="text-[color:var(--accent)]">OS</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

      </div>
    </header>
  );
}
