# Vendor input tree: JSON everywhere, one patch entry per file, three provenance hashes

The `vendors/<vendor>/` input tree (#48) is `spec.json` + `spec.provenance.json`
(machine-locked, written only by the acquisition command; YAML sources are
mechanically converted to JSON at acquisition so patches always target JSON
Pointers), `config.json` (the vendor config, validated by the engine's
Effect Schema), and `patches/NNN-<slug>.patch.json` — exactly one entry per
file, applied in code-unit filename order, with the entry `id` required to
equal the basename. Vendor config and patches are JSON, not TypeScript
modules, for the same reason ADR-0002 fixed IR JSON as the CLI interchange:
the CLI never imports vendor-supplied code. MANIFEST provenance gains
**three** hashes, not ADR-0003's reserved two: `specHash` (snapshot bytes,
tying the MANIFEST to the attestation record), `configHash` (config bytes),
and `patchesHash` (a combined digest over the sorted patch files) — patches
are a generation input, and folding them into `configHash` would blur #29's
patches-vs-config split while omitting them would leave a silent input out
of the provenance chain.

- **Rejected:** TypeScript modules for vendor config (compile-time checking,
  comments) — a `--vendor` invocation would execute vendor-tree code; the
  Effect Schema's fail-closed decode delivers the checking without the
  execution surface.
- **Rejected:** one `patches.json` carrying an entry array — a single file
  turns every patch into a merge conflict, and per-entry files make the
  survey's rule 3 (one observed failure per entry) physical.
- **Rejected:** folding patches into `configHash` — keeps ADR-0003's field
  list intact but mixes two ownership stories (#29 split patches from
  config deliberately) and makes "which input moved?" unanswerable from the
  MANIFEST.
- **Rejected:** keeping the snapshot in the vendor's native format (YAML) —
  patch pointers into YAML require a YAML-aware editing layer with its own
  serialization ambiguities; one mechanical conversion at acquisition keeps
  every downstream consumer JSON-only.

Related: the patch classifier's five-way vocabulary
(`still_needed / redundant / stale / conflict / unsupported`) and the
strict-vs-reconcile application split are #29's decisions; this ADR only
fixes their file-format carrier.
