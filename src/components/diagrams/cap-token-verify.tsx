/* D4 · cap_token_verify(). The eight-step fail-closed gauntlet and the exact
   byte span the MAC covers.

   Every structural check runs before the MAC. That ordering is the design
   property: a malformed token is rejected on shape, and the crypto is never
   asked to rescue a length. Read at origin/main eef103d.

   Static. No hooks, no handlers, so no "use client". Steps are labelled by the
   code's own numbering, which is why there are nine rows and eight steps: 5b is
   the exact-length check that closes trailing slack inside step 5's walk.

   Cite convention, stated in the visible caption too: a bare cap_token.c or
   issuer.c name is kernel/agent/. Anything else carries its full path. */

import { RegisterMark, Cite } from "@/components/register";

type Step = {
  /** the code's own step label, not a render counter */
  n: string;
  cond: string;
  errno: string;
  cite: string;
  note?: string;
};

const STEPS: readonly Step[] = [
  {
    n: "1",
    cond: "len < 152",
    errno: "-EBADMSG",
    cite: "cap_token.c:185-186",
    note: "shorter than the fixed header. CAP_TOKEN_HEADER_SIZE_VER1 is 152 at include/uapi/linux/coconut_cap_token.h:256",
  },
  {
    n: "2",
    cond: "le32(version) != 1",
    errno: "-EBADMSG",
    cite: "cap_token.c:189-190",
  },
  {
    n: "3",
    cond: "flags & ~CAP_TOKEN_FLAG__ALL",
    errno: "-EBADMSG",
    cite: "cap_token.c:193-195",
    note: "unknown flag bits are rejected, not masked off",
  },
  {
    n: "4",
    cond: "constraint_count > 64",
    errno: "-EBADMSG",
    cite: "cap_token.c:198-200",
    note: "CAP_TOKEN_MAX_CONSTRAINTS, 64 at include/uapi/linux/coconut_cap_token.h:266",
  },
  {
    n: "5",
    cond: "constraint span walk fails",
    errno: "-EBADMSG",
    cite: "cap_token.c:110-143 called at :203-205",
    note: "each record needs its 4 header bytes in bounds · clen % 8 == 0 · header + clen fits len · size_t overflow guard",
  },
  {
    n: "5b",
    cond: "len != 152 + span",
    errno: "-EBADMSG",
    cite: "cap_token.c:217-218",
    note: "exact length. no trailing unsigned slack",
  },
  {
    n: "6",
    cond: "expires_ns && expires_ns < ktime_get_real_ns()",
    errno: "-ESTALE",
    cite: "cap_token.c:221-226",
    note: "zero expires_ns means no expiry",
  },
  {
    n: "7",
    cond: "!coconut_issuer_is_known(issuer_pubkey)",
    errno: "-EACCES",
    cite: "cap_token.c:229-230",
  },
  {
    n: "8",
    cond: "crypto_memneq(mac, t->signature, 64) mismatch",
    errno: "-EBADMSG",
    cite: "cap_token.c:281-285",
    note: "constant-time compare, recomputed over the span below",
  },
];

type ScopeRow = {
  part: string;
  size: string;
  note: string;
  cite: string;
};

const MAC_SCOPE: readonly ScopeRow[] = [
  {
    part: 'domain "COCONUT-CAP-TOKEN-V1\\0"',
    size: "21 bytes",
    note: "COCONUT_CAP_TOKEN_DOMAIN_LEN, sizeof minus 1, static_asserted",
    cite: "cap_token.c:68-74",
  },
  {
    part: "header bytes [0 .. 88)",
    size: "88 bytes",
    note: "every field up to the signature slot. CAP_TOKEN_SIG_SCOPE_VER1 is 88, static_asserted against offsetof",
    cite: "include/uapi/linux/coconut_cap_token.h:81-98 · :257 · cap_token.c:86-87",
  },
  {
    part: "trailing constraints [152 .. 152+span)",
    size: "span bytes",
    note: "includes the inter-record zero pad",
    cite: "cap_token.c:110-143",
  },
  {
    part: "issuer secret",
    size: "32 bytes",
    note: "suffixed at finalize, never leaves issuer.c",
    cite: "issuer.c:306-319",
  },
];

const ERRNO_CHIP =
  "inline-flex items-center shrink-0 whitespace-nowrap leading-none rounded-[2px] " +
  "border font-mono text-[11px] px-1.5 py-0.5";

const ERRNO_STYLE = {
  color: "var(--accent)",
  background: "color-mix(in oklab, var(--canvas) 90%, var(--accent) 10%)",
  borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)",
} as const;

const CARD =
  "min-w-0 rounded-[2px] border hairline p-4 sm:p-5 bg-[color:var(--surface)]/40";

const RULE_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]";

export function CapTokenVerify() {
  return (
    <figure>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* left · the gauntlet */}
        <div className={CARD}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <RegisterMark state="built" />
            <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]">
              cap_token_verify()
            </span>
            <Cite source="kernel/agent/cap_token.c:174-289" />
          </div>

          <p className="mt-3 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
            Eight steps, in source order. Every structural check runs before the
            MAC. 5b is the exact-length check inside step 5&apos;s walk, which is
            why nine rows carry eight numbers.
          </p>

          <ol className="mt-4 space-y-2 list-none">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[34px_1fr] gap-x-3 gap-y-1 items-start rounded-[2px] border p-2.5 sm:p-3"
                style={{
                  background:
                    "color-mix(in oklab, var(--canvas) 92%, var(--surface) 8%)",
                  borderColor: "color-mix(in oklab, var(--fg) 12%, transparent)",
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-tight pt-0.5"
                  style={{ color: "var(--muted)" }}
                >
                  {s.n}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <code className="font-mono text-[12px] tracking-tight text-[color:var(--fg)] break-words">
                      {s.cond}
                    </code>
                    <span className={ERRNO_CHIP} style={ERRNO_STYLE}>
                      {s.errno}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <Cite source={s.cite} />
                    {s.note ? (
                      <span className="min-w-0 font-mono text-[11px] leading-snug text-[color:var(--fg)]/70 break-words">
                        · {s.note}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 pt-4 border-t hairline">
            <div className={RULE_LABEL}>fail closed</div>
            <p className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
              <code className="font-mono">
                crypto_alloc_shash(&quot;blake2b-512&quot;)
              </code>{" "}
              failure maps to{" "}
              <span className="font-mono" style={{ color: "var(--accent)" }}>
                -EBADMSG
              </span>{" "}
              as well. The comment in the tree reads: crypto unavailable, cannot
              verify, deny.
            </p>
            <div className="mt-1.5">
              <Cite source="cap_token.c:242-246" />
            </div>
          </div>
        </div>

        {/* right · the MAC scope ruler */}
        <div className={CARD}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <RegisterMark state="built" />
            <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]">
              what the MAC covers
            </span>
            <Cite source="cap_token.c:242-288" />
          </div>

          {/* byte bar · ornament, sm and up only. the dl below carries the numbers */}
          <div className="hidden sm:block mt-4" aria-hidden>
            <div className="flex items-stretch h-7 rounded-[2px] overflow-hidden border hairline">
              <div
                className="flex items-center justify-center basis-[57.9%] grow-0 shrink-0 min-w-0"
                style={{
                  background:
                    "color-mix(in oklab, var(--canvas) 84%, var(--accent) 16%)",
                }}
              >
                <span
                  className="font-mono text-[10px] tracking-tight truncate px-1"
                  style={{ color: "var(--accent)" }}
                >
                  covered [0 .. 88)
                </span>
              </div>
              <div className="w-px bg-[color-mix(in_oklab,var(--fg)_15%,transparent)]" />
              <div className="flex items-center justify-center basis-[42.1%] grow-0 shrink-0 min-w-0">
                <span className="font-mono text-[10px] tracking-tight truncate px-1 text-[color:var(--muted)]">
                  signature [88 .. 152)
                </span>
              </div>
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-[color:var(--muted)]">
              <span>0</span>
              <span>88</span>
              <span>152</span>
            </div>
            <div
              className="mt-2 flex items-center h-7 rounded-[2px] border px-2"
              style={{
                borderStyle: "dashed",
                borderWidth: "1px",
                borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
              }}
            >
              <span
                className="font-mono text-[10px] tracking-tight truncate"
                style={{ color: "var(--accent)" }}
              >
                covered · trailing constraints [152 .. 152+span)
              </span>
            </div>
          </div>

          <dl className="mt-4 space-y-2.5">
            {MAC_SCOPE.map((r) => (
              <div
                key={r.part}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 items-baseline border-l hairline pl-3"
              >
                <dt className="min-w-0 font-mono text-[11.5px] tracking-tight text-[color:var(--fg)] break-words">
                  {r.part}
                </dt>
                <dd className="font-mono text-[11.5px] tracking-tight text-[color:var(--accent)] whitespace-nowrap">
                  {r.size}
                </dd>
                <dd className="sm:col-span-2 min-w-0 font-mono text-[11px] leading-snug text-[color:var(--muted)] break-words">
                  {r.note} · <Cite source={r.cite} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 pt-4 border-t hairline">
            <div className={RULE_LABEL}>not covered</div>
            <p className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
              Bytes 88 through 151, which is the 64-byte signature field itself.
              Nothing else in the token sits outside the MAC.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t hairline">
            <div className={RULE_LABEL}>sign and verify agree</div>
            <p className="mt-1.5 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
              <code className="font-mono">cap_token_sign()</code> performs the
              byte-identical walk over the same{" "}
              <code className="font-mono">cap_token_constraints_span()</code>{" "}
              result. This is one of the few places on this page where the doc
              and the code say the same thing.
            </p>
            <div className="mt-1.5">
              <Cite source="cap_token.c:389 · :405-419 versus :203 · :242-288" />
            </div>
          </div>
        </div>
      </div>

      {/* designed · why it is a MAC */}
      <div className={`${CARD} mt-4 sm:mt-5`}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <RegisterMark state="designed" />
          <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]">
            why BLAKE2b and not Ed25519
          </span>
          <Cite source="STORY-K-9.1 · kernel/agent/issuer.c:27" />
        </div>
        <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-[color:var(--fg)]/80">
          <p>
            Linux 6.12 ships{" "}
            <code className="font-mono text-[12px]">
              crypto/curve25519-generic.c
            </code>
            , which is X25519 ECDH, and no Ed25519 signing. So the v1 signature
            is a symmetric BLAKE2b-512 suffix-keyed MAC. I say that in the header
            rather than calling it a signature.
          </p>
          <p>
            The secret is a per-boot 32-byte CSPRNG value held{" "}
            <code className="font-mono text-[12px]">__ro_after_init</code>.{" "}
            <code className="font-mono text-[12px]">issuer_pubkey</code> is
            BLAKE2s of that secret, and the known-issuer registry is one
            constant-time compare against that single value. Two consequences
            follow and I accept both. No userspace party can verify anything.
            Tokens do not survive a reboot.
          </p>
          <p>
            The 64-byte signature offset is preserved, so swapping in Ed25519 at
            STORY-K-9.1 is ABI-neutral.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <Cite source="issuer.c:23-32" />
          <Cite source="issuer.c:83-89" />
          <Cite source="issuer.c:134-154" />
          <Cite source="issuer.c:279-288" />
          <Cite source="cap_token.c:18-25" />
        </div>
      </div>

      {/* built · initcall ordering */}
      <div className={`${CARD} mt-4 sm:mt-5`}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <RegisterMark state="built" />
          <span className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]">
            when the issuer comes up
          </span>
          <Cite source="issuer.c:191" />
        </div>
        <p className="mt-3 font-mono text-[11.5px] leading-snug text-[color:var(--fg)]/75">
          <code className="font-mono">fs_initcall</code>. Chosen over{" "}
          <code className="font-mono">subsys_initcall</code>, which is a
          link-order foot-gun against{" "}
          <code className="font-mono">crypto/</code>, and over{" "}
          <code className="font-mono">late_initcall</code>, which races KUnit.
          The rationale is written in the file.
        </p>
        <div className="mt-1.5">
          <Cite source="issuer.c:99-123" />
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
        cap_token_verify at kernel/agent/cap_token.c:174-289, read at eef103d ·
        a bare cap_token.c or issuer.c cite is kernel/agent/; every other file
        carries its path from the repo root · the byte bar is to scale for the
        152-byte fixed header only, since the trailing constraint span is
        variable and the tree pins no single value for it
      </figcaption>
    </figure>
  );
}
