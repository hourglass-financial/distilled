# HOURGLASS

This repository is a private fork of [`alchemy-run/distilled`](https://github.com/alchemy-run/distilled),
maintained by Hourglass to ship the private Erebor client SDK
(`packages/erebor`). This document is the fork's documentation layer: it
collects the conventions, runbooks, and intentional divergences that are
specific to Hourglass and do not exist upstream. Upstream conventions still
live in `AGENTS.md`; everything here is additive on top of that.

Keep shared code as close to upstream as possible. Net-new, fork-only files
(such as `packages/erebor/**` or the Erebor-specific scripts) are not
divergences and do not need the marker described below.

## Fork Patch Conventions

When a **shared** file intentionally diverges from upstream, mark the nearby
change with a `HOURGLASS PATCH:` comment and a short reason:

```typescript
// HOURGLASS PATCH: <description>
```

Use the host file's valid comment syntax while preserving the marker text. For
example, YAML workflows should use:

```yaml
# HOURGLASS PATCH: <description>
```

Do not add invalid comments to JSON or lockfiles. For non-commentable shared
files such as `package.json` and `bun.lock`, keep the explanation in the nearest
commentable file that owns the behavior. Use `rg "HOURGLASS PATCH"` to discover
the current set of intentional fork patches.

## Updating the Erebor client for a new API spec

When Erebor ships changes to their API, regenerate the `@distilled.cloud/erebor`
client from their latest OpenAPI spec rather than hand-editing it. This runbook
is the proven, repeatable process — it leans on the repo's existing scripts and
keeps fork-specific glue minimal. It is designed to be run end-to-end by an
agent; every step is deterministic except the failure triage, which is itself
mechanical once you read the live API.

Credentials: the sandbox API key lives in `packages/erebor/.env`
(`EREBOR_API_KEY`). The docs password used by the spec fetcher is hardcoded in
`scripts/fetch-erebor-docs.py`. You need nothing else to run this against the
sandbox. All commands below run from `packages/erebor/` unless noted.

### 1. Pull the latest spec

```bash
bun run specs:update
```

This re-mirrors the password-gated Fern docs from `docs.erebor.bank` into
`specs/distilled-spec-erebor/specs/` (including `openapi.json`). It is the only
way the Erebor spec enters the repo — there is no git submodule for it.

### 2. Characterize the delta

Diff the refreshed `specs/distilled-spec-erebor/specs/openapi.json` against
`git HEAD` and enumerate: added/removed/renamed paths, per-operation response
status changes, and added/removed `components/schemas`. This delta drives every
decision below — compute it, do not guess. (A path-level/response-level/schema-level
diff with a small Node script over the before/after JSON is the fastest way.)

### 3. Reconcile the patch set

Patches live in `patches/*.patch.json` (RFC 6902 JSON Patch applied to the spec
before generation). Re-evaluate every patch entry against the new spec:

- **Redundant** — the new spec now declares what the patch added. Remove it.
- **Stale** — the patch targets a path/field the new spec removed or renamed;
  it would make `bun run generate` throw (`add` to a missing parent). Remove or
  retarget it.
- **Still needed** — a genuine spec-vs-reality drift the new spec still gets
  wrong. Keep or extend it.

Key fact that de-risks this: the per-operation `errors: [...]` arrays are
**type-channel only**. At runtime, `client.ts`'s `matchError` maps every
`status >= 400` response to a typed error globally by status + body, ignoring the
per-op array. So error-response patches are cosmetic once the spec declares the
statuses — trust the spec and prefer removing them. The patches that *matter* are
**response-schema** fixes (see step 5).

### 4. Regenerate and prune

```bash
bun run generate        # regenerate src/operations/ + barrel, apply patches, format
bun run prune-orphans   # delete op + test files for endpoints removed upstream
bun run check           # tsgo + oxlint + oxfmt --check, all must pass
```

`bun run generate` never deletes operation files for endpoints that disappeared
from the spec — `prune-orphans` (a fork-local helper) closes that gap by treating
the regenerated `src/operations/index.ts` barrel as the source of truth and
removing any orphaned `src/operations/<op>.ts` plus its `test/<op>.test.ts`.

### 5. Run the live suite and triage drift

```bash
bunx vitest run test
```

The suite runs against the live sandbox and is the discovery mechanism for
everything the spec gets wrong. Triage each failure into one bucket:

- **`EreborParseError` on a happy path → response-schema drift.** The live
  response does not match the generated output schema. Probe the raw response
  (`DEBUG=1`, or `curl`/`fetch` the endpoint) and add a JSON Patch on
  `components/schemas/<Name>` to: drop required fields the API omits, make
  fields the API returns `null` nullable, and add undocumented fields the API
  returns. Patch the shared component (operations `$ref` it) — not each
  operation. Re-run `bun run generate`.
- **Wrong typed error / status / value → test-expectation drift.** Update the
  test: new status enum values, server-side normalization (e.g. lowercased
  addresses), unique-per-run identifiers where the API enforces uniqueness
  (`Conflict`), or valid test data the API now requires. Never weaken a
  meaningful assertion just to pass.
- **Feature not enabled for the sandbox key.** Use the sanctioned skip pattern:
  detect the specific typed error (`EreborFeatureNotEnabled`, or a permanent
  "not yet available" `429`) and call `ctx.skip()` — never swallow it.
- **New operation with no test.** Add `test/<op>.test.ts` mirroring a sibling
  test, with happy-path + typed error coverage.

The SDK's error mapping lives in `src/client.ts` `matchError`; the typed error
classes in `src/errors.ts`. If a standard HTTP error ever falls through to
`UnknownEreborError`, that is an SDK bug — fix `matchError`, do not assert the
Unknown error in a test.

### 6. Verify and open a PR

Re-run `bunx vitest run test` until green (justified `ctx.skip()`s are fine),
then `bun run check`. Open a PR following the conventions in `AGENTS.md`,
summarizing the spec delta, the patch reconciliation, and the test changes.
