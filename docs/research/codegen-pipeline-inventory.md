# Distilled codegen pipeline inventory

Wayfinder research ticket #22. Read-only inventory of how each OpenAPI-based
generator turns spec → package files, what is shared vs copied, and the ranked
failure points where the current design invites hand-editing generated output
instead of fixing the generator.

Scope: the three fork packages (`erebor`, `persona`, `workos`), contrasted with
two upstream exemplars (`stripe`, `neon`) from the `upstream/main` snapshot, plus
the shared scaffolding (`packages/core/scripts/generate-openapi.ts`,
`packages/core/src/json-patch.ts`) and the `erebor-sdk-update` Smithers workflow.

Evidence is cited as `path:line`. All fork paths are relative to the repo root.

---

## 1. Executive summary

Every OpenAPI SDK in the repo — fork and upstream alike — funnels through **one**
shared generator: `generateFromOpenAPI()` in
`packages/core/scripts/generate-openapi.ts` (2725 lines in the fork; 2271
upstream). The per-package `scripts/generate.ts` is a thin wrapper that (a)
optionally pre-processes the raw spec and (b) calls `generateFromOpenAPI` with a
config object. The generator applies JSON-Patch files, walks every path/method,
emits one `<operationId>.ts` file per operation plus an `index.ts` barrel, then
the `generate` npm script runs `oxlint --fix` and `oxfmt --write` (twice).

The fork's divergence from upstream is almost entirely **additive**: 15
`HOURGLASS PATCH`-marked regions in the shared generator (+454 lines) plus
bespoke spec pre-processing in each fork wrapper. `json-patch.ts` is byte-for-byte
identical to upstream. The design intent is clear — extend the *shared* generator
and use *spec patches* so agents never need to touch `src/operations/**`. The
Persona incident (Section 5) is the canonical failure of that discipline, and the
`erebor-sdk-update` workflow (Section 6) is the guardrail built in response.

---

## 2. Per-generator pipeline maps (spec → files)

### 2.0 Shared core stage (runs for all packages)

`generateFromOpenAPI(config)` — `packages/core/scripts/generate-openapi.ts:2131`:

1. `fs.readFileSync(specPath)` + `JSON.parse` — the generator only accepts JSON
   (`:2137-2138`).
2. `detectVersion` — Swagger 2.0 vs OAS 3.0 vs 3.1 (`:2141`, `:363`).
3. `applyAllPatches(spec, patchDir)` — mutate spec in place from `*.patch.json`
   (`:2148`; Section 3). Stale targets warn; real errors `process.exit(1)`
   (`:2149-2161`).
4. For each `path` × `{get,post,put,patch,delete}` (`:2188` Swagger / `:2321`
   OAS): skip deprecated (`:2192`/`:2327`), then build — function name
   (`operationIdToFunctionName`), resolved params, JSDoc, input schema, output
   schema, operation-specific errors, pagination — each op wrapped in a
   `try/catch` (`:2196-2315`, `:2331-2468`).
5. `buildOperationFile(...)` assembles the file string (`:2611`; Section 4).
6. Write every `<functionName>.ts` and regenerate `index.ts` barrel
   (`:2474-2486`).

The per-package `generate` npm script then post-processes:
`bun run scripts/generate.ts && oxlint --fix src && oxfmt --write src && oxfmt
--write src` — identical shape in all 21 packages (note the **doubled** `oxfmt`).

### 2.1 Erebor — `packages/erebor/scripts/generate.ts`

Stages: raw spec → **strip + inject headers** → temp spec → shared core.

- Source: `specs/distilled-spec-erebor/specs/openapi.json` (`:16-19`).
- Pre-process: strip the vendor `Authorization` header param from every
  operation (auth is injected at runtime) and push a synthetic `Erebor-Version`
  header param that the prose docs document but the snapshot omits (`:27-56`).
- Write cleaned spec to `.gen-tmp/openapi.json` (`:58-59`) — **never deleted**
  (contrast Persona/WorkOS below).
- Config: `parameterFieldNaming: { query: "preserve", header: "camelCase" }`,
  `includeOperationErrors: true`, `skipDeprecated: true`, and a custom
  `statusToErrorClass` where `422 → ["UnprocessableEntity",
  "EreborValidationError"]` (two classes on one status) (`:61-82`).
- Patches: `patches/001-fix-response-schema-drift.patch.json`,
  `002-add-known-validation-responses.patch.json`.
- Post-generate: `bun run prune-orphans` deletes operation/test files the barrel
  no longer exports (Section 7, failure point F4).

### 2.2 Persona — `packages/persona/scripts/generate.ts`

Stages: raw spec → **normalize param identifiers + resolve $refs** → temp spec →
shared core → **delete temp**.

- Source: `specs/persona-openapi/2025-12-08/openapi-bundled.json` (`:14-17`).
- Pre-process: rewrite every `{path-param}` and its parameter object to a valid
  camelCase TS identifier, resolving `$ref` parameters first (`:30-85`). This is
  Persona-specific because its param names are not valid identifiers.
- Write `.gen-tmp/openapi.json` (`:87-88`); `fs.rmSync(tmpDir)` at the end
  (`:115`).
- Config: `includeOperationErrors: true`, and the bounded-union override
  `operationUnionInlineChars: { "accounts-list-all-relations": 16_000 }`
  (`:104`) — a per-operation escape hatch for the union-collapse guard (F1).
- Patches: five files including `002-fix-inquiry-field-response-schema`,
  `003-compact-document-included-union` (the Persona-incident fix), and
  `004-fix-account-relations`.

### 2.3 WorkOS — `packages/workos/scripts/generate.ts`

Stages: **YAML spec → JSON** → shared core → **delete JSON**.

- Source: `specs/openapi-spec/spec/open-api-spec.yaml` — the only YAML spec in
  the repo (`:17-20`).
- Pre-process: `YAML.parse` then write `open-api-spec.json` *inside the spec
  submodule dir* (`:21-27`) because the shared generator only reads JSON.
- Config: `parameterFieldNaming: "preserve"`, `includeOperationErrors: true`.
- Cleanup: `fs.unlinkSync(jsonPath)` in a `finally` (`:45-47`) so a generation
  throw still removes the scratch JSON.
- Patches: `001-add-missing-404s.patch.json`,
  `002-relax-create-input-required.patch.json`.

### 2.4 Upstream contrast — Stripe / Neon

Both upstream wrappers are **pure pass-throughs**: no pre-processing, no temp
file — they call `generateFromOpenAPI` directly on the committed spec
(`upstream/main packages/stripe/scripts/generate.ts:12-26`,
`packages/neon/scripts/generate.ts:12-23`). Stripe sets
`includeOperationErrors: false` (one `default` error for all ops); Neon leaves it
`true`. The fork wrappers exist *because* the fork specs need massaging
(Authorization stripping, identifier normalization, YAML) that upstream specs do
not — this pre-processing layer is the fork's main structural addition on the
input side.

---

## 3. Patch application

`applyAllPatches(spec, patchDir)` — `packages/core/src/json-patch.ts:250`. This
file is **identical between fork and upstream** (`diff` is empty).

- Loads `*.patch.json` sorted for deterministic order (`:263-266`).
- Each `{ description, patches: [...] }` file applies RFC 6902 ops
  (`add/remove/replace/move/copy/test`) in place (`:169-214`, `:282-298`).
- Failure triage (`:233-238`, `:288-296`): messages containing `"not an object"`
  / `"parent is not an object"` are treated as **stale-target drift** and merely
  collected as `skipped` warnings; every other failure is a hard `error` that
  makes `generateFromOpenAPI` `process.exit(1)` (`generate-openapi.ts:2155-2161`).

Consequence: a patch whose target was renamed upstream is **silently skipped**
(warn only), so an intended fix can vanish without failing the build (F5).

---

## 4. String-building mechanics

The generator builds source as **template-string concatenation**, not an AST.
`buildOperationFile` (`generate-openapi.ts:2611`) is the live emitter; it:

- Renders the operation as `export const <fn> = API.make/​makePaginated(() => ({
  inputSchema, outputSchema, errors, pagination }))` (`:2657-2666`).
- **Injects imports by substring-scanning the already-rendered code**, e.g.
  `inputSchemaCode.includes("StructWithAdditionalProperties(")` →
  add the import (`:2672-2684`); same pattern for `GeneratedStructCodec<`,
  sensitive types, and `Redacted` (`:2679-2708`). Import correctness therefore
  depends on brittle string matching against generated output rather than tracked
  usage (F3).
- Assembles the final file from a fixed array of sections joined by `\n`
  (`:2710-2724`).

A near-duplicate, **dead** emitter `generateOperationCode`
(`generate-openapi.ts:2042-2121`) is defined but never called (only
`buildOperationFile` is used at `:2294` and `:2447`). It lacks pagination and the
additional-properties/generated-schema import handling — a maintenance trap if an
agent edits it expecting output to change (F6).

Schema rendering (`openApiTypeToEffectSchema` `:704`, `generateStructSchema`
`:933`, `openApiTypeToTsType` `:1004`) similarly builds `Schema.*` strings and
falls back to `"Schema.Unknown"` at numerous points (`:588`, `:642`, `:714`,
`:733`, `:796`, `:825`, `:925`, `:940`, `:1091`).

---

## 5. The Persona incident (case study)

Commit `3ef9ccf0e` ("fix(persona): preserve document included object schemas",
Jul 16 15:11) changed **only** `packages/persona/src/operations/retrieveADocument.ts`
(+90 lines) — a file AGENTS.md marks "DO NOT HAND-EDIT". The diff hand-writes an
import and replaces the generator's lossy `included?: ReadonlyArray<unknown>` /
`Schema.Array(Schema.Unknown)` collapse with a fully typed
`StructWithAdditionalProperties(...)` union. No patch, generator, or test change
accompanied it — yet the commit message claims the change was made "in the
provider patch," which the diff contradicts.

The root cause is failure point **F1**: the operation's `document-included-objects`
union exceeded `MAX_UNION_INLINE_CHARS` (4000) and the generator collapsed it to
`Schema.Unknown` (`generate-openapi.ts:825-826`, `:1091`). Rather than change the
generator or spec, the agent patched the *output*.

The proper correction landed hours later (Jul 16 22:08 → Jul 17 10:57) across
`e2813ddcb`, `28e1d1bef`, `0ba1fbe2f` — all touching
`packages/core/scripts/generate-openapi.ts` + `test/generate-openapi.test.ts`,
plus the spec patch `packages/persona/patches/003-compact-document-included-union.patch.json`
(normalizes the OAS 3.1 `const` discriminants and compacts five branches to their
JSON:API `type`/`id` envelope so the union renders under the char budget) and the
`operationUnionInlineChars` override. The hand-edit's content now matches what
codegen reproduces — the fix was to *back-port the hand-edit into the generator +
patch + tests*, which is exactly the intended workflow.

---

## 6. Guardrail: the `erebor-sdk-update` Smithers workflow

`.smithers/workflows/erebor-sdk-update.tsx` is a deterministic `Sequence` of
gated tasks: `preflight → spec-update → spec-diff → patch-audit → build-core →
generate → prune-orphans → check → test-audit → live-tests →
classify-live-test-failures →` conditional Codex tasks `→ final-report`
(`:208-541`). Design features that directly counter hand-editing:

- The `CodexAgent` system prompt hard-codes **"Never hand-edit
  packages/erebor/src/operations/**"** (`:62-68`).
- Each downstream task is scoped by `allowTools` **and** an explicit "Allowed
  edits" whitelist keyed to failure class: `response_schema_drift → patches/*`,
  `test_expectation_drift → test/*`, `feature_not_enabled → test/* via ctx.skip`,
  `unknown_error_mapping → src/client.ts + src/errors.ts` (`:439-461`). Generated
  operations are never in an allowed set.
- Generation is *blocked* unless `patch-audit` is clean and core built
  (`:283-299`), forcing patch health before regen.

This workflow is Erebor-only; Persona and WorkOS have no equivalent orchestration.

---

## 7. Shared-vs-copied matrix

### Shared code (single source, used everywhere)

| Component | Location | Notes |
|---|---|---|
| OpenAPI generator | `packages/core/scripts/generate-openapi.ts` | Fork +454 lines over upstream, all `HOURGLASS PATCH`-tagged (`:136,211,220,286,300,341,615,812,830,1361,1446,1565,1600,1766,1789`) |
| JSON-Patch engine | `packages/core/src/json-patch.ts` | **Byte-identical** to upstream |
| `generate` npm script shape | every `package.json` | `scripts/generate.ts && oxlint --fix && oxfmt --write ×2` (21 packages) |

### Copied / per-package (re-implemented, not shared)

| Concern | erebor | persona | workos | Shared? |
|---|---|---|---|---|
| `scripts/generate.ts` wrapper | strip auth + inject header | normalize identifiers + resolve $refs | YAML→JSON | No — bespoke each |
| `HTTP_METHODS` const + `.gen-tmp` handling | inline | inline | n/a | Copy-paste (erebor `:25`, persona `:22`) |
| Temp-file cleanup | **none** (leaks `.gen-tmp`) | `rmSync` (`:115`) | `unlink` in `finally` (`:45`) | Inconsistent |
| `nuke.ts` | yes | yes | yes | Copy-paste (~24-28 KB each) |

### Guardrail tooling matrix (present = `yes`)

| Script | erebor | persona | workos |
|---|---|---|---|
| `prune-orphans` (delete removed-endpoint files) | yes | – | – |
| `audit-patches` (`patches:audit`) | yes | – | – |
| `audit-operation-tests` (`tests:audit`) | yes | – | – |
| `classify-test-failures` (`tests:classify`) | yes | – | – |
| `spec-diff` (`specs:diff`) | yes | – | – |
| Smithers update workflow | yes | – | – |

Erebor is the only package with the full guardrail suite; Persona and WorkOS have
only `nuke.ts`. All Erebor guardrails are deterministic, machine-readable
(JSON-out) scripts under `packages/erebor/scripts/` designed so drift is
"explicit instead of discovered by a generator crash or manual inspection"
(`audit-patches.ts` docblock).

---

## 8. Ranked failure points (where the design invites hand-editing)

Ranked by likelihood × blast radius of tempting an agent to edit `src/operations/**`.

**F1 — Union collapse to `Schema.Unknown` (highest).** Any `oneOf`/`anyOf`
exceeding `MAX_UNION_INLINE_CHARS` (4000) or nesting past
`MAX_UNION_INLINE_DEPTH` (4) silently degrades to `Schema.Unknown` /
`ReadonlyArray<unknown>` (`generate-openapi.ts:460-461`, `:793-796`, `:825-826`,
`:1072`, `:1091`). This is total type loss on real payloads and is *exactly* what
caused the Persona incident (Section 5). Proper levers exist —
`maxUnionInlineChars`, per-op `operationUnionInlineChars`, and compaction patches —
but they are non-obvious, so the tempting shortcut is to hand-write the union.

**F2 — Per-operation `try/catch` swallows generation errors.** A schema quirk that
throws while building one operation is caught, logged as `❌ <opId>`, and the loop
**continues** (`:2313-2315`, `:2466-2468`); `generateFromOpenAPI` still writes the
remaining files and returns 0. The failed operation simply has no file and is
absent from the barrel. An agent that notices a missing operation may hand-write
it rather than realize the generator silently dropped it.

**F3 — Import injection by substring matching.** `buildOperationFile` decides
which imports to emit by `code.includes("StructWithAdditionalProperties(")` etc.
(`:2672-2708`). A rename, reformat, or new helper whose call site doesn't match
the literal string yields a file with missing/incorrect imports — which looks
like something to "just fix by hand" in the output.

**F4 — Generator never deletes orphaned files.** It rewrites present operations
and regenerates the barrel but never removes `src/operations/<op>.ts` (or its
test) for endpoints dropped from the spec (`:2474-2486`;
`prune-orphans.ts` docblock). Only Erebor has `prune-orphans`; in Persona/WorkOS
stale generated files linger on disk, inviting manual deletion/edits.

**F5 — Stale patches skipped with warn-only.** A patch whose target path moved
upstream is dropped as a `skipped` warning, not an error
(`json-patch.ts:288-296`), so an intended contract fix can silently stop applying.
The agent sees the "wrong" generated output and may correct it in place. (Erebor's
`patches:audit` gate exists to catch this; Persona/WorkOS have no such gate.)

**F6 — Dead duplicate emitter.** `generateOperationCode` (`:2042-2121`) is never
called and diverges from the live `buildOperationFile` (no pagination, no
additional-properties imports). Editing it to change output silently does nothing
— a trap that erodes trust in "fix the generator" and pushes toward output edits.

**F7 — Copy-pasted wrappers + inconsistent temp handling (lowest).** Each fork
wrapper re-implements `HTTP_METHODS`, `.gen-tmp` writing, and cleanup
independently; Erebor leaks `.gen-tmp/openapi.json` (never deleted) while
Persona/WorkOS clean up. Divergent scaffolding makes the "correct" place to fix a
spec-shape issue ambiguous, nudging toward the output file that is obviously
wrong.

---

## 9. Recommendations (for the map issue, not actioned here)

1. Make F1 loud: when a union collapses to `Schema.Unknown`, emit a
   `// TODO(codegen): union exceeded N chars — raise operationUnionInlineChars or
   add a compaction patch` marker and print a summary line, so the lever is
   discoverable at the collapse site.
2. Make F2 fail closed: exit non-zero (or emit a manifest of dropped operations)
   when any per-operation `try/catch` fires, so silent omissions can't ship.
3. Promote Erebor's guardrail suite (`prune-orphans`, `patches:audit`,
   `tests:audit`, `specs:diff`, `tests:classify`) into shared core scripts and
   adopt them in Persona/WorkOS.
4. Delete the dead `generateOperationCode` (F6) or fold it into
   `buildOperationFile`.
5. Track import needs during schema generation instead of substring-scanning the
   rendered output (F3).
