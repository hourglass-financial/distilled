# Gold-standard WorkOS fragment — design decisions

Rationale for the v2 Effect-v4 client fragment under `api-factory/`. This is
the target a deterministic emitter must reproduce ([ticket #28](https://github.com/hourglass-financial/distilled/issues/28)).
Optimized, in order, for consumer ergonomics, honesty (no lying unions or
schemas), emitter-plausibility, and machinery depth. Synthesized from two
independent drafts (gpt-5.6 sol, opus-4.8) plus a refinement pass; where the
drafts disagreed, the choice and the rejected alternative are both recorded.

Package split (binding, from the determinism-boundary decision in #27):
`packages/core` = hand-written machinery; `clients/workos` = "generated"
exemplar — every file, including its test, carries a `@generated` DO-NOT-EDIT
banner and must be byte-reproducible by the emitter; `vendors/workos` =
agent-writable test home (contract suite + live suite). The WorkOS-specific
bits in `clients/workos` (error codes, envelope shape, auth scheme, base URL)
are all mechanically derivable from the spec.

## Consumer example (the ergonomics we optimize for)

```ts
import { organizations, userManagement, layerFromEnv } from "@hourglass-financial/api-factory-workos";
import { Effect, Stream } from "effect";
import * as Redacted from "effect/Redacted";

const program = Effect.gen(function* () {
  const org = yield* organizations.create({ name: "Acme" });          // Effect<Organization, WorkosError<…>, WorkosClient>
  const all = yield* Stream.runCollect(organizations.listItems());    // every org, cursor followed
  const auth = yield* userManagement.authenticateWithPassword({
    client_id: "client_…",
    client_secret: Redacted.make(env.WORKOS_API_KEY),
    email: "user@example.com",
    password: Redacted.make(form.password),                           // secret redacted at the boundary
  }).pipe(Effect.catchTag("MfaEnrollment", () => redirectToMfa()));   // distinct typed error, not a BadRequest
  yield* organizations.delete({ id: org.id });
  return { all, token: auth.access_token };                            // Redacted<string> — prints "<redacted>"
});

program.pipe(Effect.provide(layerFromEnv)); // one layer: fetch transport + env creds + default retry
```

## 1. Operation surface

- **Choice:** free-standing, tree-shakeable functions grouped into resource
  namespaces (`organizations.create`, `userManagement.authenticateWithPassword`),
  each returning a plain `Effect<Output, WorkosError<…>, WorkosClient>`. Clean
  public names — the spec's internal codenames (`UserlandSessions*`, `Create0`)
  are gone. The delete operation is exported as the API's own verb via
  `export { deleteOrganization as delete }` (`delete` is a reserved declaration
  name but a legal export name). Read operations whose inputs are entirely
  optional take `input = {}`, so `organizations.list()` works bare; `create`
  requires its input — the spec marks `name` required, so the type does too.
- **Rejected:** v1's dual `OperationMethod` (yieldable *and* callable) — bespoke
  `SingleShotGen` cleverness an emitter shouldn't reproduce, for a niche win.
  Also rejected: a class/service-object surface (breaks per-op tree-shaking at
  200-op scale) and `remove` as the delete name (verb fidelity wins; the
  rename-export is boring and standard).
- **Emitter shape:** each op is a uniform block — input schema + interface, an
  errors tuple, a declarative descriptor, a one-line dispatch function.

## 2. Request model

- **Choice:** operations are pure data descriptors (method, path template,
  `pathParams`/`queryParams` as `keyof Input`, constant body fields), planned by
  one generic `planRequest` in core. No schema-AST introspection, no
  `as unknown as GeneratedStructCodec` laundering (v1's central lie), no `any`
  in factory or op config.
- **Rejected:** per-op `request:`/`response:` closures (the sol draft's shape) —
  more flexible, but the generator then emits imperative code instead of data,
  every op file grows helper plumbing, and the descriptor can't be introspected
  (e.g. by generated consistency tests).
- **Invariant:** descriptor params name *decoded* keys and the planner reads
  *encoded* keys — sound only under the snake-case-verbatim convention below; a
  generator introducing key renames must bind encoded names (documented in
  `operation.ts`).
- **Status semantics:** success is strictly 2xx; 1xx/3xx route through the
  matcher and surface as `UnknownWorkosError`. Only a void-output operation
  resolves `undefined` — a 204 on a body-declaring operation is a contract
  violation and fails as a decode error rather than lying with `undefined`.

## 3. Service / layer shape

- **Choice:** one `WorkosClient` `Context.Service` exposing a single `run`
  (core's `Runner`); `layerWith({ retry })` over injected `HttpClient` +
  `Credentials`, `layer` with defaults, `layerFromEnv` batteries-included
  (`fetch` + env creds via `Config.redacted`). Transport and credentials are
  injectable — the contract suite runs the whole pipeline against a mock
  `HttpClient` with zero network.
- **Rejected:** v1's per-call `Effect.serviceOption(Retry)` lookup and
  effect-holding credentials service — deps are captured once at layer build.

## 4. Per-endpoint error channel (honest)

- **Choice:** `WorkosError<EC>` = declared typed errors ∪ universal defaults
  (401/429/5xx) ∪ `UnknownWorkosError` ∪ transport/decode wrappers. The matcher
  constructs only classes the operation declares (or universal defaults);
  everything else becomes `UnknownWorkosError` — the discovery signal for a
  spec patch. One localized union coercion in core; nothing else asserted.
- **Code discrimination:** WorkOS's two envelopes (`{code, message}` and OAuth
  `{error, error_description}`) normalize to one discriminator; code match
  precedes status. `authenticateWithPassword` declares nine password-grant
  codes (`invalid_credentials`, `invalid_grant`, `invalid_client`,
  `mfa_enrollment`, `mfa_challenge`, `email_verification_required`,
  `email_password_auth_disabled`, `organization_selection_required`,
  `radar_challenge`) as distinct tagged classes — never an opaque `BadRequest`.
  The full generator emits every documented code in this per-class shape.
- **Spec honesty:** `organizations.delete` declares only `Forbidden` — the spec
  documents 200/202/403 (a missing org 403s); v1's declared `NotFound` was a
  lying union. Verified against `open-api-spec.yaml`, as was every other
  declared error and schema field in the fragment.
- **Single source of truth:** every wire fact lives on the class itself — the
  HTTP status as `static status`, the discriminator as the schema's `code`
  literal, hint-carrying as the schema's own `retryAfter` field. The matcher
  tables are derived (`byStatus`/`byCode`, fail-loud on duplicate claims), and
  the matcher asks the matched class whether it accepts a hint — the former
  hand-written `RETRYABLE_STATUSES` set is gone. The one deliberate list left
  is `DEFAULT_ERRORS`: universality is API-domain policy, not a class fact.

## 5. Error classification

- **Choice:** instance-carried, symbol-keyed metadata — the same branding idiom
  Effect uses for its own `TypeId`s. Each class declares
  `readonly [MetaKey] = Meta.auth` (a shared, literal-typed constant); the
  `Classified` interface puts the classification in every instance's *type*
  while the symbol key keeps it out of every instance's *data* (symbol keys
  never JSON-serialize). Checks are plain type guards
  (`Predicate.hasProperty`), and because the `Meta.*` constants are
  literal-typed, `Category.hasCategory("challenge")` is a refinement that
  **narrows the error union** inside `Effect.catchIf` — the handler sees only
  the members it can actually receive. Matcher tables and operation error
  tuples require the `ClassifiedErrorClass` bound, so a class missing its
  classification fails `tsc`.
- **Rejected:** v1's prototype-mutation registry (invisible to the type
  system; #21); per-instance string-keyed `category` fields (pollute the
  serialized shape); and a `static meta` read via `error.constructor`
  (constructor reflection plus shape-sniffing, and no value-level narrowing —
  replaced in the taste pass).

## 6. Retry

- **Choice:** two-level control. Each descriptor declares a **disposition** —
  `"transient"` for idempotent reads (GET), `"throttling"` for mutating calls
  (POST/DELETE), derived from method semantics by the generator — and the
  consumer's `RetryPolicy` (predicate + schedule) is applied as a conjunction:
  a permissive policy can never widen a mutating call into transport replay
  (double-create risk; a replayed successful DELETE surfaces a spurious 403).
  The default schedule is exponential-jittered (100ms ×2, 5 retries) with a
  server `Retry-After`/`RateLimit-Reset` hint **winning exactly** (clamped to
  60s) and a 500ms floor for 429s. Fixes v1's latent `capped` bug (hard-coded
  5s fallback swallowing the cap).
- **Rejected:** uniform method-blind retry (v1 and the opus draft — the
  double-create hazard); `max(backoff, floor, hint)` (the sol draft — waiting
  longer than the server asked is safe but ignores that `Retry-After` is
  authoritative); per-descriptor magic delay constants derived from published
  rate-limit buckets (operational trivia baked into generated code).

## 7. Pagination

- **Choice:** cursor pagination on `Stream.paginate`, exposed as three flat
  exports per paginated op: `list` (one page), `listPages` (Stream of pages),
  `listItems` (Stream of items), with typed accessor projections — no `getPath`
  string traversal. The first request sends the caller's input verbatim; from
  page two on, the forward cursor is substituted and the config's
  `clear: ["before"]` drops the opposing-direction cursor — a caller-supplied
  `before` scopes the first request only, never rides alongside `after`.
- **Rejected:** `Object.assign(list, { pages, items })` (the sol draft, v1's
  shape) — reads nicely as `list.items()`, but a function-with-properties can't
  be tree-shaken per-accessor at 200-op scale and is a less uniform emit.

## 8. Redaction

- **Choice:** Effect's own `Schema.RedactedFromValue(Schema.String)` (exported
  as `Secret`): decodes a wire string into `Redacted<string>`, encodes back to
  the plain string, and — via its built-in `redact` middleware — scrubs the raw
  value out of decode-error messages. Used for request secrets
  (`client_secret`, `password`) and response tokens (`access_token`,
  `refresh_token`). Inputs are strictly `Redacted<string>`: callers wrap with
  `Redacted.make(...)`, so a plaintext secret never travels inside an input
  object.
- **Error carriers are leak paths too** (found in adversarial review): a raw
  `HttpClientError` embeds the full request (encoded body + auth header), a
  raw response body may contain tokens even when decode fails on an unrelated
  field, and an unmodeled error envelope can echo submitted values. So
  `WorkosTransportError.cause` is core's secret-free `TransportFailure`
  summary, `WorkosDecodeError` wraps its `body`/`cause` in `Redacted`, and
  `UnknownWorkosError.body` is likewise `Redacted` — diagnosis via
  `Redacted.value(...)`, never via a logged error. Every wrapper *message* is
  built from structured parts the SDK controls (reason tag, method, URL, or
  fixed text); the one piece of foreign text that stays printable is the
  vendor envelope's own `message` — the API's human-facing error text.
  Contract tests stringify the error shapes and assert no secret appears.
- **Rejected:** a hand-rolled `decodeTo` transform (duplicates the stdlib and
  lacks its error-redaction middleware); v1's `Sensitive` union
  (`A | Redacted<A>`, needed an `as any`, lets plaintext ride along);
  `Schema.Redacted(inner)` alone (its *encoded* side is `Redacted<T>` — cannot
  read or emit plain wire strings).

## 9. Wire fidelity

Wire field names are kept snake_case verbatim — schemas stay 1:1 with the
spec, path/query descriptors stay typed `keyof Input`, and no key-mapping
layer exists to drift. `grant_type: "password"` is a descriptor
`constantBody`, not an input field — the function name already says it.
Request bodies use `bodyJsonUnsafe` (schema-encoded records are always
JSON-serializable), keeping `HttpBodyError` out of the channel.

## 10. Tests

- `clients/workos/test/errors.test.ts` — generated-style, table-driven
  consistency checks (banner-carrying, byte-reproducible), so the machine-owned
  package satisfies the no-zero-tests rule without hand-written content.
- `vendors/workos/tests/contract.test.ts` — the full pipeline against a mock
  transport (auth header, path/query planning, cursor walk + `before`
  clearing, redaction round-trip, code discrimination, unknown fallback, retry
  dispositions). Agent-writable, moved out of the machine-owned tree.
- `vendors/workos/tests/*.test.ts` (live) — real Staging API; skip visibly
  without `WORKOS_*` credentials. A skip is not verification — the suite must
  run green with credentials before sign-off (see `vendors/workos/README.md`).

## Known deferrals

- The Effect pin (`effect@4.0.0-beta.98`, exact) was provisional here and is
  settled by the pinning-policy ticket (#40): the workspace catalog pins one
  exact verified version and is itself the published peer contract (every
  package declares `effect: "catalog:"` — no side file; bumps are deliberate,
  gate-verified events); `packages/*` and `clients/*` declare `effect` as
  peer + dev, `vendors/*` as direct; v1's staged-artifact compatibility
  matrix carries over as publish-gate policy, rebuilt v2-native with #34.
  The dual-copy hazard stands as the binding reason: with two physical effect
  copies, a consumer's `Redacted` values would miss the provider's registry
  and `Redacted.value` would throw — and it now binds the harness too, which
  provides `Redacted` values per the testing-contract decision (#30).
- The coverage-manifest format (every endpoint tested/todo/skipped) is ticket
  #30's scope; the fragment ships plain vitest suites.
- 429's `daily_quota_exceeded` code maps to the retryable `TooManyRequests`
  universally — the honest common-case default; a non-retryable quota subclass
  is a future spec-patch refinement.
