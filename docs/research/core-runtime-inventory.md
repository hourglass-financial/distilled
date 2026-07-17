# Distilled core runtime inventory

Research ticket: hourglass-financial/distilled#21 ("Distilled core runtime inventory").

Question: what does the shared client runtime consist of across upstream distilled
and this fork, and for each piece — take-as-is, rethink, or drop for v2?

Scope: `packages/core/src/` (the `@distilled.cloud/sdk-core` runtime) plus its live
consumers `packages/erebor`, `packages/persona`, `packages/workos`. Line references
are against `origin/main` (`packages/core/src` there is byte-identical to the branch
this was authored from — verified with `git diff HEAD origin/main -- packages/core/src`,
empty).

## TL;DR

- The runtime is small (13 source files, ~4.4k LOC) and centres on one factory:
  `makeAPI(config).make(...)` / `.makePaginated(...)` in `client.ts`.
- Fork divergence from upstream in `packages/core/src` is limited to **5 files**:
  2 new (`generated-schema.ts`, `openapi-additional-properties.ts`) and 3 modified
  (`client.ts`, `traits.ts`, `sensitive.ts`). Everything else matches upstream
  exactly. All fork edits are marked `// HOURGLASS PATCH:`.
- The single most valuable fork change is in `client.ts`: the operation error and
  requirement channels are now **honest** (they surface transport/parse failures and
  the `HttpClient` dependency) instead of advertising only spec-declared errors. All
  three consumers depend on this. Keep it.
- The clearest v2 rethink targets are the **prototype-mutation category registry**
  (`category.ts`), the **`any`-collapsing schema re-export** (`schema.ts`), and the
  **single 450-line imperative `Effect.gen` request/response body** in `client.ts`.

## Classification table

| Runtime concern | File (evidence) | Fork vs upstream | Verdict | Rationale |
|---|---|---|---|---|
| `makeAPI` factory + `OperationMethod` dual (yieldable+callable) | `client.ts:566` (`makeAPI`), `client.ts:73-78` (`OperationMethod`), `client.ts:1162-1178` (`SingleShotGen`/`pipeArguments` proto) | **modified** (fork) | **take-as-is (keep), rethink internals** | The public factory shape is proven and used by every consumer. The dual yieldable/callable operation via `SingleShotGen` + `pipeArguments` is bespoke and clever but hard to read; revisit only if it blocks v2 ergonomics. |
| Precise operation error channel | `client.ts:84-89` (`ClientOperationError`), `client.ts:189-194` (generic `matchError`), `client.ts:586-597` (`make` return type), `client.ts:255-266` (`isErrorClassAllowedForOperation`) | **modified** (fork; HOURGLASS PATCH) | **take-as-is (keep)** | Fork replaced upstream's `Effect<never, unknown>` matchError and `E`-only error channel with `OperationError \| UniversalError \| ParseError \| HttpClientError \| HttpBodyError` and requirements `Creds \| HttpClient \| O["DecodingServices"]`. This is the fork's core value-add; all three consumers wire `makeAPI<Creds, never, UniversalError, ParseError>` and call `isErrorClassAllowedForOperation` (`erebor/src/client.ts:115,147,177`, `persona/src/client.ts:75,102`, `workos/src/client.ts:86,103`). |
| Request building (path/query/header/body encode) | `client.ts:692-702` (`Effect.try` around `buildRequestParts`), `client.ts:751-836` (imperative header/content-type/body branch) | **modified** (fork wrapped encode in `Effect.try`) | **rethink** | ~150 lines of imperative `if (isMultipart) / isBinaryBody / isFormUrlEncoded / else JSON` header+body mutation inside one `Effect.gen`. Works, but is the densest part of the runtime. Candidate for extraction into `HttpClient` request transforms (see idioms below). Fork's `Effect.try` mapping encode-throws to `ParseError` is a keep. |
| Response handling (decode, envelopes, redirect, binary, GraphQL) | `client.ts:858-1108` | same as upstream | **rethink** | Single 250-line block mixing: no-follow-redirect synthesis (858-883), 4xx routing (885-913), void/204 (916-948), binary download (931-939), Cloudflare `result:null`/`items` coercions (1012-1051), empty-body-as-`TransportError` vs schema-gap-as-`ParseError` split (1053-1108). Lots of provider-specific special cases live in shared core. v2 should push provider quirks into per-SDK `transformResponse`/`isErrorEnvelope` hooks (which already exist, `client.ts:203,214`) rather than hardcoding Cloudflare shapes in core. |
| Retry wiring per operation | `client.ts:1111-1160` (`serviceOption(retry)` + `lastError` Ref + `Effect.retry`) | same as upstream | **take-as-is** | Reads the SDK's `Retry` `Context.Service` via `Effect.serviceOption`, falls back to `makeDefault`. Idiomatic. |
| Trait / HTTP-binding annotation system | `traits.ts:60-100` (`makeAnnotation`/`all`), `traits.ts:script symbols`, `traits.ts:561-575` (`getQueryParam`), `traits.ts:762-812` (`setQueryValue`) | **modified** (fork added OpenAPI query styles) | **take-as-is** | Symbol-annotation-on-AST reflection. NOTE: Effect v4 in this repo (`repos/effect-v4/packages/effect/src/unstable/http/`) ships **no `HttpApi`/`HttpApiClient`/`HttpApiEndpoint`** module — only the low-level `HttpClient*`. So this is a justified bespoke layer, not a reinvention of an available primitive. Fork's `HttpQuery(name, {style, explode})` (`traits.ts:271-278`, `setQueryValue` 762-812) adds form/deepObject/space/pipe serialization for the OpenAPI generators. |
| Typed HTTP-status errors | `errors.ts:36-157` (`Schema.TaggedErrorClass` classes), `errors.ts:166-197` (`HTTP_STATUS_MAP`, `RETRYABLE_HTTP_STATUSES`) | same as upstream | **take-as-is** | Clean `Schema.TaggedErrorClass` usage decorated with categories. Matches the skill's error doctrine. |
| Error category system | `category.ts:101-147` (`withCategory`/`withRetryable` prototype mutation), `category.ts:184,258,413` (`@ts-expect-error` dynamic reads), `category.ts:291-306` (`isTransientError`) | same as upstream | **rethink** | Categories/retryable are stored by **mutating error-class prototypes** with string keys and read back with `@ts-expect-error` dynamic property access — three `@ts-expect-error` sites. This contradicts the effect skill's "no unchecked casts" rule and is invisible to the type system. v2 should model category membership as Schema annotations or a typed `WeakMap<Ctor, Categories>` so `catchCategory` narrows without casts. Behaviour is fine; the representation is the problem. |
| Pagination streams | `pagination.ts:93-166` (`paginatePageNumber`), `:181-237` (`paginateCursor`), `:251-304` (`paginateToken`), all via `Stream.unfold` + `Effect.gen` | same as upstream | **take-as-is** | Idiomatic `Stream.unfold`. Minor: `missingPaginationConfig` uses `Stream.die` (`:64`) and `mode:"single"` dies (`:322`) rather than a typed failure. |
| Retry policy / schedules | `retry.ts:231-245` (`makeDefault`), `:199-212` (`honorServerHint`), `:117-158` (`ServerRetryHintCapMs` config) | same as upstream | **take-as-is, one fix** | Server-hint-aware exponential+jitter, capped, 5 attempts — solid. Two smells: `makeRetryService = Context.Service<any, Policy>()` (`:68`, `any` service type), and `capped(max)` returns a hardcoded `Duration.millis(5000)` when `duration > max` instead of `max` (`:85-90`) — latent bug masked because every call site passes `capped(Duration.seconds(5))`. |
| Retry-After / RateLimit parsing | `retry-after.ts:37-114` (`parseRetryAfter`, `parseRatelimit`, `parseServerRetryHint`) | same as upstream | **take-as-is** | Pure, well-tested-looking header parsing. No Effect coupling needed. |
| Sensitive / Redacted redaction | `sensitive.ts:38-55` (`Sensitive`), `:85-100` (`SensitiveOutput`) | **modified** (fork widened `S.Schema<A>` → `S.Codec<A,E,RD,RE>`) | **take-as-is** | Fork generalized the signatures to codecs so encode/decode context flows; strictly an improvement. Uses `S.decodeTo` + `SchemaTransformation.transform` idiomatically. |
| Binary body schemas | `schemas.ts:18-128` (`BlobSchema`…`BinaryStreamResponseSchema`) | same as upstream | **take-as-is** | `Schema.declare` guards for Blob/Uint8Array/ArrayBuffer/ReadableStream/Effect Stream. Cloud-agnostic; fine. |
| `any`-collapsing schema re-export | `schema.ts:23-50` (re-exports `effect/Schema` but retypes `Struct`/`optional`/leaf scalars to `any`) | same as upstream | **rethink / drop** | A **compile-performance hack**: generated service files import this so TS never instantiates heavy Schema generics; the explicit `Schema.Codec<Foo>` annotations carry the real types. It works but defeats type-checking inside generated files and is a maintenance trap. v2 should re-evaluate whether tsc/isolatedDeclarations perf still needs it. |
| Generated struct type helper | `generated-schema.ts:15-25` (`GeneratedStructFields`, `GeneratedStructCodec`) | **new file** (fork; HOURGLASS PATCH) | **take-as-is** | Type-level only; keeps generated `.d.ts` small while staying composable. Codegen support, no runtime cost. |
| OpenAPI additionalProperties decoder | `openapi-additional-properties.ts:12-61` (`StructWithAdditionalProperties`) | **new file** (fork; HOURGLASS PATCH) | **take-as-is** | Idiomatic `Schema.declareConstructor` + `SchemaParser.decodeUnknownEffect`. Models OpenAPI declared-props + `additionalProperties`. Codegen support. |
| JSON Patch (spec patching) | `json-patch.ts:169-306` (`applyOperation`, `applyAllPatches`) | same as upstream | **take-as-is (out of request-runtime scope)** | Build-time only (RFC 6902 patcher run during `generate`, uses `fs`/`path`, throws). Not part of the request-execution runtime the ticket is inventorying; keep as-is. |

## Fork-vs-upstream notes (core only)

`git diff --stat upstream/main...origin/main -- packages/core/src`:

```
 packages/core/src/client.ts                        | 148 +++++++++++++++------
 packages/core/src/generated-schema.ts              |  25 ++++
 packages/core/src/openapi-additional-properties.ts |  61 +++++++++
 packages/core/src/sensitive.ts                     |  12 +-
 packages/core/src/traits.ts                        |  95 ++++++++++---
 5 files changed, 275 insertions(+), 66 deletions(-)
```

- `client.ts` — the substantive fork work (the "precise operation errors" line of PRs).
  Adds `ClientOperationError<OperationError, UniversalError, ParseError>` (`:84`), makes
  `ClientConfig`/`matchError`/`ParseError` generic over `UniversalError`/`ParseError`
  (`:142-197`), exports `isErrorClassAllowedForOperation` (`:260`), widens the `make`
  return requirements to `Creds | HttpClient.HttpClient | O["DecodingServices"]`
  (`:587`), constrains inputs to `Schema.Top & { readonly EncodingServices: never }`
  (`:578`), and wraps `buildRequestParts` in `Effect.try` → `ParseError` (`:693-702`).
  Net effect: the type of an operation now tells the truth about what it needs and how
  it can fail. **Keep; this is the reason the fork exists.**
- `traits.ts` — additive: `HttpQueryStyle`/`HttpQueryOptions`, `HttpQuery(name, options)`
  overload (`:271`), `getQueryParamOptions` (`:568`), and an OpenAPI-aware `setQueryValue`
  (`:762-812`) supporting form/spaceDelimited/pipeDelimited/deepObject. Legacy trait
  behaviour is unchanged when no options are passed. **Keep.**
- `sensitive.ts` — signature widening from `S.Schema<A>` to `S.Codec<A,E,RD,RE>` on
  `Sensitive` and `SensitiveOutput`. Pure improvement. **Keep.**
- `generated-schema.ts`, `openapi-additional-properties.ts` — new codegen-support files
  for the OpenAPI generator the fork added. **Keep.**
- Everything else (`category.ts`, `errors.ts`, `json-patch.ts`, `pagination.ts`,
  `retry.ts`, `retry-after.ts`, `schema.ts`, `schemas.ts`) is **identical to upstream** —
  so any rethink of those is a shared/upstream conversation, not a fork-local one.

Consumer friction worth flagging: all three clients instantiate `makeAPI` with `as any`
on nearly every config field (`erebor/src/client.ts:183-190`:
`credentials: Credentials as any`, `getBaseUrl: (creds: any) => ...`,
`ParseError: EreborParseError as any`, `retry: Retry as any`). The `ClientConfig`
generics don't flow cleanly to the call site, so consumers cast them away — which
undercuts the type-honesty the fork just bought in the error channel. A v2 `ClientConfig`
should be shaped so consumers need zero `as any`.

## Effect v4 idioms the current runtime under-uses

Grounded in `.claude/skills/effect/SKILL.md` and `references/HTTP_CLIENTS.md`,
`SERVICES_LAYERS.md`, `SCHEDULING.md`.

1. **`Effect.fn("Domain.operation")` for named operations.** The skill makes this a core
   default (SKILL.md:39,63). `client.ts` builds operations as plain `Effect.gen`
   thunks (`innerFn`, `fn`, `client.ts:658,1120`) and then bolts on tracing manually via
   `Effect.withSpan(spanName, ...)` (`:1147-1154`). `Effect.fn` would give the span/stack
   metadata for free and read more idiomatically.
2. **`HttpClient` request transforms / middleware layers.** The skill says wrap HTTP
   clients at the adapter boundary and prefer client transforms (SKILL.md:48,82). Auth
   headers, base URL, `Accept`, and `Content-Type` are set imperatively per call
   (`client.ts:751-783`). These are exactly what `HttpClient.mapRequest` /
   layer-level client transforms are for — applied once at client construction instead of
   on every request.
3. **`HttpClient.retryTransient(...)` for transport retry.** Called out explicitly
   (SKILL.md:74). Core hand-rolls a `lastError` `Ref` + `Effect.retry` (`client.ts:1125-1144`).
   The server-hint-honoring policy legitimately needs custom logic, but the plain
   transport-error retry layer could lean on the built-in.
4. **`Context.Reference` (with a default) for optional runtime config.** `ServerRetryHintCapMs`
   is a `Context.Service<number>` read via `Effect.serviceOption` + env fallback
   (`retry.ts:117-174`). An optional, defaulted knob is the textbook `Context.Reference`
   case; the skill only warns against hiding *required* authority behind references
   (SKILL.md:96), which does not apply here.
5. **`Effect.catch` instead of `Effect.catchIf(() => true, ...)`.** Three always-true
   predicates in the response JSON/text fallback (`client.ts:887-905`, `:952-956`) are
   just `Effect.catch`. AGENTS.md documents `Effect.catch` as the v4 form.
6. **Schema annotations over prototype mutation for error categories.** `category.ts`
   mutates prototypes and reads them with `@ts-expect-error` (`:184,258,413`). The skill
   forbids unchecked casts to satisfy typing (SKILL.md:91). Modelling categories as Schema
   annotations (or a typed `WeakMap`) would let `catchCategory` narrow without casts.
7. **No `as any` at service boundaries.** SKILL.md:91 again — the consumer `makeAPI<...>`
   casts (see above) are the runtime's biggest live violation of this rule.

## Reproduction pointers

```bash
# fork-vs-upstream core diff
git diff upstream/main...origin/main -- packages/core/src

# fork markers
rg -n "HOURGLASS PATCH" packages/core/src

# confirm v4 ships no HttpApi derivation (justifies the bespoke trait layer)
ls repos/effect-v4/packages/effect/src/unstable/http/   # HttpClient* only, no HttpApi*

# consumer usage of the fork error patches
rg -n "makeAPI|isErrorClassAllowedForOperation|UniversalError" \
   packages/erebor/src packages/persona/src packages/workos/src
```
