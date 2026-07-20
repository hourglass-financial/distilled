# api-factory

The v2 API-client-factory context: deterministic codegen from attested vendor
specs into Effect-native clients with exhaustive error typing. This glossary
is the vocabulary every v2 doc, ticket, and identifier uses — glossary only,
no implementation details, no decisions (those live in `AGENTS.md`,
`docs/adr/`, and the map tickets).

## Language

### Ownership and layers

**Machine-owned**:
The ownership class of artifacts *reproduced* by deterministic generation;
the only legitimate change is regeneration.
_Avoid_: generated (as a class name), read-only

**Machine-locked**:
The ownership class of artifacts *attested* by hash — written only by the
acquisition command, because reproduction is impossible.
_Avoid_: frozen, vendored, immutable

**Agent-writable**:
The ownership class of artifacts changed by hand — agent or human alike —
under normal review. There is no separate human-owned class.
_Avoid_: hand-written (as a class name), human-owned, editable

**Layer**:
One of the seven per-vendor stages L0–L6, from acquisition to tests. Each
layer's artifact has exactly one ownership class.

**Machinery**:
The hand-written packages the factory and its clients run on: `core`,
`codegen`, `harness`, and any per-vendor plugin package. Per-vendor logic is
machinery; it never lives in a client.
_Avoid_: helpers, shared code, lib

**Client**:
A machine-owned generated SDK package under `clients/` — every file, tests
and `MANIFEST` included.
_Avoid_: wrapper, output package

**Vendor**:
The third-party API provider a client is generated for. Its inputs (snapshot,
patches, config, probes, evidence) and its tests live under `vendors/<name>`.

**Allowed-edit set**:
The per-task list of paths a Smithers workflow task may modify — where
human-vs-agent policy lives, as opposed to the repo's ownership classes.

### Acquisition and patching

**Snapshot**:
The checked-in copy of a vendor's spec, written only by the acquisition
command and pinned by its provenance record.
_Avoid_: the spec (ambiguous with the vendor's live document)

**Provenance record**:
The attestation data accompanying a snapshot: source URL, upstream tag/sha,
fetch date, content hash.

**Attestation**:
The audit that verifies a snapshot's hash against its provenance record —
how "fix the spec in place" is made to fail.

**Document patch**:
A spec-fact correction targeting the attested snapshot, expressed as a typed
patch kind at exact JSON Pointers. Carries spec facts only — never wire
behavior.
_Avoid_: overlay, spec fix, spec edit

**Patch kind**:
A member of the closed vocabulary of intent-revealing patch operations
(error-response injection, spec-pruning, sensitive-marking, …) that lower to
deterministic JSON edits. Raw RFC 6902 is the policed escape hatch, not a
kind.

**Precondition**:
A patch entry's mandatory `test`-style guard against the snapshot, so
upstream adopting the fix forces reconciliation instead of silent
double-application.

**Blast radius**:
A patch entry's machine-checkable declaration of target role, affected
operations, and expected regenerated files — verified against the actual
regen diff in both directions.

**Evidence artifact**:
A sanitized capture checked in under `vendors/<v>/evidence/` backing a patch
entry's behavior claim.

**Reconciliation mode**:
The refresh-workflow-only patch-application mode: stale entries are collected
into a report that gates the PR instead of aborting generation.

### Codegen

**IR**:
The typed, fully-resolved operation model inside the codegen engine —
ephemeral, dumpable via `--emit-ir`, never a repo artifact. Carries final
public names, error tuples, retry dispositions, pagination projections.

**Vendor config**:
Declarative pure data under `vendors/<v>/`, validated by an engine-defined
schema: quirk-axis selections, naming overrides, wire-behavior facts. Never
code.
_Avoid_: hooks, plugin, generator options

**Engine capability**:
A reviewed, config-selectable behavior of the codegen engine — the only way a
provider quirk enters the pipeline.

**Fail-closed**:
The generator posture: a dropped operation, unrepresentable construct, or
non-applying patch entry is a hard error naming the construct — never a
logged skip with exit 0.
_Avoid_: strict mode

**Regen gate**:
Hermetic regeneration from `vendors/<v>/` byte-compared against the committed
client; any diff fails, naming files.

**MANIFEST**:
The generated file of client paths + content hashes; also the sole home of
generation provenance (spec hash, config hash, engine version).

**Exemplar**:
The gold-standard hand-authored WorkOS client fragment the emitter must
reproduce byte-for-byte — the emit target until real generation lands.
_Avoid_: prototype, sample

**Op registry**:
The generated `src/registry.ts` in each client: the canonical-sorted tuple
of qualified operation public names (`resource.method`; a pagination trio
is one entry). The credential-free bridge from client to coverage audit.
_Avoid_: operation list, op table

**Golden**:
A byte-frozen expected output tree for one synthetic codegen fixture,
compared both directions against a real emission. Regenerated only
explicitly, never by a gate.
_Avoid_: snapshot, baseline

### Classification

**Category**:
A member of the closed, core-owned error-classification vocabulary — the
coarse cross-vendor grouping an error class declares via its `Meta` constant,
each category carrying exactly one retry disposition. Admission is governed
by the criterion in ADR-0005.
_Avoid_: error kind, error family

**Code (error code)**:
The vendor's fine-grained discriminator, carried as a schema literal on the
error class — where vendor-specific semantics live when no category fits.
_Avoid_: error type (ambiguous with the class itself)

### Testing

**Coverage manifest**:
The hand-authored `vendors/<v>/tests/coverage.ts` mapping every operation to
a status per lane. No machinery ever writes it.

**Lane**:
One of the two independent coverage dimensions per operation: `contract`
(mock transport) and `live` (real API).

**Untestable**:
The live-lane-only steady-state status: this operation cannot be live-tested,
for a mandatory cited reason. Distinct from `skip`/`todo`, which are debt.

**Coverage audit**:
The deterministic check that the manifest matches the operation universe and
that `tested` claims are honest. It prints stubs and never writes; coverage
floors are workflow policy on top of its output.

**Test capability**:
A named out-of-band ingredient a live test needs (e.g. `authkit`,
`seeded-flag`), declared in the vendor's env schema and requested via
`needs`; missing capabilities produce precise, visible skips.
_Avoid_: tier

**Probe**:
A named, checked-in raw-request spec under `vendors/<v>/probes/`, runnable
individually, whose scrubbed capture backs patch evidence.

**testRunId**:
The per-process 8-hex random id embedded in every live resource name
(`distilled-af-{vendor}-{name}-{testRunId}`) so parallel runs never collide.
