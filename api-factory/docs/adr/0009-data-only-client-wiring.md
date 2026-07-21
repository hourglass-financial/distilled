# Generated client wiring is data-only; shared runtime logic is core machinery

After #47, the emitters stamped runtime logic into every generated client:
error-envelope decoding, transport/decode failure wrapping, env-credentials
assembly, and the matcher-consistency test's assertion loops. That is N
drifting copies of one behavior — a fix means regenerating every client
instead of releasing core — and it strains #27's rule that hand-written logic
is machinery in `packages/`, never in `clients/`. Decided (ticket #50, "the
hoist"): core owns the behavior as data-parameterized factories —
`makeEnvelopeDecoder`, `makeVendorAdapters`, `credentialsConfig`,
`credentialsFromEnvEffect`, `checkMatcherConsistency` — and emitted files
carry only **identity** (names, tags, docs), **data** (field lists, literals,
tables), and **one-call wiring** of those factories.

The bar, precisely: *vendor-behavior logic* (conditionals, message
construction, Redacted wrapping, error mapping, consistency assertions)
hoists; *dependency wiring* stays emitted — the layer-assembly `Effect.gen`
(yield `HttpClient`/`Credentials`, construct the runner, return the service)
and policy defaulting to a core default
(`options.retry ?? Retry.defaultPolicy`).

- **Rejected:** keep stamping logic per client — one behavior, N copies; the
  envelope-decode fix path becomes "regenerate the fleet" instead of "release
  core", and the copies drift the moment one client regenerates on a newer
  engine.
- **Rejected:** hoist the error classes and `*Error` type unions too — those
  are identity and type-level data (per-vendor tags, docs, honest channel
  composition), not behavior; abstracting them buys nothing at runtime.
- **Rejected:** full layer-factory hoist (`makeClientLayer(Service, …)`) —
  heavy generics over `Context.Service` identity with zero behavior moved.
- **Rejected:** core-owned vitest consistency suite — vitest has no place in
  core's published runtime surface. Instead core ships a *pure* checker
  returning violation strings and the emitted test keeps its no-zero-tests
  anchor with a single `expect(...).toEqual([])`.

Consequences: emitted `client.ts` shrinks ~80 lines per client; envelope and
failure semantics live once, pinned by core unit tests including the edge
cases the inline code silently carried (lazy field-scan short-circuit,
prototype-named envelope fields); `@generated` banner fix paths retargeted
(`credentials assembly → core`, envelope decode / failure wrapping named on
the core line).
