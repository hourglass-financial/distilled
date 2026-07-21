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
(The harness package now ships these as primitives — `resourceName`,
`resource()`, `makeLiveTest` — which the suites here migrate onto under
[#52](https://github.com/hourglass-financial/distilled/issues/52).)

## Coverage audit

`bun run audit:coverage` checks `tests/coverage.ts` (once #52 authors it)
against the generated client's `src/registry.ts`: JSON report on stdout,
paste-ready stubs for missing entries on stderr, exit 1 on drift. It never
writes — commit manifest edits yourself.

## Probes and evidence

`probes/<id>.ts` files are named raw-request specs (`defineProbe`) — the
sanctioned way to capture wire behavior as patch evidence. Run one with
credentials in the environment:

```
bun run probe organizations-get-missing
```

The scrubbed capture lands in `evidence/<id>.json` (auto-scrub of
secret-shaped fields and the API key; never bypass it with plain `fetch`).
Patch entries cite probes by id.

A probe that needs world-state declares it (ADR-0007): `setup` creates
prerequisite resources through the typed client with Scope-guaranteed
teardown and returns params the request is templated over
(`organizations-get-ok.ts` is the pattern); `envParams` binds
dashboard-seeded ids to env vars — never hard-code an id in a spec — and
`bun run probe <id> --param k=v` substitutes one by hand. Param values are
normalized to `<name>` placeholders in the evidence, so recaptures diff
clean and workspace ids never land in the repo.
