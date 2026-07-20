# Golden trees live at the package root, outside every gate glob

Codegen's byte-frozen expected outputs live in `packages/codegen/goldens/`,
deliberately outside `src/` and `test/`: the package gates (`oxlint src
test`, `oxfmt src test`, both tsconfig includes, vitest's `test` dir) must
never touch them — `oxlint --fix` would silently rewrite the frozen
contract it exists to protect. Do not "tidy" goldens into `test/`.
Regeneration is explicit (`UPDATE_GOLDENS=1`), and the emit suite compares
both directions (missing and extra files fail).

- **Rejected:** goldens under `test/goldens/` with per-tool exclusions —
  four separate exclusion mechanisms (two tsconfigs, oxlint, oxfmt) that
  each fail open when a future script forgets one; placement needs zero
  bookkeeping.
- **Rejected:** vitest snapshot files instead of real trees — snapshots
  serialize through the test framework (escaping, formatting) instead of
  locking the actual emitted bytes the regen gate compares.
