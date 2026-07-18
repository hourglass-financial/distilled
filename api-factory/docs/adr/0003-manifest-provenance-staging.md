# MANIFEST provenance carries engineVersion only until #48; JSON files ship bannerless

The emitted `MANIFEST` is `{ generator, provenance, files }` with sorted
`sha256-<hex>` entries over final post-format bytes, not listing itself.
Until the frontend exists, `provenance` is `{ engineVersion }` alone —
`specHash`/`configHash` join in
[#48](https://github.com/hourglass-financial/distilled/issues/48) when a
real attested snapshot and vendor config supply them. Known coupling,
accepted deliberately: a `packages/codegen` version bump changes every
committed client MANIFEST; the bump commit regenerates them and the regen
gate enforces it. Relatedly, the `@generated` banner rule (#27 gate 5) is
scoped to files whose format admits comments (all emitted `.ts`); the JSON
scaffold (package.json, tsconfigs) and MANIFEST ship bannerless, matching
the design-approved exemplar
([#43](https://github.com/hourglass-financial/distilled/pull/43)) —
they are protected by tree-level ownership and the MANIFEST hashes.

- **Rejected:** an `irHash` provenance field pre-#48 — the IR is ephemeral
  (#27 L3); fingerprinting its serialization into a committed machine-owned
  artifact means any IR field rename churns clients without any semantic
  change.
- **Rejected:** fabricating spec/config hash slots (null/placeholder) now —
  a provenance field that attests nothing trains readers to ignore
  provenance.
- **Rejected:** JSON-safe generated markers (a `"//"` or `"$generated"`
  key) in package.json/tsconfigs — nonstandard keys leak into tooling, and
  the #43-approved exemplar already settled the bannerless shape.
