# Canonical order: the precise sorted/preserved split, and aligning the exemplar

[#31 §6](https://github.com/hourglass-financial/distilled/issues/31) says
"canonical sort everywhere"; implementing the engine (ticket
[#47](https://github.com/hourglass-financial/distilled/issues/47)) forced the
precise enumeration, and where the shipped exemplar's hand-authored order
disagreed with the rule, the exemplar was realigned — by running the engine
over it and auditing the diff — rather than the rule bent per-vendor.

Sorted by `canonicalize()` (UTF-16 code-unit comparison; `localeCompare`
banned as locale-dependent): resources and resource files; ops within a
resource by method name; named-schema declarations by group, then
topologically with alphabetical tie-break within a group; per-op error
tuples by class name (strict and flat); code-error class declarations by
wire code (an invariant asserts code order and class-name order agree
rather than picking one); registry entries; MANIFEST file keys.

Order-preserving from the IR (never sorted): struct fields, literal-enum
members, union members, path/query parameter lists, the
Unknown/Transport/Decode wrapper trio, envelope field-precedence lists,
pagination `clear` lists. These carry wire or precedence semantics; sorting
them would change meaning or churn every regen against vendor reality.

Import order is engine-owned: oxfmt 0.36.0's `experimental_sort_imports`
was verified a no-op, so the ImportCollector renders deterministically —
external specifiers then relative, each group sorted by module specifier
(code-unit); members within a statement case-insensitively by imported
symbol name, code-unit tiebreak. The case-insensitive member rule is a
scoped refinement of the code-unit default, matching the exemplar's
dominant hand convention.

The alignment commit reordered three exemplar files (organizations op
blocks, schemas declarations, the authenticate errors tuple — pure moves,
line multisets identical), realigned the few off-rule import lines, and
added the mandated `src/registry.ts`
([#30 d5](https://github.com/hourglass-financial/distilled/issues/30)) and
`MANIFEST` ([#27](https://github.com/hourglass-financial/distilled/issues/27)).
Error-tuple order was verified semantically inert first (core's matcher
uses tuple membership only, never position).

- **Rejected:** encoding the exemplar's two-tier error-tuple order
  (code classes then status classes) as the rule — #31's literal "by class
  name" is simpler and the tuple is typing-only; the exemplar was the
  deviation.
- **Rejected:** IR-carried declaration order with no canonical rule —
  reintroduces spec-order instability (#31 §6's rejected alternative) one
  layer up.
- **Rejected:** pure code-unit member sort inside import statements —
  diverges from nearly every hand-written import in the reviewed exemplar;
  case-insensitive matches it everywhere but one line.
