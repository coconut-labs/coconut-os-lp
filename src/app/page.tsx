// PAUSED HOLDING PAGE — 2026-08-25.
// The full landing page is preserved (git history + _PREPIVOT-ARCHIVE/app/page.tsx)
// and every section component still lives under src/components/. To restore the
// site, replace this file with _PREPIVOT-ARCHIVE/app/page.tsx and revert
// src/app/layout.tsx's metadata. Nothing has been deleted.

const wrap: React.CSSProperties = {
  minHeight: "100svh",
  display: "grid",
  placeItems: "center",
  padding: "40px 24px",
  textAlign: "center",
};

const card: React.CSSProperties = {
  maxWidth: "44ch",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
};

export default function Paused() {
  return (
    <main style={wrap}>
      <section style={card}>
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "light-dark(#2440CC, #7D93FF)",
            boxShadow: "0 0 0 6px light-dark(rgba(36,64,204,.16), rgba(125,147,255,.18))",
          }}
        />
        <h1
          style={{
            fontSize: "clamp(30px, 6vw, 44px)",
            letterSpacing: "-0.02em",
            margin: 0,
            color: "light-dark(#16161A, #ECECEF)",
          }}
        >
          Paused
        </h1>
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            margin: 0,
            color: "light-dark(#4A4A52, #A6A6B0)",
          }}
        >
          We&rsquo;re reworking what Coconut is. This page is on hold while we do —
          back soon, with something sharper.
        </p>
        <p
          style={{
            fontSize: "13px",
            margin: "6px 0 0",
            color: "light-dark(#7A7A84, #82828E)",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          <a
            href="https://coconutlabs.org"
            style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid currentColor" }}
          >
            Coconut Labs
          </a>
        </p>
      </section>
    </main>
  );
}
