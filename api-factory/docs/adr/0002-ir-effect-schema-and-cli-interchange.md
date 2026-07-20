# IR defined with Effect Schema; IR JSON as the CLI interchange until #48

The codegen IR (`packages/codegen/src/ir/`) is defined with Effect Schema:
the schema-AST node union is closed at both the type and decode level, and
every decode boundary passes `{ errors: "all", onExcessProperty: "error" }`
— an unknown node kind or a stray field is a hard error naming the path,
never a silent strip. `dumpIr` (canonicalize → encode → stable stringify)
is the `--emit-ir` artifact, and until the OpenAPI frontend lands
([#48](https://github.com/hourglass-financial/distilled/issues/48)) that
same JSON document is the CLI's input: `generate | --emit-ir | verify` all
take `--ir <file.json>`. #48 adds `--vendor` alongside without breaking
the surface. The emit toolchain dependency (`code-block-writer`) is
exact-pinned in the catalog — deliberate belt-and-suspenders beyond
lockfile scoping, since its output is byte-gated.

- **Rejected:** plain TypeScript interfaces + hand-rolled validation — the
  fail-closed posture (#27) would rest on hand-maintained checks exactly
  where v1's F1 union-collapse lived; Schema's closed decode makes the
  negative paths structural.
- **Rejected:** Effect runtime (Layers/Effect.gen) through the engine —
  emit must stay a pure `Ir → files` function; Schema is used for
  validation only.
- **Rejected:** TS-module fixtures as the CLI input format — dynamic
  import of arbitrary code from a CLI flag is a needless execution surface;
  JSON keeps `verify` hermetic and the dump/decode round-trip is already
  tested.
