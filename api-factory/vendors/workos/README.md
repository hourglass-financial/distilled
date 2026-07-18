# WorkOS vendor tests

Agent-writable test home for the WorkOS client (`clients/workos` is
machine-owned and carries only generated consistency tests). Two suites live
here:

- `tests/contract.test.ts` — the full request pipeline against a mock
  transport. No network, no credentials; always runs.
- `tests/organizations.test.ts`, `tests/authentication.test.ts` — live tests
  against the real WorkOS **Staging** API. Without credentials they skip
  visibly (`it.skipIf`), which is correct SDK-consumer behavior — but a skip is
  not verification: **before signing off on changes to the client, provide
  credentials and run this suite green.**

## Credentials

Set these in the environment (or an untracked `.env` you source yourself —
never commit them):

| Variable | Required by | Notes |
|---|---|---|
| `WORKOS_API_KEY` | all live tests | Staging environment secret key |
| `WORKOS_API_URL` | optional | Defaults to `https://api.workos.com` |
| `WORKOS_CLIENT_ID` | authentication tests | The environment's AuthKit client id |

Run from `api-factory/`: `bun run test` (all packages) or
`cd vendors/workos && bun run test`.

Live-test conventions: resource names embed the per-run `testRunId`, and every
created resource is deleted via `Effect.ensuring` even when assertions fail.
