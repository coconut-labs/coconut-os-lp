"use client";

/* The ABI on the wire. Six uapi structs that cross the syscall boundary,
   field by field, with the byte offset of every field, the span the MAC
   covers, the fields the kernel accepts and never reads, and the
   compile-time assert that pins each layout.

   Every field, offset, size and constant here is read from the tree at
   origin/main eef103d. Nothing on this figure is inferred. */

import { useEffect, useRef, useState } from "react";

import { Cite, Drift, RegisterMark } from "@/components/register";

type Field = {
  offset: number;
  size: number;
  type: string;
  name: string;
  /** the kernel accepts this field and never reads it */
  dead?: boolean;
  /** explicit reserved slot */
  reserved?: boolean;
  note?: string;
};

type StructSpec = {
  id: string;
  /** where the bytes go, and in which direction */
  used: string;
  bytes: string;
  cite: string;
  lockKind: "kernel" | "userspace mirror only";
  locks: string[];
  /** signed prefix of the fixed header, in bytes: [0, to) */
  signed?: { to: number; label: string; cite: string };
  fields: Field[];
  notes: string[];
  trailing?: { title: string; lines: string[] };
  drift?: { docSays: string; codeDoes: string };
};

const STRUCTS: StructSpec[] = [
  {
    id: "agent_spawn_args",
    used: "in · agent_spawn (472) · one unconditional copy_from_user of sizeof(kargs)",
    bytes: "656 bytes",
    cite: "include/uapi/linux/agent.h:46-65",
    lockKind: "userspace mirror only",
    locks: [
      "_Static_assert on sizeof plus a per-field offsetof sweep, in the userspace mirror · tools/coconut/libcoconut/abi_crosscheck.c:26-50",
      "nothing in the kernel pins sizeof(struct agent_spawn_args) or any field offset. the one BUILD_BUG_ON that names the struct compares kargs.name[64] against struct agent's name[64] and nothing else · kernel/agent/syscalls.c:235",
    ],
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version", note: "must be 1 · kernel/agent/syscalls.c:188-189" },
      { offset: 4, size: 4, type: "__u32", name: "flags", note: "unknown bits rejected -EINVAL, so userspace can probe · kernel/agent/syscalls.c:191-192" },
      { offset: 8, size: 8, type: "__u64", name: "parent_id" },
      { offset: 16, size: 64, type: "char", name: "name[64]", note: "must contain a NUL · kernel/agent/syscalls.c:201-202" },
      { offset: 80, size: 256, type: "char", name: "image_path[256]", note: "NUL checked at kernel/agent/syscalls.c:203-204, then not among the fields written to struct agent at :228-249" },
      { offset: 336, size: 256, type: "char", name: "workdir[256]", note: "NUL checked at kernel/agent/syscalls.c:205-206, then not among the fields written to struct agent at :228-249" },
      { offset: 592, size: 4, type: "__u32", name: "argc", note: "non-zero rejected -EINVAL · kernel/agent/syscalls.c:213-214" },
      { offset: 596, size: 4, type: "__u32", name: "envc", note: "non-zero rejected -EINVAL · kernel/agent/syscalls.c:213-214" },
      { offset: 600, size: 4, type: "__u32", name: "initial_cap_count", note: "non-zero rejected -EINVAL · kernel/agent/syscalls.c:213-214" },
      { offset: 604, size: 4, type: "__u32", name: "trailing_size", note: "bounded by COCONUT_SPAWN_TRAILING_MAX_V1, which is literally 0 · kernel/agent/syscalls.c:110, :215-216" },
      { offset: 608, size: 8, type: "__u64", name: "initial_tokens", dead: true, note: "never read on the spawn path · kernel/agent/syscalls.c:228-249" },
      { offset: 616, size: 8, type: "__u64", name: "refill_per_sec", note: "consumed, but written into agent->quota.spawn_rate, an agents-per-second u32 field, with a u64 to u32 truncation · kernel/agent/syscalls.c:248" },
      { offset: 624, size: 8, type: "__u64", name: "mem_tier_hbm_max", dead: true, note: "never read on the spawn path · kernel/agent/syscalls.c:228-249" },
      { offset: 632, size: 8, type: "__u64", name: "mem_tier_dram_max", dead: true, note: "never read on the spawn path · kernel/agent/syscalls.c:228-249" },
      { offset: 640, size: 8, type: "__u64", name: "mem_tier_ssd_max", dead: true, note: "never read on the spawn path · kernel/agent/syscalls.c:228-249" },
      { offset: 648, size: 8, type: "__u64", name: "cookie" },
    ],
    notes: [
      "Field sum is 656. Eight-byte aligned, no implicit padding, no reserved field on this struct.",
      "Nothing here is signed. 472 runs no crypto and no capability check of any kind · kernel/agent/syscalls.c:170-320.",
      "A v1 agent cannot carry initial capabilities. The trailing region that would hold them has a maximum size of zero.",
    ],
  },
  {
    id: "attestation",
    used: "out · agent_attest (473) · copy_to_user of the whole struct",
    bytes: "168 bytes",
    cite: "include/uapi/linux/agent.h:144-157",
    lockKind: "kernel",
    locks: [
      "BUILD_BUG_ON(sizeof(kout.signature) != 64) · kernel/agent/syscalls.c:483",
      "BUILD_BUG_ON(offsetof(struct attestation, signature) != AGENT_ATTESTATION_SIG_SCOPE_VER1) · kernel/agent/syscalls.c:484-485. AGENT_ATTESTATION_SIG_SCOPE_VER1 is sizeof minus 64 at include/uapi/linux/agent.h:184-185, so this pins signature[64] as the trailing field, not the literal 104. No assert in the kernel pins sizeof(struct attestation) == 168. The BUILD_BUG_ON reaches sizeof through the macro but only to locate the tail, so 168 itself is nowhere fixed; the cap_token, cap_proof and cap_revoke_args asserts at kernel/agent/cap_token.c:84-93 do reach literals, through the macros at include/uapi/linux/coconut_cap_token.h:256-260.",
      "sizeof plus a per-field offsetof sweep in the userspace mirror · tools/coconut/libcoconut/abi_crosscheck.c:26-30, :53-66",
    ],
    signed: {
      to: 104,
      label: "keyed MAC over bytes [0, 104). AGENT_ATTESTATION_SIG_SCOPE_VER1 is sizeof minus 64, so the scope is defined by the tail rather than by a literal.",
      cite: "kernel/agent/syscalls.c:483-488 · kernel/agent/issuer.c:229-234",
    },
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version" },
      { offset: 4, size: 4, type: "__u32", name: "flags", note: "ATTEST_FLAG__ALL is 0. Pure forward-compat headroom, and it replaced the LLD v0.x _pad slot · include/uapi/linux/agent.h:159-168" },
      { offset: 8, size: 8, type: "__u64", name: "agent_id" },
      { offset: 16, size: 8, type: "__u64", name: "created_ns" },
      { offset: 24, size: 8, type: "__u64", name: "attest_ns" },
      { offset: 32, size: 32, type: "__u8", name: "chain_root[32]", note: "memset to zero at v1 · TODO STORY-K-9.1 · kernel/agent/syscalls.c:466-467" },
      { offset: 64, size: 8, type: "__u64", name: "events_count", note: "hardcoded 0 at v1 · TODO STORY-K-9.1 · kernel/agent/syscalls.c:468-469" },
      { offset: 72, size: 32, type: "__u8", name: "issuer_pubkey[32]" },
      { offset: 104, size: 64, type: "__u8", name: "signature[64]", note: "the unsigned tail. BLAKE2b-512 keyed with a per-boot kernel-resident secret, so it is a MAC and no userspace party can verify it · kernel/agent/syscalls.c:487-488 · kernel/agent/issuer.c:229-264" },
    ],
    notes: [
      "Field sum is 168. No padding.",
      "473 can hand back a cryptographically valid attestation with a non-zero return. The code says so at kernel/agent/syscalls.c:527-543 and tells userspace to treat the return code as authoritative.",
    ],
    drift: {
      docSays: "include/uapi/linux/agent.h:112 · Layout (132 bytes total)",
      codeDoes: "the field sum is 168, and include/uapi/linux/agent.h:135 in the same comment block says total: 168 bytes, so the block contradicts itself. No kernel assert pins the size. kernel/agent/syscalls.c:484-485 pins offsetof(signature) == sizeof minus 64, which 104 and 168 satisfy, and so would any layout with a 64-byte tail. 132 is wrong.",
    },
  },
  {
    id: "quota_set",
    used: "in · agent_quota (474) · the capability check runs before the copy_from_user, the reverse of 475 and 476, which copy first and check after",
    bytes: "40 bytes",
    cite: "include/uapi/linux/agent.h:215-222",
    lockKind: "userspace mirror only",
    locks: [
      "sizeof plus per-field offsetof asserts in the userspace mirror · tools/coconut/libcoconut/abi_crosscheck.c:26-30, :69-76",
      "no kernel-side layout assert. inside the kernel no static_assert and no BUILD_BUG_ON names struct quota_set; the only one that does is the mirror's, above",
    ],
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version", note: "must be 1 · kernel/agent/syscalls.c:609-610" },
      { offset: 4, size: 4, type: "__u32", name: "fields_mask", note: "TOKENS 1<<0 · TOKENS_MAX 1<<1 · REFILL 1<<2 · WINDOW 1<<3 · include/uapi/linux/agent.h:228-231. Unknown bits rejected -EINVAL at kernel/agent/syscalls.c:616-617. An empty mask is an accepted no-op by design · :619-625" },
      { offset: 8, size: 8, type: "__u64", name: "tokens" },
      { offset: 16, size: 8, type: "__u64", name: "tokens_max" },
      { offset: 24, size: 8, type: "__u64", name: "refill_per_sec" },
      { offset: 32, size: 8, type: "__u64", name: "window_ns" },
    ],
    notes: [
      "A mask instead of sentinel values, because tokens=0 and refill_per_sec=0 are both legitimate settings. The header says so at include/uapi/linux/agent.h:209-213.",
      "All four values land on struct agent under state_lock at kernel/agent/syscalls.c:644-653. No code deducts or refills them: across the whole tree the four fields appear only at their declarations, kernel/agent/agent.h:216-219, and at those four assignments. kernel/agent/agent.h:203-204 and :210-211 route the enforcement to STORY-K-2.7.",
      "No ceiling on any of the four u64 values, and no tokens versus tokens_max consistency check. The file says both in its own words · kernel/agent/syscalls.c:579-582, :639-653.",
      "474 returns 0 unconditionally on the non-error path, so userspace learns nothing about what was applied · kernel/agent/syscalls.c:593, :665.",
    ],
  },
  {
    id: "cap_token",
    used: "in · agent_cap_grant (475) · the 152-byte header is read first, then each trailing record is walked one at a time",
    bytes: "152-byte header plus trailing records",
    cite: "include/uapi/linux/coconut_cap_token.h:81-98",
    lockKind: "kernel",
    locks: [
      "static_assert(sizeof(struct cap_token) == CAP_TOKEN_HEADER_SIZE_VER1) · kernel/agent/cap_token.c:84-85. the macro is the literal 152 at include/uapi/linux/coconut_cap_token.h:256",
      "static_assert(offsetof(struct cap_token, signature) == CAP_TOKEN_SIG_SCOPE_VER1) · :86-87. that macro is the literal 88 at include/uapi/linux/coconut_cap_token.h:257",
    ],
    signed: {
      to: 88,
      label: "MAC covers the 21-byte domain string COCONUT-CAP-TOKEN-V1, then header bytes [0, 88), then the whole trailing span [152, 152+span) including the inter-record zero pad. The 32-byte issuer secret is suffixed. Sign and verify run the byte-identical walk.",
      cite: "kernel/agent/cap_token.c:68-74 · verify at :242-288 versus sign at :393-430",
    },
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version", note: "le32, must be 1 · kernel/agent/cap_token.c:189-190" },
      { offset: 4, size: 4, type: "__u32", name: "cap_id" },
      { offset: 8, size: 8, type: "__u64", name: "agent_id", note: "the grantee" },
      { offset: 16, size: 8, type: "__u64", name: "issued_ns" },
      { offset: 24, size: 8, type: "__u64", name: "expires_ns", note: "0 means never. Checked against ktime_get_real_ns, so this field is CLOCK_REALTIME absolute · kernel/agent/cap_token.c:221-226" },
      { offset: 32, size: 4, type: "__u32", name: "flags", note: "DELEGABLE 1<<0 · REVOCABLE 1<<1 · AUDIT 1<<2 · include/uapi/linux/coconut_cap_token.h:196-202" },
      { offset: 36, size: 4, type: "__u32", name: "constraint_count", note: "CAP_TOKEN_MAX_CONSTRAINTS is 64 at include/uapi/linux/coconut_cap_token.h:266 · rejected -EBADMSG above that · kernel/agent/cap_token.c:199-200" },
      { offset: 40, size: 16, type: "__u8", name: "nonce[16]" },
      { offset: 56, size: 32, type: "__u8", name: "issuer_pubkey[32]", note: "one constant-time compare against a single per-boot value · generated at kernel/agent/issuer.c:134-154, compared at :266-288" },
      { offset: 88, size: 64, type: "__u8", name: "signature[64]", note: "the unsigned tail, and the end of the fixed header at byte 152" },
    ],
    trailing: {
      title: "trailing records, from byte 152",
      lines: [
        "struct cap_constraint { __u16 kind@0 · __u16 len@2 · __u8 value[]@4 } · include/uapi/linux/coconut_cap_token.h:103 · :113-117",
        "len is the value byte length and must be a multiple of 8. The pad bytes are inside the MAC · include/uapi/linux/coconut_cap_token.h:104-107 · enforced at kernel/agent/cap_token.c:127-129",
        "kinds: TIME_WINDOW 0x0001 · USAGE_COUNT 0x0002 · NET_HOST_ALLOW 0x0010 · NET_PORT_RANGE 0x0011 · FILE_PATH_PREFIX 0x0020 · include/uapi/linux/coconut_cap_token.h:209-213",
        "cap_token declares no flexible array member for them. The kernel walks the records by hand · include/uapi/linux/coconut_cap_token.h:92-97 · kernel/agent/cap_token.c:110-143",
        "CAP_TOKEN_TOTAL_MAX = 152 + 64 * (4 + 264) = 17304 bytes, the bound on one grant copy-in. The 264 is 256 path bytes plus 8 pad, sized for FILE_PATH_PREFIX · kernel/agent/syscalls.c:113-126",
      ],
    },
    notes: [
      "All multi-byte fields are little-endian on the wire and are read through le32_to_cpu and its siblings.",
      "len must equal 152 plus the walked span exactly. There is no trailing unsigned slack · kernel/agent/cap_token.c:208-218.",
      "The kernel does structural validation only at this story. Constraint semantics are routed to EPIC-K-8, so no constraint value changes a decision today.",
    ],
  },
  {
    id: "cap_proof",
    used: "in and out · agent_cap_present (477) · copied in to preserve the caller's nonce, then copied back",
    bytes: "136 bytes",
    cite: "include/uapi/linux/coconut_cap_token.h:146-154",
    lockKind: "kernel",
    locks: [
      "static_assert(sizeof(struct cap_proof) == CAP_PROOF_SIZE_VER1) · kernel/agent/cap_token.c:88-89. the macro is the literal 136 at include/uapi/linux/coconut_cap_token.h:258",
      "static_assert(offsetof(struct cap_proof, signature) == CAP_PROOF_SIG_SCOPE_VER1) · :90-91. that macro is the literal 72 at include/uapi/linux/coconut_cap_token.h:259",
    ],
    signed: {
      to: 72,
      label: "MAC covers the 21-byte domain string COCONUT-CAP-PROOF-V1, then bytes [0, 72). CAP_PROOF_SIG_SCOPE_VER1 is 72.",
      cite: "kernel/agent/cap_token.c:69-76 · :304-341 · include/uapi/linux/coconut_cap_token.h:258-259",
    },
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version" },
      { offset: 4, size: 4, type: "__u32", name: "cap_id" },
      { offset: 8, size: 8, type: "__u64", name: "agent_id" },
      { offset: 16, size: 8, type: "__u64", name: "present_ns" },
      { offset: 24, size: 16, type: "__u8", name: "nonce_in[16]", note: "copied in from userspace and left untouched, so the caller's challenge sits inside the signed span · kernel/agent/syscalls.c:1235-1237, :1208-1216" },
      { offset: 40, size: 32, type: "__u8", name: "issuer_pubkey[32]" },
      { offset: 72, size: 64, type: "__u8", name: "signature[64]", note: "the unsigned tail" },
    ],
    notes: [
      "477 fills this struct only on the success path, and that path is unreachable on a booted system. current_cred()->cap_set is NULL for every task, so every caller gets -EACCES plus an AE_CAP_DENIED · kernel/agent/syscalls.c:1189-1193, :1243.",
      "The NULL is structural, not incidental. The only writes to a cred's cap_set in the tree are kernel/cred.c:286-296, which clones an already non-NULL set on fork, and :737, which nulls it for kernel threads. Nothing installs one. 475 and 476 publish a cap_set onto the agent object instead, at kernel/agent/syscalls.c:835 and :1078, and fanning that out to a task's cred is routed to EPIC-K-8 · kernel/agent/agent.h:136-144. Grant and enforce do not meet.",
      "cap_id comes in as a u64 and only cap_id > U32_MAX is rejected · kernel/agent/syscalls.c:1232-1233.",
    ],
  },
  {
    id: "cap_revoke_args",
    used: "in · agent_cap_revoke (476) · a 48-byte wrapper, not a token",
    bytes: "48 bytes",
    cite: "include/uapi/linux/coconut_cap_token.h:180-188",
    lockKind: "kernel",
    locks: ["static_assert(sizeof(struct cap_revoke_args) == CAP_REVOKE_ARGS_SIZE_VER1) · kernel/agent/cap_token.c:92-93. the macro is the literal 48 at include/uapi/linux/coconut_cap_token.h:260"],
    fields: [
      { offset: 0, size: 4, type: "__u32", name: "version", note: "must be 1 · kernel/agent/syscalls.c:1099-1100" },
      { offset: 4, size: 4, type: "__u32", name: "flags", note: "DRY_RUN 1<<0 · CASCADE_CHILDREN 1<<1 · EMIT_PER_TOKEN 1<<2 · include/uapi/linux/coconut_cap_token.h:224-230. CASCADE_CHILDREN is separately rejected -EINVAL at kernel/agent/syscalls.c:1105-1106. EMIT_PER_TOKEN passes the mask and is read by nothing in the kernel, so setting it is a silent no-op: the revoke path emits exactly once at kernel/agent/syscalls.c:1082-1083 without consulting the bit" },
      { offset: 8, size: 8, type: "__u64", name: "agent_id" },
      { offset: 16, size: 8, type: "__u64", name: "cap_id", note: "CAP_ID_ANY is ~0ULL · include/uapi/linux/coconut_cap_token.h:238" },
      { offset: 24, size: 16, type: "__u8", name: "grant_nonce[16]", note: "zero means do not filter by nonce · kernel/agent/syscalls.c:996-997, :1032-1034" },
      { offset: 40, size: 4, type: "__u32", name: "grace_ms", note: "v1 is immediate only. Non-zero rejected -EINVAL · kernel/agent/syscalls.c:1107-1108" },
      { offset: 44, size: 4, type: "__u32", name: "_pad", reserved: true, note: "the only explicit reserved field on the whole surface. It closes the tail hole after grace_ms, and a non-zero value is rejected -EINVAL at kernel/agent/syscalls.c:1101-1102, so it is headroom rather than an info-leak surface" },
    ],
    notes: [
      "Nothing here is signed. Authority for a revoke comes from the caller's cap_set or from the capable(CAP_SYS_ADMIN) bootstrap door, never from this struct · kernel/agent/syscalls.c:988-994, :1110-1111.",
      "A real revoke discards the affected count and returns 0. Only DRY_RUN returns it · kernel/agent/syscalls.c:1024-1040, :1085-1086.",
    ],
  },
];

const ACCENT_RULE = "color-mix(in oklab, var(--accent) 45%, transparent)";
const ACCENT_TINT = "color-mix(in oklab, var(--canvas) 94%, var(--accent) 6%)";
const WARNING_TONE = "var(--warning)";

/* Proportional field bar. Ornament only: the 3px floor breaks scale for the
   four-byte fields, so the offset and size columns stay the authority. */
function FieldBar({ s }: { s: StructSpec }) {
  return (
    <div className="hidden sm:flex w-full h-2 gap-px mt-4 rounded-[2px] overflow-hidden" aria-hidden>
      {s.fields.map((f) => {
        const inScope = s.signed ? f.offset < s.signed.to : false;
        const bg = f.dead
          ? "color-mix(in oklab, var(--canvas) 70%, var(--warning) 30%)"
          : inScope
            ? "color-mix(in oklab, var(--canvas) 60%, var(--accent) 40%)"
            : "color-mix(in oklab, var(--canvas) 78%, var(--fg) 22%)";
        return (
          <span
            key={f.offset}
            className="block"
            style={{ flexGrow: f.size, flexBasis: 0, minWidth: "3px", background: bg }}
          />
        );
      })}
      {s.trailing && (
        <span
          className="block"
          style={{
            flexGrow: 120,
            flexBasis: 0,
            minWidth: "3px",
            background: "transparent",
            borderTop: `1px dotted ${ACCENT_RULE}`,
            borderBottom: `1px dotted ${ACCENT_RULE}`,
            borderRight: `1px dotted ${ACCENT_RULE}`,
          }}
        />
      )}
    </div>
  );
}

function StructPanel({ s }: { s: StructSpec }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <span className="min-w-0 font-mono text-[13px] tracking-tight break-words" style={{ color: "var(--accent)" }}>
          struct {s.id}
        </span>
        <span className="font-mono text-[11.5px] text-[color:var(--fg)]/75">{s.bytes}</span>
        <RegisterMark state="built" />
      </div>
      <div className="mt-2 flex flex-col gap-1">
        <Cite source={s.cite} className="min-w-0 leading-snug" />
        <span className="min-w-0 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/70 break-words">
          {s.used}
        </span>
      </div>

      <FieldBar s={s} />

      {s.signed && (
        <div className="mt-3 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--accent)" }}>
            signed span · bytes [0, {s.signed.to})
          </span>
          <span className="min-w-0 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75 break-words">
            {s.signed.label}
          </span>
          <Cite source={s.signed.cite} className="min-w-0 leading-snug" />
        </div>
      )}

      <ol className="mt-5">
        {s.fields.map((f) => {
          const inScope = s.signed ? f.offset < s.signed.to : false;
          return (
            <li
              key={f.offset}
              className="grid grid-cols-[3.25rem_1fr] sm:grid-cols-[3.5rem_3.25rem_1fr] gap-x-3 gap-y-1 py-2 border-t hairline"
              style={{
                borderLeft: `2px solid ${inScope ? ACCENT_RULE : "transparent"}`,
                paddingLeft: "0.625rem",
                background: inScope ? ACCENT_TINT : undefined,
              }}
            >
              <span className="font-mono text-[11px] text-[color:var(--muted)]">@{f.offset}</span>
              <span className="font-mono text-[11px] text-[color:var(--muted)]">{f.size} B</span>
              <span className="min-w-0 col-span-2 sm:col-span-1 font-mono text-[12.5px] leading-snug break-words">
                <span className="text-[color:var(--muted)]">{f.type} </span>
                <span
                  className="text-[color:var(--fg)]"
                  style={
                    f.dead
                      ? { textDecoration: "line-through", textDecorationColor: WARNING_TONE }
                      : undefined
                  }
                >
                  {f.name}
                </span>
                {f.dead && (
                  <span
                    className="ml-2 inline-block rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] whitespace-nowrap"
                    style={{
                      border: `1px solid color-mix(in oklab, ${WARNING_TONE} 45%, transparent)`,
                      color: WARNING_TONE,
                    }}
                  >
                    read by nothing
                  </span>
                )}
                {f.reserved && (
                  <span className="ml-2 inline-block rounded-[2px] border hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] whitespace-nowrap text-[color:var(--muted)]">
                    reserved
                  </span>
                )}
              </span>
              {f.note && (
                <span className="min-w-0 col-span-2 sm:col-span-3 font-mono text-[11px] leading-snug text-[color:var(--fg)]/65 break-words">
                  {f.note}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {s.trailing && (
        <div className="mt-5 rounded-[2px] border border-dotted p-3.5" style={{ borderColor: ACCENT_RULE }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            {s.trailing.title}
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {s.trailing.lines.map((l) => (
              <li key={l} className="min-w-0 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75 break-words">
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 pt-4 border-t hairline">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            layout lock
          </span>
          <span
            className="font-mono text-[11px]"
            style={{ color: s.lockKind === "kernel" ? "var(--accent)" : "var(--muted)" }}
          >
            {s.lockKind}
          </span>
        </div>
        <ul className="mt-2 flex flex-col gap-1.5">
          {s.locks.map((l) => (
            <li key={l} className="min-w-0 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75 break-words">
              {l}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {s.notes.map((n) => (
          <li key={n} className="min-w-0 text-[13.5px] leading-[1.5] text-[color:var(--fg)]/80 break-words">
            {n}
          </li>
        ))}
      </ul>

      {s.drift && <Drift className="mt-4" docSays={s.drift.docSays} codeDoes={s.drift.codeDoes} />}
    </div>
  );
}

export function UapiStructMap() {
  const [active, setActive] = useState("cap_token");
  const [shown, setShown] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const idx = Math.max(0, STRUCTS.findIndex((s) => s.id === active));
  const current = STRUCTS[idx];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  function select(id: string) {
    if (id === active) return;
    setShown(false);
    setActive(id);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % STRUCTS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + STRUCTS.length) % STRUCTS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = STRUCTS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(STRUCTS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <figure>
      <div className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-7">
        <div
          role="tablist"
          aria-label="uapi structs that cross the syscall boundary"
          className="flex flex-wrap gap-1.5"
          onKeyDown={onKeyDown}
        >
          {STRUCTS.map((s, i) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`uapi-tab-${s.id}`}
                aria-selected={on}
                aria-controls={`uapi-panel-${s.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(s.id)}
                className="rounded-[2px] border px-2 py-1 font-mono text-[11px] tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30"
                style={{
                  borderColor: on ? "color-mix(in oklab, var(--accent) 40%, transparent)" : "var(--rule)",
                  background: on ? "color-mix(in oklab, var(--canvas) 88%, var(--accent) 12%)" : "transparent",
                  color: on ? "var(--accent)" : "var(--muted)",
                }}
              >
                {s.id}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`uapi-panel-${current.id}`}
          aria-labelledby={`uapi-tab-${current.id}`}
          tabIndex={0}
          className="mt-6 transition-opacity duration-200 focus-visible:outline-none"
          style={{ opacity: shown ? 1 : 0 }}
        >
          <StructPanel s={current} />
        </div>

        <div className="mt-8 pt-6 border-t hairline grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="min-w-0 rounded-[2px] border p-3.5" style={{ borderColor: "var(--rule)", borderStyle: "solid" }}>
            <div className="flex flex-wrap items-baseline gap-2">
              <RegisterMark state="built" />
              <span className="font-mono text-[11.5px] text-[color:var(--fg)]/80">two of six have no kernel-side lock</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.5] text-[color:var(--fg)]/80">
              Four layouts are pinned by a static_assert or a BUILD_BUG_ON inside the kernel. Three of the four pin a
              size to a literal. attestation pins only the signature tail relation. agent_spawn_args and
              quota_set are pinned only by the userspace mirror, which the selftest-agent job builds against exported
              headers. If that job stops running, those two have no compile-time guard left.
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <Cite source="kernel/agent/cap_token.c:84-93 · kernel/agent/syscalls.c:483-485" className="min-w-0 leading-snug" />
              <Cite source="tools/coconut/libcoconut/abi_crosscheck.c:26-84 · .gitlab-ci.yml:311-333" className="min-w-0 leading-snug" />
            </div>
          </div>

          <div className="min-w-0 rounded-[2px] border p-3.5" style={{ borderColor: "var(--muted)", borderStyle: "dashed" }}>
            <div className="flex flex-wrap items-baseline gap-2">
              <RegisterMark state="designed" />
              <span className="font-mono text-[11.5px] text-[color:var(--fg)]/80">additive evolution, with no mechanism</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.5] text-[color:var(--fg)]/80">
              I wrote these headers to evolve the way clone3 does. Additive only, no field removed, no meaning changed
              after the lock. clone3 gets that from a size argument. None of the agent syscalls take one, so there is
              nothing for a min(user_size, sizeof) copy to read. Adding the size argument is itself an ABI break, and it
              is only cheap before the lock.
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <Cite source="Documentation/coconut/agent-syscalls.rst:153-161 · locks at Sprint 4 / Gate 1" className="min-w-0 leading-snug" />
            </div>
            <Drift
              className="mt-4"
              docSays="include/uapi/linux/agent.h:96-101, :170-177, :243-249 · all three SIZE_VER1 macros say the syscall will copy min(user_size, sizeof(...)) bytes once size detection lands"
              codeDoes="agent_spawn is SYSCALL_DEFINE1 with no size argument at kernel/agent/syscalls.c:170, and copies sizeof(kargs) unconditionally at :180. Same shape for 473 at :374-375 and for 474 at :588-589, :606."
            />
          </div>

          <div className="min-w-0 rounded-[2px] border p-3.5" style={{ borderColor: "var(--highlight)", borderStyle: "dotted" }}>
            <div className="flex flex-wrap items-baseline gap-2">
              <RegisterMark state="must-be" />
              <span className="font-mono text-[11.5px] text-[color:var(--fg)]/80">the six layouts freeze at the lock</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.5] text-[color:var(--fg)]/80">
              At v1.0 these are the bytes userspace compiles against, permanently. No field leaves any of these structs
              and no existing field changes meaning. Between here and there: the range is reserved and not locked today,
              and the size-detection question has to be answered first, because after the lock it cannot be.
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <Cite source="v1.0 · Sprint 4 / Gate 1 · kernel/agent/syscalls.c:15-17" className="min-w-0 leading-snug" />
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] leading-snug text-[color:var(--muted)] tracking-tight break-words">
        fields, offsets and sizes read from include/uapi/linux/agent.h and include/uapi/linux/coconut_cap_token.h at
        origin/main eef103d. sizes and signature offsets are the ones the tree asserts at compile time, not ones I
        measured on a build, and I did not compile these headers on a second architecture. the proportional bar is
        ornament with a 3px floor per field, so it is not to scale for the four-byte fields. the offset and size columns
        are the authority. constraint value semantics are absent because the kernel does not interpret them yet.
      </figcaption>
    </figure>
  );
}
