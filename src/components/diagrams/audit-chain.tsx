"use client";

/* Audit chain — tamper-evident hash chain rooted in TPM-NV. Each event
   carries chain_in / chain_out; the next event's chain_in is the previous
   chain_out. A single tampered byte breaks the entire forward chain. */

const NODES = [
  { ts: "1.881", ev: "agent_spawn",    aid: "a:00001", chain: "blake3:8c7e…b21a", tone: "muted"  },
  { ts: "1.883", ev: "cap_grant",      aid: "a:00001", chain: "blake3:42a1…0c91", tone: "muted"  },
  { ts: "2.046", ev: "cap_deny",       aid: "a:00017", chain: "blake3:1f3a…cc04", tone: "accent" },
  { ts: "2.047", ev: "audit_alert",    aid: "—",       chain: "blake3:9d20…fe18", tone: "highlight"  },
];

const TONE: Record<string, string> = {
  muted: "var(--muted)",
  accent: "var(--accent)",
  highlight: "var(--highlight)",
};

export function AuditChain() {
  return (
    <figure>
      <div className="rounded-2xl border hairline overflow-hidden bg-[color:var(--surface)]/40 p-5 sm:p-7">
        {/* TPM root */}
        <div className="flex items-center gap-3 mb-5">
          <div className="px-3 py-1.5 rounded-md font-mono text-[11px] tracking-tight" style={{
            background: "color-mix(in oklab, var(--canvas) 60%, var(--surface) 40%)",
            border: "1px dashed color-mix(in oklab, var(--fg) 28%, transparent)",
            color: "var(--muted)",
          }}>
            TPM-NV root
          </div>
          <span className="font-mono text-[11px] text-[color:var(--muted)]">→ initial chain head</span>
        </div>

        <ol className="space-y-1.5">
          {NODES.map((n, i) => (
            <li key={i} className="relative">
              {/* connector */}
              {i > 0 && (
                <div className="absolute -top-1.5 left-7 w-px h-1.5 bg-[color-mix(in_oklab,var(--fg)_28%,transparent)]" aria-hidden />
              )}
              <div
                className="grid grid-cols-[68px_14px_1fr_auto] sm:grid-cols-[68px_14px_1fr_auto_1fr] gap-2 sm:gap-4 items-center px-3 sm:px-4 py-2.5 rounded-lg border"
                style={{
                  background: "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
                  borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
                }}
              >
                <span className="font-mono text-[11px] text-[color:var(--muted)] tabular-nums">[{n.ts}]</span>
                <span className="block w-2 h-2 rounded-full" style={{ background: TONE[n.tone] }} />
                <span className="font-mono text-[12px] text-[color:var(--fg)]">
                  <span style={{ color: TONE[n.tone] }}>{n.ev}</span>
                  <span className="text-[color:var(--muted)] ml-2">aid={n.aid}</span>
                </span>
                <span className="hidden sm:block font-mono text-[10.5px] text-[color:var(--muted)] tracking-tight">
                  in
                </span>
                <span className="hidden sm:block font-mono text-[11px] text-[color:var(--accent)]/80 tracking-tight">
                  {n.chain}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Note tone="muted" label="appends" body="kernel-side · per-CPU FIFO" />
          <Note tone="accent" label="signs" body="coconutd at rotation · ed25519" />
          <Note tone="highlight" label="verifies" body="any reader · forward-replay" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        format · structure · rotation cadence all canonical · key ceremony details land with the security drop
      </figcaption>
    </figure>
  );
}

function Note({ tone, label, body }: { tone: "muted" | "accent" | "highlight"; label: string; body: string }) {
  return (
    <div className="p-3 rounded-lg" style={{
      background: "color-mix(in oklab, var(--canvas) 90%, var(--surface) 10%)",
      border: "1px solid color-mix(in oklab, var(--fg) 12%, transparent)",
    }}>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: TONE[tone] }}>{label}</div>
      <div className="mt-1 font-mono text-[11.5px] text-[color:var(--fg)]/80 leading-tight">{body}</div>
    </div>
  );
}
