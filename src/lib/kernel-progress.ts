import commitsSnapshot from "@/content/kernel-commits.json";
import statusSnapshot from "@/content/kernel-status.json";

/* Kernel progress comes from two committed snapshots in src/content/, written
   by scripts/coconut/progress-export.py in the private coconutos-kernel repo
   and copied here verbatim. The site never fetches them at request time or
   build time.

   Committed data is the point. A build-time fetch would make the rendered page
   depend on whether the network answered, and a hardcoded number beside the
   snapshot would drift the moment the kernel moved. Both files carry the ref
   sha they were generated from, so what the page renders and what the mirror
   publishes are the same bytes.

   A fact whose value is null could not be derived from its source file at that
   ref. Callers render null as absent. Nothing here is ever filled in with an
   estimate. */

export type ProgressMeta = {
  generator: string;
  ref: string;
  ref_sha: string;
  generated_on: string;
  since: string;
  paths: string[];
  total_commits: number;
  non_merge_commits: number;
  merge_commits: number;
};

export type KernelCommit = {
  sha: string;
  date: string;
  subject: string;
  areas: string[];
  coconut_files_touched: number | null;
  merge: boolean;
};

export type StatusFact = {
  value: unknown;
  source: string;
  note?: string;
};

const commits = commitsSnapshot as { meta: ProgressMeta; commits: KernelCommit[] };
const status = statusSnapshot as { meta: ProgressMeta; facts: Record<string, StatusFact> };

export const PROGRESS_META: ProgressMeta = commits.meta;
export const KERNEL_COMMITS: KernelCommit[] = commits.commits;

/** The public metadata mirror. The kernel repo itself stays private. */
export const MIRROR_URL = "https://gitlab.com/coconutlabs/coconutos-kernel-progress";
export const MIRROR_STATUS_URL = `${MIRROR_URL}/-/blob/main/status.json`;
export const MIRROR_COMMITS_URL = `${MIRROR_URL}/-/blob/main/commits.json`;

/** A scalar fact, or null when the generator could not derive it. */
export function fact(key: string): { value: string | number | null; source: string } {
  const entry = status.facts[key];
  if (!entry) return { value: null, source: "unknown" };
  const v = entry.value;
  const scalar = typeof v === "string" || typeof v === "number" ? v : null;
  return { value: scalar, source: entry.source };
}

/** Render a fact for display. Null is stated, never guessed at. */
export function factText(key: string): string {
  const { value } = fact(key);
  return value === null ? "not derivable" : String(value);
}

/** Oldest and newest commit dates in the record. */
export function commitSpan(): { first: string; last: string } | null {
  if (KERNEL_COMMITS.length === 0) return null;
  const dates = KERNEL_COMMITS.map((c) => c.date).sort();
  return { first: dates[0], last: dates[dates.length - 1] };
}
