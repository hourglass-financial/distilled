# @distilled.cloud/persona

Effect-native SDK for the Persona API generated from Persona OpenAPI version
`2025-12-08`.

## Install

```bash
bun add @distilled.cloud/persona effect
```

## Quick Start

```typescript
import * as Effect from "effect/Effect";
import * as Persona from "@distilled.cloud/persona";

const program = Effect.gen(function* () {
  const listAccounts = yield* Persona.listAllAccounts;
  return yield* listAccounts({ page: { size: 10 } });
});

const result = await Effect.runPromise(
  program.pipe(Effect.provide(Persona.CredentialsFromEnv)),
);
```

Most applications can provide only `Persona.CredentialsFromEnv`; retry uses the
SDK default policy when no custom `Persona.Retry.Retry` layer is installed.

## Configuration

`CredentialsFromEnv` reads:

- `PERSONA_API_KEY` - required API key
- `PERSONA_API_URL` - optional override, defaults to `https://api.withpersona.com/api/v1`

Requests authenticate with `Authorization: Bearer <token>`.

Use sandbox credentials for live testing. Avoid creating real PII, government
ID, biometric, or irreversible compliance data.

## Error Handling

Persona error responses use an `errors` array with entries such as
`{ title, details, meta }`. The client maps documented HTTP statuses to typed
errors and preserves unrecognized envelopes in `UnknownPersonaError`.

```typescript
const getAccount = yield* Persona.retrieveAnAccount;

yield* getAccount({ accountId: "act_missing" }).pipe(
  Effect.catch("NotFound", (error) =>
    Effect.succeed(`missing account: ${error.message}`),
  ),
);
```

Common errors include `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`,
`RequestTimeout`, `Conflict`, `UnprocessableEntity`, `TooManyRequests`, and
`ServiceUnavailable`.

## Service Coverage

The SDK generates 200 operations from the bundled Persona OpenAPI spec. Covered
areas include Accounts, API Keys, API Logs, Cases, Connect, Devices, Documents,
Events, Graph, Importers, Inquiries, Inquiry Sessions, Inquiry Templates, List
Items, Lists, Reports, Transactions, Verifications, Webhooks, and Workflows.

Representative operations:

- `listAllAccounts`, `createAnAccount`, `retrieveAnAccount`, `updateAnAccount`
- `listAllApiKeys`, `createAnApiKey`, `expireAnApiKey`
- `listAllCases`, `createACase`, `assignACase`, `searchCases`
- `createAnInquiry`, `approveAnInquiry`, `declineAnInquiry`, `searchInquiries`
- `listAllEvents`, `retrieveAnEvent`
- `createAReport`, `retrieveAReport`, `dismissMatches`
- `createATransaction`, `updateATransaction`, `transactionsSetTags`
- `createAWebhook`, `rotateAWebhookSecret`
- `createAWorkflowRun`, `retrieveAWorkflowRun`
