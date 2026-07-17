# Cross-Client Pattern Survey — Comparison Rubric (v1)

**Ticket #36.** One analyst per package answers EVERY item below, in order, for exactly one package.
Answer from code only. **Each answer MUST cite `path:line` evidence** (repo-relative, e.g.
`packages/stripe/src/client.ts:286`). If a dimension does not apply, write `N/A` + the one file you
checked to confirm absence. Keep answers to 1–3 sentences; this is a data-collection pass, not prose.
Note fork-only packages (erebor, persona, workos) and whether the answer differs on `upstream/main`.

Anchor references (read these once to calibrate): shared client `packages/core/src/client.ts`
(`makeAPI`:566, `make`:577, `makePaginated`:1181); traits `packages/core/src/traits.ts`;
pagination `packages/core/src/pagination.ts:35`; errors `packages/core/src/errors.ts:166`
(`HTTP_STATUS_MAP`), categories `packages/core/src/category.ts`; redaction `packages/core/src/sensitive.ts`.
Contrast exemplars: standard shared client = `packages/stripe/src/client.ts` &
`packages/erebor/src/client.ts`; specialized client = `packages/aws/src/client/api.ts`,
`packages/cloudflare/src/client/`.

## Identity
- **P0** Package name / npm name / `specs/` submodule(s)? Evidence: `packages/<p>/package.json`, `.gitmodules`.

## 1. Spec format + acquisition
- **Q1a** Spec format: OpenAPI / Smithy / GCP Discovery / TS-SDK-derived / docs-derived / other? Evidence: `packages/<p>/specs/*` contents + `scripts/generate.ts` reader.
- **Q1b** Acquisition: direct vendor submodule vs `distilled-spec-*` mirror; any `specs:fetch`/patch preprocessing? Evidence: `.gitmodules`, `package.json` scripts.

## 2. Auth scheme(s)
- **Q2** How is the credential turned into request auth — `Bearer <key>`, raw `Authorization`, custom header, SigV4/request signing, query param, OAuth? Evidence: `getAuthHeaders` in `client.ts` (cf. stripe `client.ts:286` Bearer; erebor `client.ts:185` raw; aws `client/api.ts:67` SigV4).

## 3. Base-URL / endpoint + credential configuration
- **Q3a** Base URL source: `getBaseUrl(creds)` constant, per-service `Service` trait `rootUrl`, region/endpoint rules-engine, baked `api-version`? Evidence: `getBaseUrl` in `client.ts` + `getServiceTrait` usage / `endpoint.ts` if present.
- **Q3b** Credentials service: env vars read (`Config.*`), `Credentials` Context.Service tag + `CredentialsFromEnv` layer, `Redacted` wrapping, default base URL const? Evidence: `packages/<p>/src/credentials.ts`.

## 4. Pagination style(s)
- **Q4** Which `PaginatedTrait.mode` appears (`token`/`page`/`cursor`/`single`), or none? Is `makePaginated` used (`.pages()`/`.items()`) or a custom strategy? Cite one paginated op. Evidence: `grep makePaginated`/`pagination:` in `src/operations|services`; `core/pagination.ts:35`.

## 5. Error taxonomy + per-endpoint error declarations
- **Q5a** How does `matchError` dispatch — HTTP status → `HTTP_STATUS_MAP`, body `type`/`code` field, 2xx error envelope (`isErrorEnvelope`)? Evidence: `matchError` in `client.ts`.
- **Q5b** SDK-specific error classes beyond core + their `Category.with*`; the `Unknown*` fallback + `<P>ParseError`? Evidence: `packages/<p>/src/errors.ts`.
- **Q5c** Do generated operations declare per-endpoint `errors: [...]`? (erebor yes — `operations/createCounterparty.ts:107`; stripe no.) How are they patched in — `patches/*.patch.json` RFC-6902, `patches/<svc>/<op>.json`, Smithy spec edit? Evidence: sample op + `packages/<p>/patches/`.

## 6. Retry / throttling
- **Q6** Per-SDK `Retry` Context.Service tag wired into the client? Default policy vs custom `while`/`schedule`; `retryAfter` via `parseRetryAfterForStatus` (status-gated or unconditional)? Evidence: `packages/<p>/src/retry.ts` + `retry:` arg in `client.ts` + `RETRYABLE_HTTP_STATUSES` usage.

## 7. Sensitive-field redaction
- **Q7** Are `Sensitive*`/`SensitiveOutput*` schemas used on any operation field (count roughly), or only re-exported unused? Evidence: `src/sensitive.ts` + `grep -r Sensitive src/operations|services`.

## 8. Content types (JSON / form / binary / streaming / multipart / GraphQL)
- **Q8** Which `T.Http({ contentType })` values occur — default JSON, `form-urlencoded`, `binary`, multipart (`isMultipart`/`HttpFormDataFile`), GraphQL (`GraphQLOp`), streaming response (`BinaryResponseBody`/`responseContentType:"binary"`)? Evidence: `grep contentType|GraphQLOp|BinaryResponseBody` in ops.

## 9. Operation naming + file layout
- **Q9** Naming convention: PascalCase verb+path (stripe `DeleteCouponsCoupon`), camelCase semantic (erebor `createCounterparty`), per-service module (`src/services/<svc>.ts`)? One file per op vs one module per service? Op count? Evidence: `ls src/operations|services`.

## 10. Generated vs hand-written split
- **Q10** Which files are generated (`src/operations/`, `src/services/` — DO NOT hand-edit) vs hand-written (`client.ts`, `credentials.ts`, `errors.ts`, `retry.ts`, `traits.ts`, `sensitive.ts`, `category.ts`, `index.ts`, extras like `webhooks.ts`)? Any `HOURGLASS PATCH` markers? Does the client use shared `makeAPI` or a bespoke `client/` dir? Evidence: `ls src/` + header of `client.ts`.

## 11. Test approach observed
- **Q11** Where do tests live (`test/` vs `tests/`), how many, live-API integration vs mocked? `testRunId` unique naming + `Effect.ensuring` cleanup + `Effect.flip` error assertions + raised timeouts? Any `client-contract.test.ts`? Evidence: `ls packages/<p>/test*` + one `*.test.ts` (cf. erebor `test/updateInboundInternationalWireTransfer.test.ts`).

## 12. Deviations & smells (free-form, still cite)
- **Q12** Anything this package does that no exemplar does, any `HOURGLASS PATCH`/TODO/workaround, or any place it clearly diverges from the scaffold default (cf. erebor `client.ts:11-25` deviation notes). Flag as candidate "architectural accident to erase" vs "legitimate API-domain variation." Evidence: `path:line`.
