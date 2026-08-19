/* The calls I made. Six numbered decisions, each with the alternative it beat,
   plus one smaller call in an aside after the list.

   Design-reasoning register for /specs/architecture (spec section 14, detail
   in spec section 5). Every card states the choice, the option that lost, the
   reason it lost, and the evidence in the tree at eef103d. Cards that cut
   against their own design carry that too.

   The aside is not a seventh numbered card and says so in its own title. It
   carries a mark per claim, not one mark over the block, because it holds a
   BUILT fact and a DESIGNED call and those are different claims.

   The mark and the cite come from the shared register primitive, so this
   figure speaks the same vocabulary as every other claim on the page.
   Static, no state, nothing animates. */

import { Cite, RegisterMark } from "@/components/register";

type Register = "built" | "designed" | "must-be";

type Evidence = { register: Register; text: string; cite: string };

type Rejected = { option: string; because: string };

type Caveat = { register: Register; label: string; text: string; cite: string };

type Decision = {
  n: string;
  title: string;
  chose: string;
  rejected: Rejected[];
  evidence: Evidence[];
  note?: string;
  caveats?: Caveat[];
};

const DECISIONS: Decision[] = [
  {
    n: "01",
    title: "NULL until bound",
    chose:
      "A task's cap_set stays NULL until it is bound to an agent, and the enforcement core returns 0 on NULL before it does any other work.",
    rejected: [
      {
        option: "default-deny for every task",
        because:
          "A non-agent task has to behave like a no-LSM kernel. glibc, sudo, sshd and the NVIDIA blob driver all run with cap_set NULL. That is the Tier-A guard, and a default-deny posture spends it on day one.",
      },
    ],
    evidence: [
      {
        register: "built",
        text: "coconut_check_current takes rcu_read_lock, reads cred->cap_set with READ_ONCE, and returns 0 before the clock read when it is NULL.",
        cite: "security/coconut/enforce.c:136-153",
      },
      {
        register: "built",
        text: "The bootstrap rule is written into the Kconfig help text where a packager reads it.",
        cite: "security/coconut/Kconfig:23-27",
      },
      {
        register: "designed",
        text: "K-8.1 read ktime_get_mono_fast_ns() ahead of the NULL defer, so a non-agent open(2) paid a clock read it did not need. K-8.2 factored the defer in front of it. Only an agent pays the clock now.",
        cite: "decision-rc1 · STORY-K-8.1 · STORY-K-8.2 · Documentation/coconut/cap-conformance-invariants.md:391",
      },
    ],
    caveats: [
      {
        register: "built",
        label: "cuts against this",
        text: "Every task on a booted system takes that defer. No production path installs a non-NULL cap_set. init_cred carries no cap_set initializer, so the boot cred is NULL by static init. The one non-NULL write in the tree outside KUnit sits behind a gate that requires cap_set to already be non-NULL, so NULL propagates through every fork. prepare_kernel_cred clears it again for kernel threads. The grant and revoke cores write agent->cap_set, a different field. So the fast exit is the only exit.",
        cite: "kernel/cred.c:52-71, :286-295, :737 · kernel/agent/syscalls.c:835, :1078",
      },
    ],
  },
  {
    n: "02",
    title: "One appended pointer on struct cred",
    chose:
      "Append a single struct coconut_caps *cap_set to struct cred. Evaluation lives in the security/coconut LSM hooks. kernel/cred.c does the field append and the refcount discipline and nothing else.",
    rejected: [
      {
        option: "map or replace cap_effective, cap_permitted, cap_bset, cap_ambient",
        because:
          "The NVIDIA proprietary driver reads struct cred through exactly two surfaces: the POSIX capability macros and UID/GID. It is always rebuilt against the running kernel through DKMS, so no precompiled .ko is frozen against a cred layout. Appending a field is invisible to it. Touching the bitmap is not, and it breaks Tier-A on a driver I cannot patch. The full DAC overhaul slips to v2.",
      },
    ],
    evidence: [
      {
        register: "built",
        text: "The field is one pointer, NULL for every legacy task. The capability(7) bitmap is not modified, mapped or replaced, so POSIX semantics keep working for non-agent tasks.",
        cite: "include/linux/coconut_cred.h:5-25",
      },
      {
        register: "designed",
        text: "The two-surface argument is written down against decision-rc1 rather than assumed.",
        cite: "decision-rc1 · Documentation/coconut/nvidia-cred-shim-reproducer.md:9-11, :18-28",
      },
    ],
    caveats: [
      {
        register: "built",
        label: "cuts against this",
        text: "There is no tier-a-compat job in .gitlab-ci.yml. The file carries a comment saying to add one when hardware runners register with tag coconut-tier-a-hw. The reproducer doc says the job exists and is gated when: never, which is itself a drift, and its section 6 Live run results is an empty placeholder.",
        cite:
          ".gitlab-ci.yml:46-51 · Documentation/coconut/nvidia-cred-shim-reproducer.md:11, :161-163, :170",
      },
      {
        register: "must-be",
        label: "unverified on hardware",
        text: "This reasoning is artifact review only. The end state is a live run: the reproducer script on the hardware runner pool against a kernel with the K-3.1 patch, its trace diffed against the section 3 baseline, a fixup story cut and the v1.0 ISO sign-off blocked on any divergence. The distance is the pool. It does not exist yet, so nothing has been run.",
        cite: "Sprint 8 · TFD 6.8.1 · Documentation/coconut/nvidia-cred-shim-reproducer.md:13-16",
      },
    ],
  },
  {
    n: "03",
    title: "A BLAKE2b-512 keyed MAC, and calling it a MAC",
    chose:
      "A symmetric BLAKE2b-512 suffix-keyed MAC over a domain prefix, the token header, and the full trailing constraint span. The header says MAC in so many words.",
    rejected: [
      {
        option: "ship the same 64 bytes as a signature",
        because:
          "Linux 6.12 ships crypto/curve25519-generic.c, which is X25519 ECDH. There is no in-tree Ed25519 signing to call. Naming a symmetric MAC a signature would be the one claim on this surface a reader could not check for themselves.",
      },
    ],
    evidence: [
      {
        register: "built",
        text: "verify recomputes the MAC and compares with crypto_memneq. sign performs the byte-identical walk, issuer secret suffix included. On verify a crypto_alloc_shash failure maps to -EBADMSG, so the deny path fails closed. On sign it surfaces as PTR_ERR and no token is minted.",
        cite: "kernel/agent/cap_token.c:242-288 · :393-395, :405-420",
      },
      {
        register: "built",
        text: "The issuer secret is a per-boot 32-byte CSPRNG value held __ro_after_init, issuer_pubkey is BLAKE2s of it, and the known-issuer registry is one constant-time compare against that single value.",
        cite: "kernel/agent/issuer.c:83-89, :134-154, :279-288",
      },
      {
        register: "must-be",
        text: "Ed25519 replaces it as a single function swap. Same 64-byte signature offset, same coverage region, no ABI bump.",
        cite: "STORY-K-9.1",
      },
    ],
    caveats: [
      {
        register: "built",
        label: "cuts against this",
        text: "No userspace party can verify anything at v1, because the secret never leaves the kernel, and tokens do not survive a reboot. The doc states the limit: suitable for protocol shape and CI smoke tests, not for production attestation.",
        cite: "Documentation/coconut/agent-syscalls.rst:268-280 · kernel/agent/issuer.c:83-89",
      },
    ],
  },
  {
    n: "04",
    title: "Fork inherits a deep copy, not a shared reference",
    chose:
      "prepare_creds clones the parent's cap_set. The child gets an independent object at usage 1 and an AE_CAP_INHERITED audit record.",
    rejected: [
      {
        option: "the shared coconut_caps_get() reference K-3.1 originally took",
        because:
          "A shared reference means revoking the parent reaches into a child forked minutes earlier that is doing unrelated work. I wanted a revoke to be scoped to the object it names.",
      },
    ],
    evidence: [
      {
        register: "built",
        text: "The struct memcpy carries the parent's raw pointer in, coconut_caps_get is deliberately not called, and a clone failure NULLs the field first so the abort path's put is a no-op.",
        cite: "kernel/cred.c:267-295",
      },
      {
        register: "designed",
        text: "The mechanism changed at K-3.6. Both arms are registered as one invariant: spawn-time inheritance is none, fork inheritance is a deep copy.",
        cite: "STORY-K-3.1 · STORY-K-3.6 · CAP-INV-13 · Documentation/coconut/cap-conformance-invariants.md:451-463",
      },
    ],
    caveats: [
      {
        register: "built",
        label: "cuts against this",
        text: "It cuts the other way too. A child holds an independent set by construction, so even a working cred-level revoke on the parent leaves the child holding its caps. CASCADE_CHILDREN was the answer to that and it returns -EINVAL, with the comment deferred: no agent-tree walk.",
        cite: "kernel/agent/syscalls.c:1105-1106",
      },
    ],
  },
  {
    n: "05",
    title: "A retracted assertion",
    chose:
      "Retract the struct cred layout freeze. Keep the sound version of the guard on struct coconut_caps instead.",
    rejected: [
      {
        option: "BUILD_BUG_ON(offsetof(cred, rcu) + sizeof(rcu_head) == sizeof(struct cred))",
        because:
          "The author pass demanded it. It is unsound. struct cred carries __randomize_layout, so source order is not memory order under RANDSTRUCT. The assertion passes silently with RANDSTRUCT off, which is false assurance, and breaks the build with it on. It was also not guarding a requirement anyone had.",
      },
    ],
    evidence: [
      {
        register: "built",
        text: "The sound guard lives on struct coconut_caps, which is not randomized: static_assert(offsetof(rcu) + sizeof(struct rcu_head) == sizeof(struct coconut_caps)).",
        cite: "kernel/agent/coconut_caps.c:44-55",
      },
      {
        register: "designed",
        text: "The salvageable property became strict additivity. The layout guard became its own invariant, and the doc labels it defensive rather than free-path correctness, since the container_of math is right regardless.",
        cite: "CAP-INV-11 · CAP-INV-12 · Documentation/coconut/cap-conformance-invariants.md:386-388, :421-426",
      },
      {
        register: "must-be",
        text: "The additivity arm that asserts the legacy kernel_cap_t fields are untouched is encoded as security/coconut/cred_shim_kunit.c. That file is not in the tree, so the arm is scaffold.",
        cite: "Gate 1 · CAP-INV-11 scaffold arm · Documentation/coconut/cap-conformance-invariants.md:391, :402-403",
      },
    ],
    note: "This card is on the page on purpose. A design register that only holds wins is not a design register, it is a brochure.",
  },
  {
    n: "06",
    title: "rpm-ostree compose, over bootc, over a custom composer",
    chose:
      "Compose the image with rpm-ostree from a treefile, because capability metadata is injected at the RPM spec layer and the treefile is where that injection has a seam.",
    rejected: [
      {
        option: "bootc",
        because:
          "At v0.1 to v0.2 its compose story is oriented around consuming a prebuilt container image rather than composing one from a treefile. bootc install targets disk provisioning, not ISO production, and ISO generation still routes through lorax and anaconda, which have no bootc-native integration.",
      },
      {
        option: "a custom Nix-style composer",
        because:
          "Cost model, not taste. 18 to 24 engineer-months to build the stack from scratch against 12 to 18 for the rpm-ostree path, estimated at the packaging-strategy level and never measured. OSTree already gives content-addressed layer commits, which is the part of Nix-style that matters for reproducibility, and SOURCE_DATE_EPOCH propagation through rpm-ostree, dracut and mkisofs is solved upstream.",
      },
    ],
    evidence: [
      {
        register: "designed",
        text: "Both rejections and the cost model are written up in the spike rather than recalled.",
        cite: "TFD 3.12 · Documentation/coconut/spike-6-iso-build-poc.md:12-64",
      },
      {
        register: "must-be",
        text: "The re-evaluation trigger is pre-committed. bootc is the likely long-term path for the container-based update track.",
        cite: "bootc v1.0 stable · EPIC-U-2 · Documentation/coconut/spike-6-iso-build-poc.md:31-33, :172-175",
      },
    ],
    caveats: [
      {
        register: "built",
        label: "cuts against this",
        text: "The spike ISO does not boot the Coconut kernel. Its treefile pulls the stock Fedora 41 kernel RPM, because coconut-kernel is not an RPM yet. The spike names that as its own critical path.",
        cite: "distro/treefile/coconut-workstation.yaml:31-39 · Documentation/coconut/spike-6-iso-build-poc.md:161-164",
      },
    ],
  },
];

const ASIDE: { title: string; claims: Evidence[] } = {
  title: "A smaller call, outside the six",
  claims: [
    {
      register: "built",
      text: "KERNEL_AGENT declares no depends on at all. SECURITY_COCONUT carries depends on KERNEL_AGENT and there is no edge back, so the config graph permits an agent build with the LSM off. The checked-in kunit config does not use that freedom. It sets CONFIG_SECURITY=y and CONFIG_SECURITY_COCONUT=y, so the suite the single kunit-coconut gate actually runs has the LSM compiled in.",
      cite: "kernel/agent/Kconfig:3-8, :19-32 · security/coconut/Kconfig:6 · kernel/agent/.kunitconfig:12-14",
    },
    {
      register: "designed",
      text: "I refused the reverse edge. The rejected form is KERNEL_AGENT depends on SECURITY_COCONUT and AUDIT_COCONUT, which the Makefile header still states and the agent.c file comment still builds on. Both places are in the drift list above. That form would gate the whole subsystem off until its dependencies exist, and AUDIT_COCONUT still does not exist as a config symbol at eef103d. Pipeline #2551502533 ran zero tests at K-2.3 under that shape. K-2.4 reversed the edge, and it also landed the first KUnit test in the coconut subsystems, so the reverse edge was not the only thing standing between that job and a green KTAP.",
      cite: "STORY-K-2.3 · STORY-K-2.4 · kernel/agent/Makefile:5-7, :23-25 · kernel/agent/agent.c:16-22 · arch/x86/configs/coconut_defconfig:78",
    },
  ],
};

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)] pt-0.5 sm:text-right">
      {children}
    </div>
  );
}

export function DecisionCards() {
  return (
    <figure>
      <ol className="space-y-3">
        {DECISIONS.map((d) => (
          <li
            key={d.n}
            className="rounded-[2px] border hairline bg-[color:var(--surface)]/40 p-4 sm:p-6"
          >
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-mono text-[11px] text-[color:var(--muted)] tracking-tight">
                {d.n}
              </span>
              <RegisterMark state="designed" />
              <h3 className="min-w-0 text-[15px] sm:text-[16.5px] leading-snug tracking-[-0.01em] text-[color:var(--fg)]">
                {d.title}
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[84px_1fr] gap-1.5 sm:gap-4">
              <RowLabel>chose</RowLabel>
              <div
                className="min-w-0 rounded-[2px] p-3"
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "color-mix(in oklab, var(--accent) 38%, transparent)",
                  background: "color-mix(in oklab, var(--canvas) 92%, var(--accent) 8%)",
                }}
              >
                <p className="text-[13.5px] leading-[1.55] text-[color:var(--fg)]/90">{d.chose}</p>
              </div>

              <RowLabel>instead of</RowLabel>
              <div className="min-w-0 space-y-2">
                {d.rejected.map((r) => (
                  <div
                    key={r.option}
                    className="rounded-[2px] p-3"
                    style={{
                      borderWidth: 1,
                      borderStyle: "dotted",
                      borderColor: "color-mix(in oklab, var(--fg) 22%, transparent)",
                      background: "var(--canvas)",
                    }}
                  >
                    <div className="font-mono text-[12px] tracking-tight text-[color:var(--fg)]/70 break-words">
                      {r.option}
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/75">
                      {r.because}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <dl className="mt-4 pt-4 border-t hairline space-y-3">
              {d.evidence.map((e) => (
                <div key={e.cite} className="grid grid-cols-1 sm:grid-cols-[84px_1fr] gap-1.5 sm:gap-4">
                  <dt className="pt-0.5 sm:text-right">
                    <RegisterMark state={e.register} />
                  </dt>
                  <dd className="min-w-0">
                    <p className="text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{e.text}</p>
                    <div className="mt-1">
                      <Cite source={e.cite} />
                    </div>
                  </dd>
                </div>
              ))}
            </dl>

            {d.note && (
              <p className="mt-4 sm:ml-[100px] text-[13.5px] leading-[1.55] text-[color:var(--fg)]/70">
                {d.note}
              </p>
            )}

            {d.caveats?.map((c) => (
              <div
                key={c.cite}
                className="mt-4 pl-3.5 sm:ml-[100px]"
                style={{
                  borderLeftWidth: 1,
                  borderLeftStyle: "solid",
                  borderLeftColor: "color-mix(in oklab, var(--fg) 28%, transparent)",
                }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
                    {c.label}
                  </span>
                  <RegisterMark state={c.register} />
                </div>
                <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">
                  {c.text}
                </p>
                <div className="mt-1">
                  <Cite source={c.cite} />
                </div>
              </div>
            ))}
          </li>
        ))}
      </ol>

      <div className="mt-3 rounded-[2px] border hairline p-4 sm:p-6 bg-[color:var(--canvas)]">
        <span className="text-[14px] leading-snug text-[color:var(--fg)]">{ASIDE.title}</span>

        <dl className="mt-3 space-y-3">
          {ASIDE.claims.map((e) => (
            <div key={e.cite} className="grid grid-cols-1 sm:grid-cols-[84px_1fr] gap-1.5 sm:gap-4">
              <dt className="pt-0.5 sm:text-right">
                <RegisterMark state={e.register} />
              </dt>
              <dd className="min-w-0">
                <p className="text-[13.5px] leading-[1.55] text-[color:var(--fg)]/80">{e.text}</p>
                <div className="mt-1">
                  <Cite source={e.cite} />
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figcaption className="mt-4 font-mono text-[11px] leading-[1.6] text-[color:var(--muted)] tracking-tight">
        sources · Documentation/coconut/ and the tree at eef103d. every cite above is checkable
        with git show.
        <br />
        limit · no written trade study exists in this tree. the alternatives named here are the
        ones the kernel tree and the spikes record. the full studies live in the private spec repo
        coconutlabs/coconutos and cannot be checked from this repo.
        <br />
        the 18-24 versus 12-18 engineer-month figures are packaging-strategy estimates, not
        measurements.
      </figcaption>
    </figure>
  );
}
