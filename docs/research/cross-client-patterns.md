# Cross-Client Pattern Survey — Synthesis Catalog (Ticket #36)

This is the synthesis of a 20-package survey of every SDK in `packages/` (one analyst
per package, answering the shared rubric in
[`cross-client-patterns-rubric.md`](./cross-client-patterns-rubric.md)). It is the
authoritative catalog for a v2 from-scratch rewrite: what every client is required to
share, what it is allowed to vary, what it accidentally diverges on, and what those two
lists imply for v2's codegen IR and runtime design.

Packages surveyed: `aws`, `axiom`, `azure`, `cloudflare`, `coinbase`, `erebor`,
`expo-eas`, `fly-io`, `gcp`, `kubernetes`, `mongodb-atlas`, `neon`, `persona`,
`planetscale`, `posthog`, `prisma-postgres`, `stripe`, `supabase`, `turso`, `workos`.
Fork-only packages: `erebor`, `persona`, `kubernetes` (no `upstream/main` copy).
`workos` exists upstream but the fork has materially diverged.

Anchor references (the "scaffold default" every answer is measured against): shared
client `packages/core/src/client.ts` (`makeAPI`, `make`, `makePaginated`); traits
`packages/core/src/traits.ts`; pagination `packages/core/src/pagination.ts`; errors
`packages/core/src/errors.ts` (`HTTP_STATUS_MAP`, `RETRYABLE_HTTP_STATUSES`); categories
`packages/core/src/category.ts`; redaction `packages/core/src/sensitive.ts`; pagination
detector `packages/core/scripts/generate-openapi.ts` (`detectPagination`). Standard
client exemplars: `packages/stripe/src/client.ts`, `packages/erebor/src/client.ts`.
Specialized clients: `packages/aws/src/client/api.ts`, `packages/cloudflare/src/client/`.

---

## (a) Invariants — what every client shares

These held across all 20 packages (deviations, where they exist, are enumerated as
variations in §b, not exceptions to the invariant). A v2 rewrite should treat each as a
non-negotiable contract, not a convention.

### A1. The Context.Service contract triad (Credentials / Retry / error-category)
Every package resolves auth from a `Credentials` `Context.Service` tag, retry policy from
a per-SDK `Retry` `Context.Service` tag, and error semantics from core's `Category.*`
tagging. This is the one invariant that even the fully-bespoke clients honor.
- `aws` bypasses core `makeAPI` entirely and hand-rolls its own `make`/`makePaginated`/
  `makeUnvalidated` (`packages/aws/src/client/api.ts:43,321,410`), yet still reads
  `Credentials`, `Region`, and `Retry` as `Context.Service` tags
  (`packages/aws/src/credentials.browser.ts:52-55`, `region.ts:7-9`, `retry.ts:39-41`)
  and pipes its Smithy errors through `Category.with*` (`packages/aws/src/errors.ts:5-78`).
- `gcp`, `cloudflare`, `kubernetes` wrap a bespoke `client/` directory but still call
  core `makeAPI` under the hood (`packages/gcp/src/client/api.ts:156-165`,
  `packages/cloudflare/src/client/api.ts:565-583`,
  `packages/kubernetes/src/client/api.ts:101`).

**Takeaway:** the invariant is "honor the Context.Service contracts + generated/hand-written
split," NOT "use `makeAPI`." The shared client is escape-hatchable; the contracts are not.

### A2. Credentials layer shape
`Credentials` is a `Context.Service` tag whose value is (or resolves to) a `Config`, paired
with a `CredentialsFromEnv` layer reading env via `EffectConfig`, with all secrets wrapped
in `Redacted`. Byte-identical across the OpenAPI packages; extended (not replaced) by the
outliers. Evidence: `packages/neon/src/credentials.ts:14-31`,
`packages/stripe/src/credentials.ts:15-39`, `packages/supabase/src/credentials.ts:15-34`,
etc. (One structural variant: `mongodb-atlas` and `gcp` make the resolved value itself an
`Effect` so the layer can perform a token exchange or lazy read —
`packages/mongodb-atlas/src/credentials.ts:15-18`, `packages/gcp/src/credentials.ts:14-17`.)

### A3. Retry is a stock per-SDK tag over core factories
Every `retry.ts` is a `Context.Service<Retry, Policy>` tag re-exporting core's
`throttlingFactory`/`transientFactory`/`makeDefault` with `none`/`throttling`/`transient`/
`policy` convenience helpers, wired into the client via `retry: Retry`. No package except
`aws` overrides `while`/`schedule`. Evidence: `packages/neon/src/retry.ts:40-55`,
`packages/planetscale/src/retry.ts:20-57`; `aws`'s bespoke retry-after reader at
`packages/aws/src/retry.ts:79-115`.

### A4. The `Unknown<Pkg>Error` + `<Pkg>ParseError` fallback pair
Every `errors.ts` re-exports the core HTTP-status classes and adds exactly two SDK-owned
classes: an `Unknown*Error` fallback (`Category.withServerError`) and a `*ParseError`
decode-failure wrapper (`Category.withParseError`). Evidence:
`packages/neon/src/errors.ts:31-47`, `packages/turso/src/errors.ts:31-47`,
`packages/mongodb-atlas/src/errors.ts:37-54`. (Domain packages add more typed classes on
top — see §b6 — but the pair is always present.)

### A5. Status-map dispatch as the baseline of `matchError`
Every `matchError` ultimately falls through to `HTTP_STATUS_MAP[status]` → `Unknown*Error`.
Packages that dispatch on a body field first (§b6) always keep the status map as the last
resort. Evidence: `packages/fly-io/src/client.ts:28-63` (pure status),
`packages/stripe/src/client.ts:171-273` (body-type first, status fallback).

### A6. The generated / hand-written split with DO-NOT-EDIT guardrails
`src/operations/` or `src/services/` is generated and marked do-not-hand-edit; `client.ts`,
`credentials.ts`, `errors.ts`, `retry.ts`, `index.ts` are hand-written; `traits.ts`,
`sensitive.ts`, `category.ts` are one-line re-export shims of core (except where a package
genuinely extends them — `cloudflare`, `aws`). Evidence: `packages/azure/src/services/storage.ts:1-6`
(header), `packages/coinbase/src/traits.ts:1-5` (shim). (One accident: `aws`'s 429
generated files carry NO in-file DO-NOT-EDIT header despite AGENTS.md promising one —
see §c11.)

### A7. Spec → generate → patch pipeline
Every package acquires a vendor spec, runs a generator, and injects observed-but-undocumented
behavior (especially error responses discovered via live testing) through a patch layer
applied at generation time. The spec format, acquisition, and patch mechanism vary (§b1,
§b8), but the pipeline shape is universal.

### A8. Redaction happens at the credential boundary universally
Regardless of whether `Sensitive*` operation-field schemas are used (§b11), every package
wraps its auth secret in `Redacted` at the credentials layer. Evidence: every
`credentials.ts` cited in A2.

### A9. The fork's precise-error-typing contract
Every fork `client.ts` threads an explicit `ClientError` union into
`makeAPI<Credentials, …, ClientError, <Pkg>ParseError>` and types `matchError` as
`Effect.Effect<never, ClientError>`, where upstream leaves both as `unknown`. This is the
fork's raison d'être (commits `0ba1fbe2f` "preserve precise operation error contracts",
`e2813ddcb` "align generated contracts with runtime behavior"; core `HOURGLASS PATCH` at
`packages/core/src/client.ts:565-566`). Present in `stripe`, `neon`, `planetscale`,
`coinbase`, `turso`, `fly-io`, `supabase`, `mongodb-atlas`, `prisma-postgres`, `axiom`,
`gcp`, `azure`, `cloudflare`, `posthog`, `expo-eas`, `erebor`, `persona`, `workos`.
**Caveat (see §c2):** the typed union is present everywhere, but it is only *load-bearing*
(narrows per operation) in `erebor`, `persona`, `workos`.

### A10. Test-harness conventions (where tests exist)
Where a package has tests, they use `testRunId`-suffixed unique resource names, live-API
integration (not mocks, except `gcp`/`stripe`), `Effect.ensuring`/try-finally cleanup, and
`Effect.flip` error assertions with raised timeouts. Evidence:
`packages/cloudflare/test/kv.test.ts:17`, `packages/workos/test/ApiKeysControllerDelete.test.ts`.
(Many packages ship zero tests — that is an accident, §c3, not a variation.)

---

## (b) Axes of legitimate variation — the v2 requirements catalog

Each axis below is a real API-domain difference the v2 IR and per-client config must
express. This is the requirements list: v2 must model **all** of these as first-class,
orthogonal, typed configuration, not as one-off per-package escape hatches.

### B1. Spec format (7 distinct categories)
| Format | Packages | Evidence |
|---|---|---|
| OpenAPI 3.0/3.1 | neon, planetscale, prisma-postgres, supabase, posthog, axiom, mongodb-atlas, fly-io, persona, erebor, turso, workos, stripe, coinbase | `packages/neon/scripts/generate.ts:8-20` |
| OpenAPI 2.0 / Swagger | azure, kubernetes, planetscale | `packages/azure/scripts/generate.ts:20-30`, `packages/kubernetes/scripts/generate.ts:19` |
| Smithy models | aws | `packages/aws/scripts/model-schema.ts`, `generate.ts:1-30` |
| GCP Discovery Documents | gcp | `packages/gcp/scripts/generate.ts:30-49` |
| TS-SDK AST-derived | cloudflare | `packages/cloudflare/scripts/generate.ts:210` (parses `cloudflare-typescript` AST) |
| GraphQL introspection schema | expo-eas | `packages/expo-eas/scripts/generate.ts:21-24` |
| Docs-scraped | erebor | `packages/erebor/scripts/fetch-erebor-docs.py`, `HOURGLASS.md:99-101` |

### B2. Spec acquisition + fan-in
- Direct vendor submodule: `stripe` (`stripe/openapi`), `coinbase` (`cdp-sdk`, YAML embedded
  in SDK repo), `persona`, `workos`, `azure`, `kubernetes` (full monorepo), `aws` (4
  submodules), `turso` (docs repo), `expo-eas` (2 submodules, one never read).
- `distilled-spec-*` mirror repo: `neon`, `planetscale`, `prisma-postgres`, `supabase`,
  `posthog`, `mongodb-atlas`, `fly-io`, `gcp`, `axiom`.
- Docs-scraper (no submodule): `erebor` (Python Fern-docs mirror).
- **Multi-spec fan-in:** `axiom` merges 3 independently-versioned OpenAPI specs (control-plane
  v2 + edge-ingest + edge-query) into one client via path-prefixing at generation time, with
  subpath re-export barrels (`packages/axiom/scripts/generate.ts:1-20,45-63`,
  `src/edge-ingest.ts`). v2 must support N-specs-to-one-client.
- **YAML-in-repo:** `coinbase`/`workos` convert vendor YAML → JSON before the shared reader
  (`packages/coinbase/scripts/generate.ts:10-38`).

### B3. Auth scheme (the widest axis — must be a pluggable strategy)
| Scheme | Package | Evidence |
|---|---|---|
| `Bearer <key>` static | stripe, neon, fly-io, supabase, turso, workos, posthog, axiom, expo-eas, gcp, azure, prisma-postgres, kubernetes | `packages/stripe/src/client.ts:286-288` |
| Raw `Authorization`, NO `Bearer` prefix | erebor | `packages/erebor/src/client.ts:185-187` (documented deviation) |
| Custom header pair `X-Auth-Key`+`X-Auth-Email` | cloudflare (legacy scheme) | `packages/cloudflare/src/credentials.ts:245-248` |
| OAuth Bearer with auto-refresh | cloudflare | `packages/cloudflare/src/credentials.ts:159-183` |
| Multiple simultaneous schemes (discriminated union) | cloudflare (3), planetscale (service-token `id:token` vs OAuth Bearer) | `packages/planetscale/src/credentials.ts:52-57` |
| SigV4 request signing | aws | `packages/aws/src/client/api.ts:189-206` (`AwsV4Signer`) |
| Per-request self-signed JWT (ES256/EdDSA, bound to method+path) | coinbase | `packages/coinbase/src/client.ts:131-173,323-336` |
| OAuth2 client-credentials exchange inside the credentials layer | mongodb-atlas | `packages/mongodb-atlas/src/credentials.ts:41-68` |
| Credential-derived path injection (`subscriptionId`) | azure | `packages/azure/src/client.ts:192-204` |
| Optional org-scoping header (`X-Axiom-Org-ID`) | axiom | `packages/axiom/src/client.ts:113-121` |

Two auth requirements are structural: (1) auth headers that **cannot be computed statically**
because they bind to the request (coinbase JWT `uri` claim, aws SigV4) — the client must
expose a `getRequestHeaders(method, path, …)` hook, not just `getAuthHeaders(creds)`; (2)
credential-provider **chains** — `aws` ships 7 provider constructors (env/chain/ini/container/
process/token-file/SSO/http) with TTL-aware caching (`packages/aws/src/credentials.ts:16-52`,
`credentials.browser.ts:126-152`) vs everyone else's single `FromEnv` layer.

### B4. Base-URL / endpoint resolution
| Strategy | Package | Evidence |
|---|---|---|
| Constant `getBaseUrl(creds) => creds.apiBaseUrl` + default const | most packages | `packages/neon/src/client.ts:66` |
| No default const (caller-supplied per-cluster) | kubernetes | `packages/kubernetes/src/credentials.ts:17-24` |
| Per-service `Service` trait `rootUrl` (300+ hosts) | gcp | `packages/gcp/src/services/storage-v1.ts:14-19` |
| Region/endpoint rules engine (virtual-host/dualstack/FIPS/access-point) | aws | `packages/aws/src/services/s3.ts:16-90`, `client/api.ts:15,68` |
| Baked per-operation `api-version` query param | azure | `packages/azure/src/services/storage.ts:66-70`, applied by core `client.ts:733-738` |

### B5. Pagination style (and the mode gap)
Modes that appear: `token` (gcp, cloudflare default), `page` (planetscale, stripe Search,
cloudflare), `cursor` (neon, cloudflare), `single` (cloudflare). Shapes that exist in the
API but are NOT wired to `makePaginated` (see §c1): full-URL `nextLink` (azure), total-count
`page`/`total_pages` (turso audit logs), JSON:API `links.next` (persona), DRF
`{count,next,previous,results}` (posthog), `nextPageToken` (coinbase), `next_cursor`
(fly-io), `nextCursor`/`hasMore` (prisma-postgres), `starting_after`/`ending_before`
(stripe list, erebor). Only `neon`, `planetscale`, `stripe` (Search only), `gcp`, `cloudflare`
actually use the trait. Evidence: `packages/gcp/src/services/storage-v1.ts:4710-4724`,
`packages/planetscale/src/operations/listDatabases.ts:194-206`,
`packages/cloudflare/src/client/api.ts:589-650` (4-mode dispatcher). **v2 requirement:** the
IR needs `token`/`page`/`cursor`/`single` **plus** a "follow full URL" mode (azure) and a
"total-count / page-N-of-M" mode (turso), and detection must be extensible (§d2).

### B6. Error-dispatch strategy
| Strategy | Package | Evidence |
|---|---|---|
| HTTP status → map only | fly-io, neon, planetscale, prisma-postgres, turso, kubernetes, supabase, posthog, mongodb-atlas, axiom, persona, workos | `packages/fly-io/src/client.ts:28-63` |
| Body `type`/`code` field first, status fallback | stripe (`error.type`), coinbase (`errorType`) | `packages/stripe/src/client.ts:171-273` |
| 2xx error envelope (`success:false`) | cloudflare | `packages/cloudflare/src/client/api.ts:576-580` |
| Numeric `code` map independent of HTTP status | cloudflare | `packages/cloudflare/src/client/api.ts:74-135` |
| ARM envelope `error.code` → code map, status fallback | azure | `packages/azure/src/client.ts:78-145` |
| GraphQL `errors[].extensions.errorCode` envelope | expo-eas | `packages/expo-eas/src/client.ts:79-123` |
| gRPC `status`/`details[]` tacked onto instance post-construction | gcp | `packages/gcp/src/client/api.ts:106-138` |
| Per-protocol wire `errorCode` (XML/JSON/EC2-query) → per-op error-schema map | aws | `packages/aws/src/client/response-parser.ts:133-147` |
| Body-text special cases (validation detail, feature-gate-as-429, free-tier limit, 406→404) | erebor, supabase | `packages/erebor/src/client.ts:112-140`, `packages/supabase/src/client.ts:44-55` |

### B7. Per-endpoint error declarations vs global dispatcher
A generator flag (`includeOperationErrors`) toggles between declaring `errors: [...]` on each
operation (erebor, neon, planetscale, prisma-postgres, supabase, turso, posthog, workos,
persona, axiom, fly-io, kubernetes, gcp, mongodb-atlas, aws) and a single global dispatcher
keyed on a body field (stripe `includeOperationErrors: false`
`packages/stripe/scripts/generate.ts:21`; coinbase `generate.ts:33` "handles errors globally
by HTTP status"; expo-eas GraphQL `EAS_ERROR_CODE_MAP`; azure no per-op errors). **v2
requirement:** support both models behind one flag (proven to work — do not fork the client
shape for it), but see §c2 for the load-bearing caveat.

### B8. Error-patch mechanism
- RFC-6902 JSON Patch on the spec: neon, planetscale, prisma-postgres, supabase, turso,
  posthog, workos, persona, axiom, fly-io, kubernetes, stripe (`packages/turso/patches/001-add-error-responses.patch.json`).
- Smithy-model-edit-equivalent JSON: aws (`errorCategories` + per-op `errors` overrides,
  `packages/aws/patches/iam.json`).
- Expression-DSL matchers `patches/<svc>/<op>.json`: cloudflare
  (`packages/cloudflare/patches/email-routing/disableEmailRouting.json`).
- Generator-synthesized method-keyed defaults (no patch files): gcp
  (`packages/gcp/scripts/generate.ts:886-921`, `methodDefaultErrorTags`).
- Meta-generated per-tag patch files: posthog (80 `*-errors.patch.json` produced by
  `scripts/generate-error-patches.ts`).
- Spec-pruning patches (remove uncallable operations): posthog
  (`drop-dashboard-only-ops.patch.json`, 18 ops), axiom (path-correction + spec-narrowing).
- Sensitive-marking patch (`x-sensitive` extension): planetscale
  (`packages/planetscale/patches/sensitive.patch.json`).
- Narrow, rationale-documented `required`-relaxation: workos
  (`002-relax-create-input-required.patch.json`, replacing upstream's blanket 110-schema
  strip — see §d8).

### B9. Content types
- Default JSON: most.
- `form-urlencoded`: stripe (dominant, 532/564 files — Stripe's whole API is form-encoded,
  `packages/stripe/src/operations/PostAccounts.ts:1195-1199`), plus OAuth token-exchange
  endpoints in persona/supabase/posthog.
- Multipart: stripe (file upload), cloudflare (26 ops), supabase (function deploy), erebor
  (document upload).
- Binary / streaming response: cloudflare (`BinaryStreamResponseSchema`), aws (S3 GetObject
  `ReadableStream`, event streams).
- 5 full wire protocols (restXml/restJson/awsJson/awsQuery/ec2Query): aws
  (`packages/aws/src/protocols/`).
- GraphQL POST envelope: expo-eas (`T.GraphQLOp` + `T.ResponsePath`).
- Distinct PATCH content-types (JSON-Patch / Merge-Patch / Strategic-Merge): required by
  kubernetes but NOT modeled (§c16).

### B10. Retry-after gating
Core's `parseRetryAfterForStatus` already gates internally on `RETRYABLE_HTTP_STATUSES`, so
call-site behavior is mostly benign. But `erebor` and `persona` additionally define a local
`RETRYABLE_HTTP_STATUSES` set and only attach `retryAfter` to genuinely-retryable error
classes, with a documented rationale that attaching it elsewhere pollutes serialized output
(`packages/erebor/src/client.ts:21-22,81`). Persona also adds `408`/`RequestTimeout`
(`packages/persona/src/errors.ts:42-56`). Everyone else attaches unconditionally at the call
site (`packages/prisma-postgres/src/client.ts:52,73`).

### B11. Sensitive-field redaction intensity
Heavy (aws ~4712 sites `packages/aws/src/services`; stripe ~585 across 267 files); moderate
(gcp 243, posthog 99, planetscale ~13 fields, persona 19 files, workos 19 files, supabase 15
files); output-only (neon — `SensitiveOutputString` on returned passwords only,
`packages/neon/src/operations/createProjectBranch.ts:404`); single use (fly-io `private_key`);
none / re-exported-unused (cloudflare, kubernetes, mongodb-atlas, turso, expo-eas, coinbase
mostly). `aws` needs a richer `Sensitive<A>` that also wraps blobs (`packages/aws/src/sensitive.ts:44-79`).

### B12. Operation naming + file layout (drives scale)
| Convention | Package |
|---|---|
| PascalCase verb+path (`DeleteCouponsCoupon`, `ResourceGroupsList`, `ApiKeysControllerDelete`) | stripe, azure, workos, fly-io |
| camelCase semantic (`createCounterparty`, `listObjects`) | erebor, neon, planetscale, prisma-postgres, supabase, turso, gcp, kubernetes, coinbase, axiom, mongodb-atlas |
| Full-phrase from OpenAPI summary (`archiveABrowserFingerprintListItem`) | persona |
| GraphQL namespace-concat (`accountById`, `appCreateApp`) | expo-eas |
| One file per operation | stripe, erebor, neon, planetscale, prisma-postgres, supabase, turso, coinbase, persona, axiom, fly-io, mongodb-atlas, expo-eas, workos |
| One module per service | aws (429), azure (218), cloudflare (118), gcp (520 incl. unstable), kubernetes (24) |
| Per-OpenAPI-tag subdirectory (one file per op inside) | posthog (141 dirs) |

### B13. Scale (drives layout, type-check cost, patch/dir splitting)
Op counts span ~50 (turso) to ~15,194 (aws), ~7,027 (azure), ~13k (gcp), 1,483 (posthog),
1,069 (kubernetes). Scale forces: per-service or per-tag file splitting; `any`-widened
operation builders to avoid ~13k generic instantiations (gcp
`packages/gcp/src/client/api.ts:167-181`); per-tag patch-file splitting (posthog); custom
test harnesses (persona 200 live tests). v2 needs built-in scaling variants keyed on op-count,
not per-package hacks.

### B14. Client shape (shared flat vs bespoke `client/` dir)
Legitimate bespoke `client/` dirs: `aws` (SigV4 + rules engine + 5 protocols — full bypass),
`cloudflare` (numeric-code error engine + 4-mode pagination + 2xx-envelope), `gcp` (envelope
tack-on + per-service rootUrl). Everyone else uses the flat shared `client.ts`. **Cargo-cult
warning:** `kubernetes` mimics the `client/` dir shape but its `client/api.ts` is the plain
shared `makeAPI` factory relocated — misleading (§c9).

### B15. Request/response transform hooks
`transformRequestParts`: stripe (bracket-notation query flattening for form-encoded GET
filters, `packages/stripe/src/client.ts:56-122`), azure (subscriptionId path injection).
`transformResponse`: axiom (`stripNulls` — Go backend serializes nil slices as JSON `null`
which trips `Schema.optional`, `packages/axiom/src/client.ts:84-105`). Domain request-options:
stripe Connect (`stripeAccount`/`stripeContext`), `idempotencyKey`, `apiVersion` as per-call
headers (`packages/stripe/src/client.ts:41-141`).

### B16. Bespoke extras
`webhooks.ts` HMAC signature verification: stripe only
(`packages/stripe/src/errors.ts:158-175`). Fork-local maintenance scripts (prune-orphans,
audit-operation-tests, spec-diff, classify-test-failures, audit-patches): erebor only, needed
because a docs-scraped spec has no submodule-diff safety net
(`packages/erebor/scripts/prune-orphans.ts`). Enumerate-only `nuke.ts`: expo-eas (GraphQL
delete mutations aren't flattened into typed ops).

### B17. Test infrastructure scaling
`Effect.ensuring` per-test (cloudflare, workos, supabase) → suite-level `beforeAll`/`afterAll`
teardown for slow-to-provision resources (planetscale 20-min DB timeout, prisma-postgres,
neon) → custom Promise harness with cross-run orphan reconciliation via raw `fetch`
(persona `safe-run.ts`/`recovery.ts`/`coverage.ts`, 200 live tests) → mocked HttpClient
(gcp — no single sandbox spans 520 services; stripe — objects can't be truly deleted).

---

## (c) Architectural accidents / divergences to erase

Ranked roughly by breadth × severity. These are drift, not domain requirements; v2 should
not reproduce them.

### C1. Pagination detector blind spot (the single most widespread accident)
`detectPagination` (`packages/core/scripts/generate-openapi.ts` ~2530-2609) only recognizes
`next_token`/`NextToken`/`nextToken` output tokens and a nested
`pagination.{cursor,next,next_page}` object. Every other real pagination shape silently falls
through to a non-paginated `API.make`. Confirmed unpaginated-but-should-be:
`coinbase` (`nextPageToken`), `fly-io` (`next_cursor`, `VolumesOrgList`),
`prisma-postgres` (`pagination.nextCursor`/`hasMore`, 22 ops), `erebor` (`starting_after`/
`page_next`, all 29 list ops), `stripe` (list endpoints — only the 7 Search ops get wired),
`turso` (`page`/`total_pages` audit logs), `persona` (JSON:API `links.next`), `posthog`
(DRF `{count,next,previous,results}`, dozens of ops), `mongodb-atlas` (`pageNum`/`itemsPerPage`,
~71 ops), `azure` (full-URL `nextLink`, ~7027 ops). Fix in the detector + IR (§d2), not
per-package.

### C2. Declared `errors: [...]` are documentation-only in most packages
The precise-error-contract fix (`isErrorClassAllowedForOperation`,
`packages/core/src/client.ts`) is only wired into `erebor`, `persona`, `workos`. Everywhere
else, `matchError`'s `_errors` parameter is received but unused and `ClientError` unconditionally
unions every `HTTP_STATUS_MAP` class, so the per-op declaration never narrows the real type
(`packages/prisma-postgres/src/client.ts:39-44,84-89`). The migration landed unevenly. v2 must
decide this up front (§d1).

### C3. Zero test files masked by `--passWithNoTests`
`expo-eas` (310 ops), `kubernetes` (1069 ops), `turso` (52 ops), `fly-io`, `mongodb-atlas`
(403 ops), `coinbase` (115 ops, never had a test dir) all ship a fully-wired `test.ts`/
`setup.ts` harness and zero `*.test.ts` files, with `--passWithNoTests` keeping CI green.
`neon` is a **regression**: upstream commit `9b3430c28` deleted all 9 domain test files
(~3550 lines) while the same commit *added* ~25 generated test files to `prisma-postgres` —
neon's replacement generation never landed (§d10).

### C4. "Generator ran" ≠ "usable SDK" — mongodb-atlas returns void for everything
All 403 `mongodb-atlas` operations have `Schema.Void` output
(`grep "Output = void"` = 403 = op count). Root cause: Atlas keys response bodies under
vendor-versioned media types (`application/vnd.atlas.YYYY-MM-DD+json`) and the shared reader
only extracts `application/json`, so every response silently falls through. The SDK typechecks,
builds, and returns success — with no data. A validation gate would have caught this (§d3).

### C5. coinbase X-Wallet-Auth: documented, credential slot exists, never wired
39 of 115 coinbase ops document a required `X-Wallet-Auth` header in JSDoc,
`credentials.ts:24-28` defines an optional `walletSecret` field for it, but no operation uses
`T.HttpHeader` and `client.ts` never signs the second JWT — those wallet-mutating endpoints
are uncallable through the SDK (`packages/coinbase/src/operations/exportEvmAccount.ts:31-33`).
v2 must verify every documented auth header has request-wiring, not just a schema field.

### C6. fly-io orphaned duplicate generated operations
14 of 89 files are never wired into `index.ts`: 11 underscore-variant duplicates
(`App_CertificatesAcmeCreate.ts` etc., strictly worse than their siblings — missing interfaces,
missing `errors`, wrong output schema) plus `MachinesPatchMetadata.ts` (a real distinct PATCH
op) which got dropped because its `index.ts` slot was overwritten by a duplicate
`MachinesUpdateMetadata` export. A shared-generator tag-collision bug (present upstream too).
Fix: dedupe on normalized tag before emission; never leave generated-but-unwired files.

### C7. turso deprecated files left on disk
3 deprecated operation files remain generated-but-unexported after `skipDeprecated: true`
suppresses only their `index.ts` entry, not the file. Same class of "generated cruft" as C6.

### C8. Patch location / documentation inconsistency
Patches live at `specs/*.patch.json` (neon/planetscale/prisma-postgres per AGENTS.md) OR
`patches/*.patch.json` (supabase, stripe, turso, fly-io, kubernetes, posthog, persona, workos,
axiom) — same RFC-6902 mechanism, two directory conventions. AGENTS.md's "Patch Locations"
table omits stripe/supabase/axiom/posthog entirely. Normalize location + document all
mechanisms (§d8).

### C9. kubernetes `client/` dir mimics a specialized transport it doesn't have
`packages/kubernetes/src/client/api.ts` + `index.ts` is the plain shared `makeAPI` factory
relocated into a directory, structurally resembling aws/cloudflare's genuinely-specialized
`client/` dirs. Misleads a maintainer into expecting bespoke transport logic. Use the flat
`client.ts` unless there's real specialization.

### C10. azure module-level mutable global for subscriptionId
`_currentSubscriptionId` is a module-level `let` set as a side effect in `getAuthHeaders` and
read in `transformRequestParts` (`packages/azure/src/client.ts:159,176,194`). Implicit global
mutable state in an otherwise Effect-pure codebase; concurrent requests with different
credentials race on it. Thread per-request state through the config, not a module global.

### C11. aws generated files have no DO-NOT-EDIT header
None of the 429 `packages/aws/src/services/*.ts` files carry the in-file guardrail comment
AGENTS.md promises, unlike every other per-service package. A future editor has no in-file
signal before hand-editing a 20k-line generated file.

### C12. Inconsistent / incomplete sensitive-field sweeps
`prisma-postgres` wraps `connectionString` in `SensitiveOutputString` but leaves
`directConnection.pass` as a plain string on the same response
(`packages/prisma-postgres/src/operations/postV1Projects.ts:81` vs `:146`). `coinbase` leaves
`encryptedPrivateKey` unwrapped. Sensitive-field marking should be a generator invariant driven
by spec annotation, not a manual per-field sweep.

### C13. `UnknownAwsError` uncategorized
Every other error in `packages/aws/src/errors.ts` pipes through a `Category.with*`;
`UnknownAwsError` (`errors.ts:97-107`) is the lone uncategorized class, inconsistent with the
A4 fallback-pair invariant.

### C14. Stale READMEs
`turso/README.md:5` still says the SDK is an unfilled stub (52 ops are generated);
`mongodb-atlas/README.md` documents `MONGODB_ATLAS_API_KEY` and a data-returning Quick Start
while the code reads `CLIENT_ID`/`CLIENT_SECRET` and returns void (§c4).

### C15. Generator/formatter output noise
All fork generated files carry a doubled `/*@__PURE__*/ /*#__PURE__*/` annotation and rewrapped
`S.suspend` calls vs upstream's single annotation — a formatter/generator version skew with no
functional effect but a huge diff surface. Make PURE-annotation emission deterministic.

### C16. kubernetes PATCH content-type collapse
Real k8s PATCH semantics distinguish `application/json-patch+json`, `merge-patch+json`, and
`strategic-merge-patch+json`, but every generated PATCH op omits `contentType` and defaults to
JSON (`packages/kubernetes/src/services/core.ts:575`), even though `T.Http({ contentType })`
supports it. Spec-fidelity gap.

### C17. Dead / vestigial config
`coinbase` and `azure` generators reference a `patches/` dir that doesn't exist on disk;
`workos` ships a `tsconfig.test.json` no script references (168 test files go untypechecked);
`expo-eas` fetches `specs/expo` but never reads it; `cloudflare` keeps an `auth.ts` backwards-compat
shim; `workos`/`fly-io` `index.ts` barrels have file-count mismatches vs the operations on disk.

### C18. Fork-wide staleness (not architectural, but pervasive)
Every fork package is `0.29.0` vs upstream `0.29.1` and is missing upstream's `bundle.test.ts`
Rolldown smoke test + the `rolldown` devDependency. Uniform sync lag, not per-package intent —
flag for an upstream-merge pass.

---

## (d) Implications for v2 codegen + runtime — ranked

### D1. Decide the error-contract model once, at the IR level (highest priority)
The fork exists to make per-operation error unions precise, but the fix (`isErrorClassAllowedForOperation`)
only reached 3 of 20 packages (§c2). v2 must make declared `errors: [...]` **load-bearing by
default** — `matchError` narrows the real type to the operation's declared set plus the universal
transport-error channel — and the "documentation-only / global dispatcher" mode
(`includeOperationErrors: false`, stripe/coinbase) must be an explicit, typed IR choice, not a
per-package accident of whether someone wired the helper. This is the single change with the most
leverage: it is the fork's whole purpose and it is currently applied unevenly.

### D2. Pagination is a first-class, extensible IR concern (second highest breadth)
Nearly every package has a real paginated endpoint silently shipped as single-shot (§c1). v2 must:
(a) model pagination modes as `token` / `page` / `cursor` / `single` **plus** `follow-url` (azure
`nextLink`) and `total-count` (turso `page`/`total_pages`); (b) make the field-name detection
vocabulary data-driven and per-client extensible (JSON:API `links.next`, DRF `next`, `nextCursor`,
`nextPageToken`, `next_cursor`, `starting_after`); (c) emit a **warning** when an endpoint has a
pagination-shaped response but no mode was resolved, so gaps surface at generation time instead of
silently.

### D3. Separate "generator succeeded" from "generator produced a usable SDK" (validation gate)
mongodb-atlas typechecks and builds with all-void outputs (§c4); coinbase ships uncallable
documented endpoints (§c5). v2's generator must run post-generation assertions and fail (or loudly
warn) on: all-void/empty output schemas, response bodies under unrecognized media types (support
vendor-versioned `application/vnd.*+json`), documented auth headers with no request wiring,
pagination-shaped responses with no mode, and generated-but-unwired operation files. Silent
fallback is the root cause of the worst accidents.

### D4. Keep the shared-client contract, make the transport escape-hatchable
aws proves a full bypass (SigV4 + rules engine + 5 protocols) works cleanly as long as the
Context.Service contracts (Credentials/Region/Retry) and error/category conventions are honored
(§a1, §b14). v2 should define those contracts as the stable interface and let a client be either
the shared factory (flat `client.ts`) or a bespoke implementation — but forbid cargo-culting the
`client/` dir shape without real specialization (kubernetes, §c9). The decision "flat vs bespoke"
should be driven by whether the vendor needs request-signing, computed endpoints, non-HTTP wire
protocols, or a non-status error envelope.

### D5. Transport-agnostic trait/IR from day one
expo-eas proves the shared trait system already serves GraphQL (`T.GraphQLOp`/`T.ResponsePath`)
alongside REST. v2's IR should model auth, endpoint resolution, pagination, error dispatch, and
content-type as orthogonal typed axes over an abstract transport, so REST/GraphQL/Smithy-multi-protocol
all compile down to the same operation shape rather than REST being privileged.

### D6. Build scaling variants into the generator, not per-package
Op counts span 50→15k (§b13). v2 needs op-count-triggered variants for: file layout
(flat → per-service → per-tag directory, cf. posthog), patch-file splitting (per-tag, cf. posthog),
type-check-cost management (widened operation-builder generics, cf. gcp), and test-coverage
enforcement (cf. persona). These should be generator policies keyed on scale, not hand-rolled each
time a package gets big.

### D7. Auth is a pluggable strategy interface with a wiring invariant
Model auth as a strategy covering: static header, request-signing (SigV4), per-request JWT bound
to method+path (coinbase), OAuth exchange/refresh (mongodb-atlas/cloudflare), multi-scheme
discriminated unions (planetscale/cloudflare), credential-derived path injection (azure), and
credential-provider chains with TTL caching (aws). Two hard requirements: expose a
`getRequestHeaders(method, path)` hook (not just `getAuthHeaders(creds)`) for request-bound
signatures, and enforce that every documented auth header has actual request wiring (§c5).

### D8. Unify and document the patch system
One patch location, all mechanisms documented, and first-class patch **kinds**: error-response
injection, spec-pruning (remove uncallable ops, cf. posthog/axiom), sensitive-field marking
(cf. planetscale `x-sensitive`), media-type fixes, and narrow required-relaxation. Patches must be
narrow and rationale-documented (workos's 2-schema patch replacing upstream's blanket 110-schema
strip is the model, §b8/§c8) — never blanket-relax whole field categories to make tests pass.

### D9. Make redaction and retry-after generator invariants
Sensitive-field wrapping should be driven by spec annotation and applied exhaustively at generation
time (kills the incomplete-sweep accidents, §c12), and retry-after attachment should follow one
gating rule everywhere (erebor/persona's documented status-gated pattern, §b10) rather than a
per-package call-site convention.

### D10. Process guarantees: tests, self-documenting clients, deterministic output
(a) Any tooling migration that regenerates tests must land per-package — neon silently lost all
coverage while siblings gained it (§c3). Ban `--passWithNoTests` as a CI default. (b) Every
`client.ts` should carry a self-documenting deviation log naming each scaffold deviation and why
(erebor's header comment, `packages/erebor/src/client.ts:1-26`, is the model — far better than
diffing against another package). (c) Generator output must be deterministic (PURE annotations,
tag-dedup, no unwired files, in-file DO-NOT-EDIT headers) to keep diffs meaningful (§c6, §c7,
§c11, §c15).

---

## Appendix — per-package one-line signature

- **aws** — the escape-hatch exemplar: full bespoke client (SigV4, rules engine, 5 wire protocols,
  7-provider credential chain) that still honors the Context.Service contracts.
- **axiom** — multi-spec fan-in (3 OpenAPI specs → one client) + `stripNulls` response hook for a
  Go backend that emits `null` for nil slices.
- **azure** — largest surface (7027 ops) on the plain scaffold; opts out of pagination because ARM's
  full-URL `nextLink` doesn't fit the token model; module-global subscriptionId smell.
- **cloudflare** — TS-SDK-AST-derived spec; numeric-code error engine + 2xx `success:false` envelope
  + all 4 pagination modes + 3 auth schemes; justified bespoke `client/` dir.
- **coinbase** — per-request JWT auth; ships 39 uncallable documented wallet-auth endpoints; zero
  tests.
- **erebor** — the fork's platonic client: documented deviation log, load-bearing per-op errors,
  status-gated retry-after; docs-scraped spec with bespoke maintenance scripts.
- **expo-eas** — proves the trait system serves GraphQL; 310 untested ops behind `--passWithNoTests`.
- **fly-io** — clean scaffold marred by a tag-collision generator bug (14 orphaned dupes, 1 dropped op).
- **gcp** — shared factory scales to ~13k ops across 520 services with an `any` type-check escape
  hatch; per-service `rootUrl` trait; gRPC envelope tack-on.
- **kubernetes** — huge Swagger surface on the shared factory; cargo-culted `client/` dir; PATCH
  content-type collapse; zero tests.
- **mongodb-atlas** — the "generator ran ≠ usable SDK" case: all 403 ops return void due to
  vendor-versioned media types; OAuth2 client-credentials exchange in the credentials layer.
- **neon** — near-platonic scaffold default; cursor pagination; a net test-coverage regression.
- **persona** — 200-live-test custom harness with cross-run orphan reconciliation; full-phrase op
  names; load-bearing per-op errors.
- **planetscale** — dual auth (service-token vs OAuth) as a discriminated union; `page` pagination;
  the whole bespoke surface is 3 thin files.
- **posthog** — 1483 ops in per-tag directories with meta-generated per-tag patch files + a
  spec-pruning patch; no pagination despite uniform DRF envelopes.
- **prisma-postgres** — declared errors are cosmetic; unconditional retry-after; incomplete sensitive
  sweep; `nextCursor` pagination gap.
- **stripe** — form-urlencoded dominant + bracket-query transform hook + webhook signing; global
  error dispatcher (`error.type`); most list endpoints unwrapped for pagination.
- **supabase** — the cleanest OpenAPI baseline: ~90 lines of glue + 164 generated ops + 3 patch
  files; body-text free-tier error + 406→404 remap.
- **turso** — total-count pagination the detector can't see; stale stub README; deprecated files left
  on disk; zero tests.
- **workos** — deliberately replaced a blanket required-strip with a 2-schema documented patch;
  load-bearing per-op errors; vestigial `tsconfig.test.json`.
