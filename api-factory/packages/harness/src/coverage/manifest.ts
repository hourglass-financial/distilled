/**
 * The coverage manifest — the hand-authored, per-operation testing ledger
 * (#30, decisions 1–4).
 *
 * `vendors/<v>/tests/coverage.ts` default-exports a literal
 * `satisfies CoverageManifest<OperationName>` (the key union comes from the
 * generated client's registry, so a missing or stale entry is already a tsc
 * error). One entry per IR operation, keyed by resolved public name
 * (`organizations.create`); the pagination trio is one operation and gets
 * one entry. Two independent lanes per entry. No machinery ever writes this
 * file — the audit prints stubs for a human or agent to paste.
 */

/** Reason-bearing object form, mandatory for `skip` and `untestable`. */
export interface ReasonedStatus<S extends string> {
  readonly status: S;
  /** Why — cited, reviewable, and required. */
  readonly reason: string;
  /** Optional supporting link (ticket, vendor doc). */
  readonly ref?: string;
}

/**
 * Contract-lane status. Every operation is mock-testable by construction,
 * so there is no `untestable` here.
 */
export type ContractStatus = "tested" | "todo" | ReasonedStatus<"skip">;

/**
 * Live-lane status. `untestable` is reviewed steady state — this operation
 * cannot be live-tested for a durable, cited reason (e.g. Directory Sync
 * needs a real SCIM-pushing IdP). `todo`/`skip` are burn-down debt.
 */
export type LiveStatus =
  | "tested"
  | "todo"
  | ReasonedStatus<"skip">
  | ReasonedStatus<"untestable">;

/** One operation's coverage across both lanes. */
export interface CoverageEntry {
  readonly contract: ContractStatus;
  readonly live: LiveStatus;
}

/**
 * The manifest shape. Instantiate the key union from the generated
 * registry — `satisfies CoverageManifest<OperationName>` — so tsc enforces
 * exhaustiveness before the audit ever runs.
 */
export type CoverageManifest<Op extends string = string> = Readonly<
  Record<Op, CoverageEntry>
>;

/** The simple (string) status names of a lane entry. */
export const statusOf = (
  value: ContractStatus | LiveStatus,
): "tested" | "todo" | "skip" | "untestable" =>
  typeof value === "string" ? value : value.status;

/** A structural problem found while validating one manifest entry. */
export interface EntryProblem {
  readonly key: string;
  readonly lane: "contract" | "live" | "entry";
  readonly problem: string;
}

const validStatus = (
  value: unknown,
  lane: "contract" | "live",
): string | undefined => {
  if (value === "tested" || value === "todo") return undefined;
  if (typeof value === "string") {
    return `bare status "${value}" is not allowed — "skip"${
      lane === "live" ? ` and "untestable"` : ""
    } require the object form with a reason`;
  }
  if (typeof value !== "object" || value === null) {
    return "status must be a string or a { status, reason } object";
  }
  const record = value as Record<string, unknown>;
  const status = record.status;
  const allowed = lane === "live" ? ["skip", "untestable"] : ["skip"];
  if (typeof status !== "string" || !allowed.includes(status)) {
    return `object-form status must be one of ${allowed
      .map((name) => `"${name}"`)
      .join(", ")}`;
  }
  if (typeof record.reason !== "string" || record.reason.trim().length === 0) {
    return `"${status}" requires a non-empty reason`;
  }
  if (record.ref !== undefined && typeof record.ref !== "string") {
    return "ref must be a string when present";
  }
  return undefined;
};

/**
 * Runtime-validate an untyped manifest value (the audit CLI imports vendor
 * modules dynamically, so tsc's guarantees are not in scope there). Returns
 * structural problems; an empty array means the value is a well-formed
 * {@link CoverageManifest}.
 */
export const validateManifest = (value: unknown): readonly EntryProblem[] => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [
      {
        key: "*",
        lane: "entry",
        problem: "manifest must be an object of operation entries",
      },
    ];
  }
  const problems: EntryProblem[] = [];
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "object" || entry === null) {
      problems.push({ key, lane: "entry", problem: "entry must be an object" });
      continue;
    }
    const record = entry as Record<string, unknown>;
    for (const extra of Object.keys(record)) {
      if (extra !== "contract" && extra !== "live") {
        problems.push({
          key,
          lane: "entry",
          problem: `unknown field "${extra}"`,
        });
      }
    }
    const contractProblem = validStatus(record.contract, "contract");
    if (contractProblem !== undefined) {
      problems.push({ key, lane: "contract", problem: contractProblem });
    }
    const liveProblem = validStatus(record.live, "live");
    if (liveProblem !== undefined) {
      problems.push({ key, lane: "live", problem: liveProblem });
    }
  }
  return problems;
};
