# api-factory

The standalone v2 API-client-factory workspace: Bun + Turborepo + TypeScript 7
(tsgo `tsc`) + oxlint/oxfmt. It is fully decoupled from the v1 workspace at the
repo root (`packages/*`, `www/*`, root `package.json`) — it has its own Bun
lockfile, catalog, tsconfig base, and lint/format config. Packages publish
(later) to GitHub Packages under `@hourglass-financial/api-factory-*`.

## Layout

```
api-factory/
├── packages/            # factory machinery (hand-written; agent-writable)
│   ├── core/            # @hourglass-financial/api-factory-core — shared runtime
│   ├── codegen/         # @hourglass-financial/api-factory-codegen — codegen engine
│   └── harness/         # @hourglass-financial/api-factory-harness — test harness
├── clients/             # factory outputs (machine-owned; hand edits fail the regen gate)
│   └── workos/
└── vendors/             # per-vendor spec snapshot + patches + config + tests
    └── workos/
```

Ownership classes, the layer model, and the sanctioned fix paths are defined
in [AGENTS.md](./AGENTS.md); vocabulary in [CONTEXT.md](./CONTEXT.md);
decision records in [docs/adr/](./docs/adr/README.md) and (for the exemplar)
[DECISIONS.md](./DECISIONS.md).

## Gates

Run from `api-factory/` (each script = `turbo run <task>`):

| Command | Purpose |
|---|---|
| `bun install` | Install deps, produce `bun.lock` |
| `bun run typecheck` | Type check (`tsc && tsc -p tsconfig.test.json`) |
| `bun run build` | Build to `lib/` (`tsc -b`) |
| `bun run lint` | Lint (`oxlint --fix src test`) |
| `bun run fmt` | Format (`oxfmt --write src test`) |
| `bun run check` | Types + lint + format check |
| `bun run test` | Run vitest suites (`bunx vitest run test`) |

## Notes

- All packages are `"private": true` until the publishing-pipeline ticket lands.
- No `effect` dependency until the v2 Effect pinning policy is decided.
- No `--passWithNoTests`: zero-test packages must fail.
