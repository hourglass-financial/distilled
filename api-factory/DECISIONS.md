# Gold-standard WorkOS fragment — design decisions

Rationale for the v2 Effect-v4 client fragment under `api-factory/`. This is the
target a deterministic emitter must reproduce. Optimized, in order, for consumer
ergonomics, honesty (no lying unions/schemas), emitter-plausibility, and
machinery depth.

Package split (binding): `packages/core` = hand-written machinery;
`clients/workos` = "generated" exemplar (every file carries a `@generated`
DO-NOT-EDIT banner); `vendors/workos` = private live-test package. The
WorkOS-specific bits in `clients/workos` (error codes, envelope shape, auth
scheme, base URL) are all mechanically derivable from the spec, so a thin
generated client + a deep core is a faithful two-package model.

## Consumer example (the ergonomics we optimize for)

```ts
import { organizations, userManagement, layerFromEnv } from "@hourglass-financial/api-factory-workos";
import { Effect, Stream } from "effect";
import * as Redacted from "effect/Redacted";

const program = Effect.gen(function* () {
  const org = yield* organizations.create({ name: "Acme" });          // Effect<Organization, WorkosError<…>, WorkosClient>
  const all = yield* Stream.runCollect(organizations.listItems({}));  // every org, cursor followed
  const auth = yield* userManagement.authenticateWithPassword({
    client_id: "client_…",
    client_secret: Redacted.make(process.env.WORKOS_API_KEY!),
    email: "user@example.com",
    password: Redacted.make(form.password),                           // secret redacted at the boundary
  }).pipe(Effect.catchTag("MfaEnrollment", () => redirectToMfa()));   // distinct typed error, not a BadRequest
  yield* organizations.remove({ id: org.id });
  return { all, token: auth.access_token };                            // Redacted<string> — prints "<redacted>"
});

program.pipe(Effect.provide(layerFromEnv)); // one layer: fetch transport + env creds + default retry
```

## 1. Operation surface

- **Choice:** free-standing, tree-shakeable functions grouped into resource
  namespaces (`organizations.create`, `userManagement.authenticateWithPassword`),
  each returning a plain `Effect<Output, WorkosError<…>, WorkosClient>`. Clean
  public names — the internal codenames (`UserlandSessions*`, `Create0`) are
  gone.
- **Alternatives:** v1's dual `OperationMethod` that is *both* a yieldable Effect
  (yield to get a requirement-free fn) and a callable. Rejected: the
  `SingleShotGen`/`asEffect`/`pipeArguments` proto is bespoke cleverness that a
  deterministic emitter should not have to reproduce, and it complicates the
  type for a niche ergonomic win. A plain function is simpler, equally callable,
  and fully inferred.
- **Emitter shape:** each op is a uniform block — input schema + interface, a
  declarative descriptor, a one-line dispatch function — so per-op files are
  boring and stable.

## 2. Service / layer shape

- **Choice:** a single `WorkosClient` `Context.Service` exposing one `run`
  method (core's `Runner`). `layerWith({ retry })` builds it over an injected
  `HttpClient` + `Credentials`; `layer` is the default-retry variant;
  `layerFromEnv` is the batteries-included one-liner (`fetch` + env creds). The
  transport and credentials are injectable, which is exactly what makes the
  contract tests run against a mock `HttpClient` with zero network.
- **Alternatives:** v1 threaded a per-op `Effect.serviceOption(Retry)` lookup on
  every call plus a credentials service holding an *effect*. Rejected in favor of
  capturing `http`/`creds`/`retry` once at layer construction — the run path
  reads plain captured values, and retry is layer-level config (infrastructure),
  not a per-call concern.

## 3. Per-endpoint error channel (honest)

- **Choice:** `WorkosError<EC>` = the op's declared typed errors
  (`InstanceType<EC[number]>`) ∪ universal defaults (401/429/5xx) ∪
  `UnknownWorkosError` ∪ `WorkosTransportError` ∪ `WorkosDecodeError`. The
  matcher only ever constructs a class the op declares or a universal default;
  anything else becomes `UnknownWorkosError` (signalling a spec gap to patch).
  The union in the type system is exactly what the runtime can produce.
- **Code discrimination:** `authenticateWithPassword` shows the real payoff —
  WorkOS's two envelopes (`{ code, message }` and OAuth `{ error,
  error_description }`) are normalized to one discriminator, and codes like
  `invalid_credentials`, `mfa_enrollment`, `email_verification_required`,
  `organization_selection_required`, `invalid_grant` map to *distinct* tagged
  classes — never a single opaque `BadRequest`. Code match takes precedence over
  status.
- **The one coercion:** matcher construction casts `Effect.fail(instance)` to the
  declared union once, in core, because `tsc` can't prove a runtime-gated class
  is in the union. This is the only assertion; there is no `any` in the
  factory/operation config (contrast v1's `credentials: … as any`,
  `getBaseUrl: (creds: any)`, and the per-op `as unknown as GeneratedStructCodec`
  laundering, all of which are gone).

## 4. Pagination

- **Choice:** cursor pagination on `Stream.paginate` (verified v4 primitive),
  exposed as three uniform functions per paginated op: `list` (one page, an
  `Effect`), `listPages` (`Stream` of pages), `listItems` (`Stream` of items).
- **Alternatives:** v1 attached `.pages`/`.items` onto the operation function
  object and traversed cursors via stringly-typed `getPath("list_metadata.after")`.
  Rejected: three plain exports are more emitter-deterministic and tree-shakeable
  than a function-with-properties, and the page→cursor / page→items projections
  are ordinary typed accessor functions (`(page) => page.list_metadata.after`) —
  no `getPath`, no `any`.

## 5. Redaction

- **Finding:** `Schema.Redacted(inner)` does **not** subsume v1's `Sensitive` /
  `SensitiveOutput`. Its *encoded* side is `Redacted<T>` (it serializes to
  `"<redacted>"`), so it can neither read a plain wire string nor emit the real
  secret over the wire.
- **Choice:** one `Secret` schema (`String -> decodeTo(Redacted(String), transform)`)
  used for **both** directions — decode wraps a wire string into
  `Redacted<string>`; encode unwraps it back to the plain string. Request secrets
  (`password`, `client_secret`) reach the server for real while staying
  `<redacted>` in every log; response tokens (`access_token`, `refresh_token`)
  are redacted before the caller sees them. Cast-free (unlike v1's `Sensitive`,
  which needed an `as any` in its decode getter). Contract tests assert the wire
  body carries the real secret *and* `JSON.stringify(result)` never contains a
  token.
- **Trade-off:** the decoded input type is strictly `Redacted<string>`, so
  callers wrap plaintext with `Redacted.make(...)`. Deliberate: it redacts the
  secret the moment it crosses the SDK boundary and keeps the helper a one-liner.

## 6. Retry idioms

- **Choice:** transient/throttling categorization drives a bounded, jittered
  exponential backoff that honors `Retry-After`/`RateLimit-Reset` exactly,
  clamped by `Duration.min` to a 60s cap, with a 500ms floor for 429s. Built on
  `Schedule` + `passthrough` + `modifyDelay(({ input }) => …)` reading the error
  from schedule metadata. Raw `HttpClientError` transport faults stay raw through
  the retry loop so only genuine transport failures are retried; the survivor is
  then wrapped into `WorkosTransportError`.
- **Honest reimplementation:** v1's `capped` helper had a latent bug — on
  exceeding the cap it returned a hard-coded `Duration.millis(5000)` instead of
  the cap, silently collapsing a 60s hint to 5s. Fixed here (test:
  `retry-after.test.ts` "clamps to the cap").

## Better error-classification mechanism (replaces prototype mutation)

v1's `category.ts` stamped category/retryability booleans onto each error
class's `prototype` under symbol keys — invisible to the type system and
polluting every instance's inspected shape (rejected in #21). Here each error
class declares `static readonly meta: ErrorMeta` next to the class (mechanically
checkable by `tsc`); the runtime reads it via `error.constructor.meta`. No
prototype writes, no per-instance fields (test: `category.test.ts` asserts the
instance has no `category`/`retry`/`meta` own-or-inherited property while
`metaOf` still classifies it).

## Deviations / honesty notes

- **`organizations.remove` declares only `Forbidden`.** The spec documents
  200/202/403 for delete (a missing org returns 403, not 404), so declaring
  `NotFound` — as v1 did — would be a lying union. Corrected.
- **429 → `TooManyRequests` (retryable) universally.** The authenticate spec
  models its 429 as `daily_quota_exceeded` (arguably non-retryable), but WorkOS
  returns 429 for genuine rate limits too (global 6000/60s, per-email 10/60s)
  and those carry `Retry-After`. Mapping 429 to the retryable class is the honest
  common-case default; the quota nuance is left as a documented simplification
  rather than special-cased.
- **Wire field names are snake_case verbatim** (not camelCased). Keeps schemas
  1:1 with the spec, lets path/query descriptors be typed `keyof Input`, and
  avoids a key-mapping layer. Matches WorkOS's own conventions.
- **`bodyJsonUnsafe`** is used for request bodies: they are plain records of
  schema-encoded scalars/arrays/objects — always JSON-serializable — so the sync
  encoder is honest and keeps `HttpBodyError` out of the channel.
- **Runner requirement channel is `never`** for these ops because the schemas
  have no encoding/decoding services; the type is constrained
  (`IS extends Schema.Top & { EncodingServices: never }`) so a service-bearing
  schema would be a compile error rather than a silent leak.
