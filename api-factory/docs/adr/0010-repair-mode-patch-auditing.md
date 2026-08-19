# Repair-mode patch auditing: cleared-violation sets when no baseline normalizes

The blast-radius gate (#29/#48) audits each patch entry by diffing clients
generated from the patch prefixes `[0,k)` and `[0,k]` — which requires every
prefix to normalize. Real onboarding inverts that: the raw WorkOS snapshot
carries hundreds of fail-closed violations, most entries exist to *repair*
them, and with more than one blocker no prefix normalizes until near the end.
Prefix-diff semantics is unsatisfiable for exactly the workload the patch
system was built for — the constraint #48 recorded when it shipped the audit.

Decided (ticket #50): the audit selects a mode per entry by baseline
normalizability. When `[0,k)` normalizes, the existing file/operation/
role-facet diff symmetry applies unchanged. When it does not, the entry is a
**repair entry**: its blast radius declares nonempty
`clears: [{rule, construct}]`, and the audit verifies that the violation
delta `violations([0,k)) \ violations([0,k])` equals the declaration as a
**multiset** — both directions, so an undeclared clearing and a
declared-but-not-cleared entry both fail. Violations *exposed* by a repair
(deeper constructs unmasked) are reported, not failed — they are later
entries' declared work, and full attribution holds by induction: each step's
delta equals its clears, and the final state must normalize regardless.
Anti-laundering comes from **target scoping**: every edit pointer in a repair
entry (typed-kind target or raw op path) must relate to a cleared construct —
pointer-prefix in either direction for path targets, reference attribution
(the diff-mode machinery) for component targets, with non-pointer IR-level
constructs exempt from scoping but still bound by the cleared-set equality.
Invariant-stage violations join the accounting exactly like normalizer
violations. `config.*` consistency rules are excluded from cleared-set
accounting on both sides — they describe config↔spec agreement, flap at
intermediate prefixes as components appear, and remain hard errors for the
final generate.

- **Rejected:** requiring every prefix to normalize (order patches so blockers
  fix first) — mathematically unsatisfiable with two independent blockers;
  the raw snapshot itself is the first non-normalizing baseline.
- **Rejected:** leave-one-out diffing (full set minus entry k) — removing a
  blocker breaks normalization the same way, and the semantics no longer
  compose into full attribution.
- **Rejected:** failing on exposed violations — would force every entry to
  enumerate the full transitive unmasking chain it cannot know; the final
  fail-closed generate already guarantees nothing exposed survives.
- **Rejected:** typed violation subcodes as identity (instead of
  {rule, construct} multisets) — over-engineering once target scoping closes
  the laundering hole; message-level swaps at one identity are immaterial
  because the final state still has to clear them.
- **Rejected:** prohibiting raw ops in repair entries — the census needs
  atomic multi-step repairs (extract + flatten as one cited bug) that the
  single-target typed kinds cannot express; target scoping polices raw
  equally. A typed `composite` kind is the recorded vocabulary follow-on.
