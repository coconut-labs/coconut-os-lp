"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] pointer-events-none"
      style={{
        background:
          "linear-gradient(to right, var(--accent) 0%, var(--accent) " +
          pct * 100 +
          "%, transparent " +
          pct * 100 +
          "%, transparent 100%)",
        transition: "background 80ms linear",
      }}
    />
  );
}
