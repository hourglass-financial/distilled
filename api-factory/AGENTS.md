# api-factory — agent guardrails

This file governs everything under `api-factory/`. It **encodes** decisions
already resolved on [wayfinder map #20](https://github.com/hourglass-financial/distilled/issues/20)
— each section links the ticket that decided it; rationale and rejected
alternatives live there. Do not re-decide here: if a change you want
contradicts this file, the move is an ADR or a ticket, never a quiet
divergence.

The root `AGENTS.md` still applies for repo-wide conventions — PR format,
Effect 4 verification discipline, tracker mechanics
(`docs/agents/issue-tracker.md`: every `gh` call pins
`-R hourglass-financial/distilled`). Its v1-specific sections (root
`packages/*`, the v1 patch table, per-package scripts) do **not** apply in this
tree; this file supersedes them.

## Ownership: the one rule

Every path in this workspace belongs to exactly one of three classes. The
class determines the only legitimate way to change the path. Everything else
in this file is elaboration. Decided in
[#27](https://github.com/hourglass-financial/distilled/issues/27).

| Class | Meaning | Legitimate change | Enforcement |
|---|---|---|---|
| **machine-owned** | *reproduced* — deterministic output of generation from checked-in inputs | regenerate | hermetic regen + empty byte-diff against the committed tree |
| **machine-locked** | *attested* — written only by the acquisition command; not reproducible (the vendor moves under you) | re-run acquisition | hash attestation against the provenance record |
| **agent-writable** | *reviewed* — hand edits (agent or human alike) under normal GitHub review | edit + review | package gates + audits |

There is **no human-owned class**. The mechanically enforced boundary is
machine vs hand. Where a human-vs-agent distinction matters, it is workflow
policy — a Smithers task's allowed-edit set — never a repo class.

## Layout and class map

Workspace shape and package naming decided in
[#26](https://github.com/hourglass-financial/distilled/issues/26): standalone
Bun + Turborepo + TypeScript 7 (tsgo) workspace, zero coupling to the v1
workspace at the repo root, publishing (later) to GitHub Packages as
`@hourglass-financial/api-factory-<name>`.

```
api-factory/
├── packages/                 # agent-writable — factory machinery, hand-written
│   ├── core/                 # runtime: planRequest, error matcher, retry, pagination, redaction, rawRequest
│   ├── codegen/              # engine: frontends/ → ir/ → emit/, pipeline, cli
│   └── harness/              # test kit: liveTest/contractTest, resource(), probe(), coverage audit
├── clients/                  # machine-owned — 100% generated, every file
│   └── workos/               # src/*, test/*, MANIFEST — byte-reproducible from vendors/workos
└── vendors/                  # per-vendor input + test home (two classes side by side)
    └── workos/
        ├── (spec snapshot + provenance record)   # machine-locked
        ├── patches/          # agent-writable — document patches (spec-fact corrections)
        ├── (vendor config)   # agent-writable — declarative data selecting engine capabilities
        ├── probes/           # agent-writable — named raw-request specs
        ├── evidence/         # scrubbed captures, written by the probe tooling
        └── tests/            # agent-writable — contract + live suites, coverage.ts
```

Two structural consequences (both from #27):

- `clients/<vendor>` is 100% machine-generated — **every file**, including its
  tests and `MANIFEST`. Per-vendor hand-written logic (error mapping,
  credentials, auth quirks, retry defaults) is *machinery*: it lives in
  `packages/` and is imported by generated code. The ownership boundary is the
  directory tree itself — wholesale, no file-level bookkeeping.
- A hand edit under `clients/` is not merely against the rules; it is a build
  failure. The regen gate byte-compares a hermetic regeneration against the
  committed tree and fails on any diff.

## Layer model

Per vendor, seven layers from acquisition to tests
([#27](https://github.com/hourglass-financial/distilled/issues/27)):

| # | Layer | Artifact | Class | Enforced by |
|---|---|---|---|---|
| L0 | Acquisition | `vendors/<v>/` spec snapshot + provenance record (source URL, upstream tag/sha, fetch date, content hash) | machine-locked | attestation audit: snapshot hash vs provenance |
| L1 | Contract fixes | `vendors/<v>/patches/` + vendor config | agent-writable | patch-locality gate: declared blast radius vs actual regen diff |
| L2 | Normalized spec | patched/normalized form | machine | ephemeral — never an artifact |
| L3 | IR | typed, fully-resolved operation model inside `packages/codegen` | machine | ephemeral + dumpable (`--emit-ir`); golden fixtures only in codegen's own tests |
| L4 | Generated client | `clients/<v>/**`, including a generated `MANIFEST` of paths + content hashes | machine-owned | hermetic regen + empty byte-diff; fast check verifies `MANIFEST` hashes without regenerating |
| L5 | Runtime + machinery | `packages/core`, `packages/codegen`, `packages/harness`, per-vendor plugin packages | agent-writable | review + package gates + golden emitter fixtures |
| L6 | Tests + coverage manifest | `vendors/<v>/tests/` | agent-writable | coverage audit: every operation tested / todo / skip / untestable; an unlisted op fails the run |

The IR is a program-internal compiler boundary, not a repo layer: typed,
ephemeral, dumpable, never checked in.

## Fixing things: sanctioned paths only

When a client is wrong, find the row that matches the symptom. Fix-path split
decided in [#29](https://github.com/hourglass-financial/distilled/issues/29)
(patches vs vendor config) and
[#31](https://github.com/hourglass-financial/distilled/issues/31) (config vs
engine).

| Symptom | Sanctioned fix | Where |
|---|---|---|
| Spec states a wire fact wrongly — missing error, wrong `required`, wrong shape, missing sensitive marking | **document patch**: typed kind, mandatory precondition, structured blast radius, evidence | `vendors/<v>/patches/` |
| Wire-behavior fact no spec edit can express — error-code matcher, dispatch quirk | **vendor config**, never a patch | `vendors/<v>/` config |
| Provider quirk axis — auth scheme, envelope shape, pagination mode, retry mapping, error dispatch | select an **engine capability** in vendor config; if the config can't express it, grow a reviewed engine capability every vendor can use | `vendors/<v>/` config → `packages/codegen` |
| Leaked internal codename or bad derived name | **naming override** in vendor config (never a patch rewriting operationIds) | `vendors/<v>/` config |
| Spec is right, emitted TypeScript is wrong | fix the **engine**, with a synthetic fixture reproducing the construct | `packages/codegen` |
| Runtime behavior — retry semantics, redaction, request planning | fix **core machinery** | `packages/core` |
| Missing or dishonest test coverage | edit the suites + `coverage.ts` | `vendors/<v>/tests/` |

**Never:**

- **Never edit `clients/<vendor>/**`.** Any byte fails the regen gate. Every
  emitted file carries an `@generated` DO-NOT-EDIT banner naming the
  sanctioned fix path.
- **Never edit the spec snapshot or its provenance record.** The attestation
  audit fails. The only sanctioned contract-fix move is a patch — visible,
  reviewed, blast-radius-gated. (This closes the hole one layer above v1's
  Persona hand-edit incident.)
- **Never weaken fail-closed into warn-and-continue.** A dropped operation, an
  unrepresentable construct, a non-applying patch entry: each is a hard error
  naming the construct or entry, never a logged skip with exit 0.
- **Never feed vendor-supplied code into the pipeline.** Vendor config is pure
  data validated by an engine-defined Effect Schema — no hooks, no IR patches.
- **Never hit the API with plain `fetch` in tests or probes.** Use core's
  `rawRequest()` / harness `probe()` — plain fetch loses Redacted secret
  handling, probe identity for patch links, and the scrub/evidence trail.

Patch rules ([#29](https://github.com/hourglass-financial/distilled/issues/29)):

- Patches carry **spec facts only** and target the attested L0 snapshot via
  exact JSON Pointers. JSONPath/Overlay targeting is permanently out.
- Use a **typed patch kind**; raw RFC 6902 is a policed escape hatch, and
  every use of it is the signal to grow the kind vocabulary.
- Every entry declares: a mandatory **precondition** (upstream adopting the
  fix forces reconciliation, never silent double-application); a structured
  **blast radius** (target role `request | response | error | metadata`,
  enumerated affected operations, expected regenerated files — the gate fails
  on any asymmetry against the actual regen diff, in either direction); and
  structured **provenance** (evidence type, endpoint + capture date,
  observed-vs-spec'd value, authored-against spec hash, reporter).
- Entries claiming observed behavior link a **sanitized evidence artifact**
  checked in under `vendors/<v>/evidence/` — never a gitignored workspace.
- Patches are **minimal and local**. The v1 WorkOS blanket patch (124 removes
  across shared component schemas) is the canonical counterexample.

## Enforcement spine

Local commands plus one publish gate
([#27](https://github.com/hourglass-financial/distilled/issues/27)). **CI is
publish-only** — no per-PR or nightly lanes, a standing preference. Tests,
audits, and boundary gates run locally, directly or as Smithers workflow
gates, and again inside the publish pipeline.

1. **Regen gate** — hermetic regeneration from `vendors/<v>/` into a temp
   tree, byte-compared against committed `clients/<v>/`. Any diff fails,
   naming the offending files. Catches hand-edits *and* forgot-to-regen.
2. **Fail-closed generator** — dropped op, unrepresentable construct, union
   collapse: hard error naming the construct.
3. **Attestation, patch-locality, and coverage audits** — deterministic
   JSON-out local commands, invoked as Smithers workflow gates.
4. **Publish gate** — publishing re-runs the full gate set before any tag
   moves. A locally-disguised violation cannot ship: regen from attested
   inputs will not reproduce a tampered file.
5. **`@generated` banners** — every emitted file names the sanctioned fix
   path. Banners are versionless; provenance (spec hash, config hash, engine
   version) lives in the `MANIFEST` only.

Codegen invariants that keep the spine honest
([#31](https://github.com/hourglass-financial/distilled/issues/31)): the IR is
**fully resolved** (final names, error tuples, retry dispositions, pagination
projections — `--emit-ir` is the complete review artifact); **canonical sort
everywhere**, so a vendor reshuffling its spec produces a zero-byte diff and
every regen diff is semantic; determinism is scoped to the lockfile-pinned
toolchain; every engine change lands with a synthetic per-construct fixture,
and the WorkOS client is the end-to-end golden.

## Testing contract

Decided in [#30](https://github.com/hourglass-financial/distilled/issues/30).
The short version an agent must know:

- **Coverage manifest**: `vendors/<v>/tests/coverage.ts`, a hand-authored
  typed module (`satisfies CoverageManifest` from `packages/harness`), one
  entry per operation keyed by resolved public name (`organizations.create`);
  the pagination trio is one entry. Two independent lanes per entry:
  `contract: tested | todo | skip` and `live: tested | todo | skip |
  untestable`. `skip` and `untestable` require a `reason`.
- **`untestable` is live-lane-only steady state** (e.g. Directory Sync needs a
  real SCIM-pushing IdP); `todo`/`skip` are burn-down debt. Don't blur them.
- **No machinery ever writes the manifest.** The coverage audit hard-fails on
  drift in both directions — new op unlisted, stale entry for a removed op —
  and prints paste-ready stubs for you to commit as a reviewed edit.
- **`tested` is a verified fact, not a claim**: `liveTest`/`contractTest`
  stamp the covered op key into test titles and a harness reporter fails the
  run when a lane's `tested` entry had no exercised test (scoped to
  capabilities actually present). Coverage *floors* are Smithers gate policy
  over the audit's JSON, never the audit's job.
- **Cleanup**: use harness `resource(create, destroy)`
  (`Effect.acquireRelease`; teardown registers atomically, runs on failure and
  interruption, composes LIFO). Never leave a created resource behind.
- **Naming**: every live resource name embeds the per-process run id via the
  harness helper — `distilled-af-{vendor}-{name}-{testRunId}`. Never a bare
  deterministic name.
- **Environment**: vendor env is capability-declared (`defineEnv`); live tests
  state `needs` and skip visibly naming the missing capability. A skip is not
  verification — sign-off means the live suite ran green with credentials.
- **Raw requests**: core `rawRequest()` (auth/transport shared with the
  planner; non-2xx is data, not an error), wrapped by harness `probe()` with
  checked-in specs under `vendors/<v>/probes/` and auto-scrubbed captures into
  `vendors/<v>/evidence/`. Probes are the evidence backbone for patch entries.

## Commands

Run from `api-factory/` (each script = `turbo run <task>`): `bun install`,
then `bun run typecheck | build | lint | fmt | check | test`. No
`--passWithNoTests` — a zero-test package fails. See `README.md` for the
table.

Decided but landing with their implementing tickets: the codegen CLI
(`generate`, `--emit-ir`, `verify` = hermetic regen + empty byte-diff), the
attestation / patch-locality / coverage audit commands, and per-vendor
acquisition commands.

## Decision records and vocabulary

Three artifacts, three jobs:

- **Ticket resolutions** (map #20 grillings) are the deliberation record —
  full rationale, rejected alternatives. The founding base:
  [#26](https://github.com/hourglass-financial/distilled/issues/26) layout,
  [#27](https://github.com/hourglass-financial/distilled/issues/27) determinism
  boundary, [#28](https://github.com/hourglass-financial/distilled/issues/28)
  exemplar, [#29](https://github.com/hourglass-financial/distilled/issues/29)
  patches, [#30](https://github.com/hourglass-financial/distilled/issues/30)
  testing, [#31](https://github.com/hourglass-financial/distilled/issues/31)
  codegen.
- **ADRs** live in `docs/adr/` (conventions and template in
  [docs/adr/README.md](./docs/adr/README.md)). Write one when a decision is
  hard to reverse, surprising without context, and the result of a real
  trade-off — and record the rejected alternatives, `DECISIONS.md`-style.
  Implementation-time decisions meeting that bar get an ADR even when no
  ticket exists.
- **`CONTEXT.md`** is the glossary — the vocabulary this file and all v2 code
  and docs must use. When you resolve or coin a term, add it there in the
  moment; when someone's usage conflicts with it, call it out. Glossary only:
  no implementation details, no decisions.

`DECISIONS.md` is the exemplar fragment's design record (predates the ADR
convention, stays as-is). New decisions go to `docs/adr/`.

## Effect v4

Same discipline as the root `AGENTS.md`: this workspace is Effect v4
(`effect@4.x`), which is unlikely to match your training data. Verify every
API against existing usage in this tree or the installed source
(`node_modules/.bun/effect@*/node_modules/effect/src/`); the in-repo `effect`
skill is the reference guide. `effect` is a **peer** dependency of provider
packages; the exact pin is provisional pending
[#40](https://github.com/hourglass-financial/distilled/issues/40).

## Build-out status (2026-07 — expected to shrink to nothing)

- `clients/workos` is today the **hand-authored exemplar** ([#28](https://github.com/hourglass-financial/distilled/issues/28))
  standing in for generated output: it carries the banners and must stay
  byte-reproducible *in principle*. Until `packages/codegen` emits it, the
  exemplar changes only through design-reviewed edits that keep
  `DECISIONS.md` in sync — after that, the regen gate takes over and hand
  edits become build failures.
- The harness primitives, coverage audit (gate 3's coverage leg, run via the
  vendor's `audit:coverage` script), and `probes/` tooling are on disk
  ([#49](https://github.com/hourglass-financial/distilled/issues/49)). The L0
  snapshot + provenance, `patches/`, vendor config, and the WorkOS
  `coverage.ts` + suite migration are settled by decision but not yet on
  disk; the remaining gates land with their implementing tickets. Today's
  mechanical gates are the turbo scripts above.
