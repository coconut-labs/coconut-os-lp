"use client";

/* /agent — the agentfs inspector tree. Like /proc but agent-aware.
   Public preview shows the directory shape + per-file purpose; the
   exact file formats and ioctl surface land in the LLD drop. */

type Node = {
  name: string;
  kind: "dir" | "file" | "link";
  desc?: string;
  tone?: "accent" | "highlight" | "muted" | "success";
  children?: Node[];
};

const TREE: Node = {
  name: "/agent",
  kind: "dir",
  children: [
    {
      name: "live",
      kind: "dir",
      desc: "every agent currently in a non-terminal state",
      children: [
        {
          name: "a:00001",
          kind: "dir",
          desc: "Dream Team coordinator · the parent",
          tone: "accent",
          children: [
            { name: "status",        kind: "file", desc: "current state · READY | ACTIVE | INF_BLOCKED | …", tone: "muted" },
            { name: "manifest",      kind: "file", desc: "spawn-time signed manifest · Ed25519",              tone: "muted" },
            { name: "caps",          kind: "file", desc: "bound capability bundle · readable, append via syscall", tone: "accent" },
            { name: "attestation/",  kind: "dir",  desc: "chain JSON · parent AID · authorizer pubkey",       tone: "muted" },
            { name: "audit/",        kind: "dir",  desc: "per-agent tail of the global chain",                 tone: "highlight" },
            { name: "budget/",       kind: "dir",  desc: "cpu · ram · hbm · net · inference_tokens",          tone: "muted" },
            { name: "children/",     kind: "dir",  desc: "delegated sub-agents (a:00002 … a:00031)",          tone: "muted" },
          ],
        },
        { name: "a:00017", kind: "dir", desc: "child agent · cap_deny event surfaced 2.046s", tone: "highlight" },
        { name: "…",       kind: "link",desc: "29 more under a:00001", tone: "muted" },
      ],
    },
    {
      name: "audit",
      kind: "dir",
      desc: "system-wide tamper-evident chain",
      children: [
        { name: "chain.log",     kind: "file", desc: "JSON-lines · BLAKE3-hashed · append-only",      tone: "accent" },
        { name: "head",          kind: "file", desc: "current chain head (32 bytes) · re-readable",   tone: "muted" },
        { name: "tpm_root",      kind: "file", desc: "sealed seed · readable only via syscall",       tone: "success" },
        { name: "rotated/",      kind: "dir",  desc: "older shards · zstd-compressed",                 tone: "muted" },
      ],
    },
    {
      name: "policy",
      kind: "dir",
      desc: "operator-side cap templates and broker quotas",
      children: [
        { name: "caps/",         kind: "dir",  desc: "named templates (workstation, server, indie-saas)", tone: "muted" },
        { name: "tenants/",      kind: "dir",  desc: "per-tenant fair-share lane configs",                tone: "muted" },
      ],
    },
    {
      name: "graveyard",
      kind: "dir",
      desc: "terminated agents · audit-only retention",
      children: [
        { name: "a:00000",       kind: "dir",  desc: "system boot agent · terminated-clean",          tone: "muted" },
      ],
    },
  ],
};

const TONE: Record<string, string> = {
  accent:    "var(--accent)",
  highlight: "var(--highlight)",
  muted:     "var(--muted)",
  success:   "var(--success)",
};

export function AgentFS() {
  return (
    <figure>
      <div className="rounded-[2px] border hairline overflow-hidden">
        {/* chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b hairline bg-[color:var(--surface)]">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 55%, var(--canvas))" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--highlight) 55%, var(--canvas))" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--success) 55%, var(--canvas))" }} />
          <span className="ml-2 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
            coconut tree /agent · agentfs inspector
          </span>
        </div>

        <div className="p-4 sm:p-6 font-mono text-[12px] sm:text-[12.5px] leading-[1.65] bg-[color:var(--canvas)]">
          <TreeView node={TREE} depth={0} isLast={true} prefix="" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        /agent is to agents what /proc is to processes · file formats + ioctl surface pin in the LLD drop
      </figcaption>
    </figure>
  );
}

function TreeView({ node, depth, isLast, prefix }: { node: Node; depth: number; isLast: boolean; prefix: string }) {
  const isRoot = depth === 0;
  const branch = isRoot ? "" : isLast ? "└─ " : "├─ ";
  const tone = node.tone ? TONE[node.tone] : "var(--fg)";
  const nameColor = node.kind === "dir" ? tone : "var(--fg)";
  const nameSuffix = node.kind === "dir" && !node.name.endsWith("/") ? "/" : "";

  return (
    <>
      <div className="flex items-baseline whitespace-pre">
        <span className="text-[color:var(--muted)] select-none">{prefix}{branch}</span>
        <span style={{ color: nameColor }}>{node.name}{nameSuffix}</span>
        {node.desc && (
          <span className="ml-3 text-[color:var(--muted)] text-[11.5px] leading-tight">
            <span className="opacity-50">·</span> {node.desc}
          </span>
        )}
      </div>
      {node.children?.map((child, i) => {
        const childIsLast = i === node.children!.length - 1;
        const nextPrefix = isRoot ? "" : prefix + (isLast ? "   " : "│  ");
        return (
          <TreeView
            key={child.name}
            node={child}
            depth={depth + 1}
            isLast={childIsLast}
            prefix={nextPrefix}
          />
        );
      })}
    </>
  );
}
