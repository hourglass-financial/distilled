# @distilled.cloud/erebor

Effect-native [Erebor](https://erebor.bank) SDK generated from the Erebor OpenAPI 3.1 specification. Manage banking primitives — programs, customers, deposit accounts, counterparties, transfers, webhooks, and events — with exhaustive error typing.

## Installation

```bash
npm install @distilled.cloud/erebor effect
```

### Private GitHub Packages Preview

This fork can publish a private branch-built package for other
`hourglass-financial` repositories:

```bash
bun add @hourglass-financial/erebor@erebor-sdk
```

Consumers must route the `@hourglass-financial` scope to GitHub Packages:

```ini
@hourglass-financial:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

GitHub Actions consumers can use `GITHUB_TOKEN` as `NODE_AUTH_TOKEN` after the
package grants read access to the consuming repository. Local developers need a
GitHub token with package read access. See
[`docs/github-erebor-package-publishing.md`](../../docs/github-erebor-package-publishing.md)
for publishing and consumer setup details.

## Quick Start

```typescript
import { Effect, Layer } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { listPrograms } from "@distilled.cloud/erebor/Operations";
import { CredentialsFromEnv } from "@distilled.cloud/erebor";

const program = Effect.gen(function* () {
  const result = yield* listPrograms({});
  return result.data;
});

const EreborLive = Layer.mergeAll(FetchHttpClient.layer, CredentialsFromEnv);

program.pipe(Effect.provide(EreborLive), Effect.runPromise);
```

## Configuration

Set the following environment variable:

```bash
EREBOR_API_KEY=your-api-key
```

The key is sent verbatim in the `Authorization` header (no `Bearer` prefix). Sandbox keys (`test_…`) hit the sandbox environment; live keys hit production — the routing is determined by the key itself.

## Error Handling

```typescript
import { Effect } from "effect";
import { getProgram } from "@distilled.cloud/erebor/Operations";
import { NotFound, UnknownEreborError } from "@distilled.cloud/erebor";

getProgram({ id: "missing" }).pipe(
  Effect.catchTags({
    NotFound: () => Effect.succeed(null),
    UnknownEreborError: (e) =>
      Effect.fail(new Error(`Erebor error ${e.code ?? "?"}: ${e.message ?? ""}`)),
  }),
);
```

Errors are matched from the JSON response shape `{ error, message, docs_url, field, error_details }`. The `error` field becomes `code` on `UnknownEreborError` (e.g. `INVALID_REQUEST`, `UNAUTHORIZED`).

## Services

- **Onboarding** — documents, business / person applicants, onboardings
- **Customers & Programs** — customers, programs, deposit account templates
- **Accounts** — deposit accounts, account numbers, blockchain addresses
- **Counterparties** — counterparties, counterparty bank / blockchain / international / rail / wire addresses
- **Transfers** — inbound / outbound ACH, wire, international wire, rail, blockchain, and book transfers
- **Activity** — transactions, events
- **Webhooks** — webhook subscriptions and ping
- **Simulation** (sandbox) — simulate inbound and returned ACH, wire, international wire, and blockchain transfers

## Updating Specs

Refresh the package-local Erebor docs snapshot, then regenerate operations:

```bash
bun run specs:update
bun run generate
```

The canonical spec lives at `packages/erebor/specs/distilled-spec-erebor/specs/openapi.json`.

## License

MIT
