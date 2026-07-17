# Fork-vs-upstream delta audit

Wayfinder research ticket #23. Audits what the Hourglass fork
(`hourglass-financial/distilled`) has changed relative to upstream
(`alchemy-run/distilled`), categorized as **bugfix / divergence / fork-only
infra**, with each entry flagged **keep-lesson-for-v2** or **v1-specific**.

## Refs compared

| Ref | SHA |
| --- | --- |
| `origin/main` (fork) | `c13282e431d2d7e88ba327d1fca355333d06b4f7` |
| `upstream/main` | `83666bc321a88f1d4881de55c94a1c1dc0fcf15c` |
| merge-base | `208876c146d124045f9bf2deec4d9c3a80ed043c` |

`git diff --stat upstream/main...origin/main` = 1259 files, ~198k insertions.
Most of that volume is regenerated operation/test files under fork-only packages
(`packages/erebor` 116 ops, `packages/persona` 201 ops) and test churn; the
*semantic* delta is concentrated in `packages/core`, a handful of shared provider
error tables, the CI workflows, and the private-package publishing scripts.

Method: `git diff upstream/main...origin/main`, plus `rg "HOURGLASS PATCH"` to
enumerate the fork's own intentional-divergence markers on shared files
(convention defined in `HOURGLASS.md`). Fork-only files carry no marker by
design, so they were found by tree comparison instead.

---

## Category A — Core-logic bugfixes upstream still lacks (all keep-lesson-for-v2)

These are the highest-value findings: correctness fixes the fork made to
**shared** code that upstream has not adopted. v2 must preserve the lesson.

### A1. `makeAPI` advertises the real error channel and requirements — keep-lesson-for-v2
- Evidence: `packages/core/src/client.ts` (marker at L564; new
  `ClientOperationError` type at L80).
- Upstream typed each operation's failure channel as just
  `InstanceType<E[number]>` and its requirements as just `Creds`. The fork
  introduces `ClientOperationError<OperationError, UniversalError, ParseError> =
  OperationError | UniversalError | ParseError | HttpClientError | HttpBodyError`
  and widens the requirement to `Creds | HttpClient.HttpClient |
  O["DecodingServices"]`.
- Why it matters: upstream's signature under-declared the error/requirement types
  — transport errors, body-encode errors, parse errors, and the `HttpClient`
  dependency were reachable at runtime but invisible to the type system. The fork
  makes the public contract honest. This is the change recorded in fork commit
  `0ba1fbe2f "fix(sdk): preserve precise operation error contracts"`.

### A2. `isErrorClassAllowedForOperation` — undeclared errors fall back to `Unknown*` — keep-lesson-for-v2
- Evidence: `packages/core/src/client.ts` L259 (marker).
- New helper gates status-mapped errors: an error class is only emitted if it is
  in the operation's declared `errors[]` **or** in the provider's universal error
  set; otherwise the client emits the provider `Unknown*Error`.
- Why it matters: without this gate, a status-mapped provider error would widen
  *every* operation's public error union beyond what the spec declares, breaking
  exhaustive error typing (the whole premise of this project). Upstream lacks the
  gate.

### A3. `buildRequestParts` throw is caught as a typed `ParseError` — keep-lesson-for-v2 (bugfix)
- Evidence: `packages/core/src/client.ts`, `innerFn` now wraps
  `Traits.buildRequestParts(...)` in `Effect.try({ catch: (cause) => new
  config.ParseError(...) })`.
- Upstream called `buildRequestParts` directly; a synchronous throw during
  request assembly (bad input encoding) surfaced as an **unhandled Effect
  defect** rather than a typed failure. The fork converts it into the declared
  `ParseError` channel.

### A4. Provider `*_ERROR_CODE_MAP` preserve constructor identities — keep-lesson-for-v2 (correctness)
- Evidence markers: `packages/azure/src/errors.ts` L289,
  `packages/coinbase/src/errors.ts` L566, `packages/expo-eas/src/errors.ts` L205.
- Upstream annotated these maps as `Record<string, new (props: any) => unknown>`,
  which **erases** each concrete error class's type. The fork drops the
  annotation so the map's value type retains the exact constructor union.
- Why it matters: this is the data side of A1/A2 — the shared client can only
  expose "the complete provider-specific error union" if the code map hasn't
  already collapsed every class to `unknown`. Paired change; upstream lacks it on
  all three providers.

### A5. WorkOS `UnknownWorkosError` is no longer force-classified as a retryable ServerError — keep-lesson-for-v2 (bugfix)
- Evidence: `packages/workos/src/errors.ts` L30 (marker).
- Upstream piped `UnknownWorkosError` through `Category.withServerError`, so any
  *unrecognized* error was categorized as a transient server failure and became
  **retryable**. The fork removes that; known 5xx classes keep their concrete
  `ServerError` categorization, but an unknown 4xx is no longer retried as if it
  were a 5xx.
- Why it matters: retry-logic correctness — upstream would silently retry
  non-transient unknown errors.

### A6. OpenAPI generator correctness fixes — keep-lesson-for-v2
- Evidence: `packages/core/scripts/generate-openapi.ts` (many markers), plus two
  fork-only core runtime helpers: `packages/core/src/openapi-additional-properties.ts`
  (new) and `packages/core/src/generated-schema.ts` (new), and query-serialization
  support in `packages/core/src/traits.ts` (markers L223, L765).
- Distinct fixes the fork's generator makes that upstream's does not:
  - **Query serialization styles** (`form` / `spaceDelimited` / `pipeDelimited` /
    `deepObject`, `explode`) carried from spec to runtime traits
    (`traits.ts`, `generate-openapi.ts` L136, L341, L1766).
  - **`additionalProperties` decoding** for mixed objects — named props + an index
    signature — via the new `openapi-additional-properties.ts`
    (`generate-openapi.ts` L615).
  - **Discriminated `oneOf` exclusive decoding** for unambiguous object unions
    while keeping upstream's generic union path (`generate-openapi.ts` L812).
  - **OpenAPI 3.1 `const`** treated as a literal even without a redundant `type`
    keyword (`generate-openapi.ts` L830).
  - **Composed request-body shape collection** — fields nested under
    `allOf`/`oneOf` request bodies are no longer dropped (`generate-openapi.ts`
    L1446).
  - **Multiple typed errors sharing one HTTP status** via
    `statusToErrorClass: Record<string, string | readonly string[]>`
    (`generate-openapi.ts` L220).
  - **Swagger 2.0 header/query param emission** and **configurable parameter
    field naming** that keeps wire names while normalizing TS field names
    (`generate-openapi.ts` L286, L1565, L1600).
  - **`GeneratedStructCodec`** keeps generated structs composable without paying
    the full inferred `Schema.Struct<{...}>` declaration-size cost
    (`generated-schema.ts` L21) — a `.d.ts` scalability fix.
- These are backed by fork-only generator tests (`packages/core/test/generate-openapi.test.ts`,
  `generated-schema-contract.test.ts`, and fixtures under
  `packages/core/test/fixtures/openapi/`).

---

## Category B — Divergences (intentional, mostly v1-specific)

Shared-file changes that are policy/scoping choices rather than portable
correctness fixes.

### B1. GitHub Actions pinned to full commit SHAs — v1-specific
- Evidence: markers in `.github/workflows/test.yml`, `deploy-website.yml`,
  `nuke.yml`. Reason given: "org policy requires it." Portable as a *practice*,
  but the specific pins are fork-org policy.

### B2. CI scoped to the fork's publishing surface — v1-specific
- `.github/workflows/test.yml`: excludes the WorkOS credentialed live suite
  ("not published by this fork") and adds Erebor path-based CI routing (private
  package or shared-core changes).
- `.github/workflows/pr-package.yml`: gates upstream preview packaging "until
  fork secrets exist."
- `.github/workflows/nuke.yml`: accepts Erebor as a fork-only cleanup target.
- Fork commit `c13282e43 "remove-workos-ci"` (origin/main HEAD) is part of this.

### B3. WorkOS operation error channel narrowed to universal errors — keep-lesson-for-v2
- Evidence: `packages/workos/src/client.ts` L29 (marker):
  `UniversalClientError = DefaultErrors | UnknownWorkosError`. Only errors that
  arise independently of an operation's OpenAPI response table belong in every
  operation channel. Same lesson family as A1/A2, applied at the provider layer.

### B4. WorkOS test-suite reorganization — mostly v1-specific
- New `packages/workos/test/client-contract.test.ts` (marker L25) typechecks the
  built-client contract independently of the "legacy WorkOS test suite, which
  still has unrelated strictness debt," plus `package-artifact.test.ts`,
  `organization-membership-schema.test.ts`, `tsconfig.contract-test.json`. The
  *contract-typecheck-in-isolation* pattern is a reusable lesson; the specific
  suite is v1.

### B5. Scripts migrated from an ad-hoc agent runner to Smithers — partly v1-specific
- `scripts/lib/agent.ts` (417 lines) **deleted**; `scripts/lib/smithers.ts`
  **added**. `scripts/create-sdk.ts` / `create-sdk-full.ts` rewritten to delegate
  scaffolding to the `sdk-create` Smithers workflow (per `AGENTS.md`). Tooling
  choice; the deterministic-workflow lesson is portable, the Smithers coupling is
  v1.

---

## Category C — Fork-only infrastructure

Net-new files that don't exist upstream. No `HOURGLASS PATCH` marker by
convention.

### C1. Fork-only SDK packages — v1-specific (the product)
- `packages/erebor` (the private Erebor client, the reason the fork exists) and
  `packages/persona`. These are the deliverables; their existence is v1-specific,
  but the *generation pipeline* that produces them is the reusable asset.

### C2. Private-package publishing pipeline — keep-lesson-for-v2 (pattern), v1-specific (specifics)
- Workflows: `.github/workflows/publish-erebor-private.yml`,
  `publish-persona-private.yml`.
- Scripts: `scripts/private-package-release.ts` (+ test),
  `scripts/prepare-github-erebor-packages.ts`,
  `prepare-github-persona-packages.ts`, `scripts/smoke-github-erebor-install.ts`,
  `smoke-github-persona-install.ts`, `scripts/lib/static-package-registry.ts` (+
  test), `scripts/lib/private-package-smoke.ts` (+ test),
  `scripts/private-package-workflows.test.ts`.
- Lesson (per `HOURGLASS.md`): publish immutable tarballs under a temporary run
  tag, verify the pair before moving the requested tag, require a merge-commit SHA
  reachable from `main`, and upload a receipt tying source + versions + integrity
  + normalized `lib/` digests to the run. This provenance/verification discipline
  is worth keeping in v2.

### C3. Private-package Effect-compatibility policy — keep-lesson-for-v2 (policy), v1-specific (version pin)
- Files: `scripts/check-effect-compatibility.ts` (+ test),
  `scripts/lib/effect-package-policy.ts` (+ test),
  `scripts/lib/installed-effect.ts` (+ test),
  `scripts/effect-compatibility-versions.json`
  (`typescriptVersion: 7.0.2`, `effectVersion: 4.0.0-beta.98`), and fixtures under
  `scripts/fixtures/effect-consumer/`.
- Lesson (per `HOURGLASS.md`): private core/Persona/Erebor packages expose Effect
  from the consumer's peer install and must **not** declare Effect as a direct
  dep; the publish-time peer contract is a *single verified prerelease*, not an
  open range, validated against a strict staged-artifact matrix (npm + Bun, one
  Effect install, strict decl checking, runtime import) served from a loopback-only
  registry. The pinned version is v1; the finite-verified-peer policy is the
  lesson.

### C4. Erebor spec/runbook glue — v1-specific (with one portable gap-fix)
- `scripts/fetch-erebor-docs.py` (mirrors password-gated Fern docs from
  `docs.erebor.bank`; no git submodule for the Erebor spec). Erebor-specific.
- `prune-orphans` (referenced in `HOURGLASS.md` step 4): `bun run generate` never
  deletes operation files for endpoints removed from the spec; this fork-local
  helper treats the regenerated `src/operations/index.ts` barrel as source of
  truth and removes orphaned op + test files. The **gap it closes is a general
  generator shortcoming** — keep-lesson-for-v2.

### C5. Fork documentation and skills — v1-specific
- `HOURGLASS.md` (fork conventions, patch marker convention, Erebor runbook,
  Effect-compat policy) and `skills-lock.json` / added `.claude` skills.

---

## Summary table

| ID | Change | Category | Flag |
| --- | --- | --- | --- |
| A1 | `makeAPI` real error channel + requirements | bugfix (core) | keep-for-v2 |
| A2 | `isErrorClassAllowedForOperation` gate | bugfix (core) | keep-for-v2 |
| A3 | `buildRequestParts` throw → typed `ParseError` | bugfix (core) | keep-for-v2 |
| A4 | Provider error maps preserve constructor identities | bugfix (providers) | keep-for-v2 |
| A5 | WorkOS unknown error not force-retryable | bugfix (provider) | keep-for-v2 |
| A6 | OpenAPI generator correctness fixes (7+) | bugfix (generator) | keep-for-v2 |
| B1 | Actions pinned to SHAs | divergence | v1-specific |
| B2 | CI scoped to fork publishing surface | divergence | v1-specific |
| B3 | WorkOS universal-error channel | divergence | keep-for-v2 |
| B4 | WorkOS test reorg / contract typecheck | divergence | mixed |
| B5 | agent.ts → Smithers migration | divergence | mixed |
| C1 | `packages/erebor`, `packages/persona` | fork-only | v1-specific |
| C2 | Private-package publishing pipeline | fork-only | keep-for-v2 (pattern) |
| C3 | Effect-compat finite-peer policy | fork-only | keep-for-v2 (policy) |
| C4 | Erebor spec glue + `prune-orphans` | fork-only | mixed |
| C5 | `HOURGLASS.md` + skills | fork-only | v1-specific |

## Headline: core-logic bugfixes upstream still lacks

The fork's most portable, highest-value work is the shared-client error-typing
overhaul (**A1–A5**) and the OpenAPI generator correctness fixes (**A6**). All
were made to shared code, none has been upstreamed, and every one directly serves
the project's "exhaustive error typing" thesis. v2 should treat these as required
baseline behavior, not fork extras.
