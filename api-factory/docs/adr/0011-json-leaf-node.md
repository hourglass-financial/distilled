# A `json` IR leaf for arbitrary-JSON record values

The closed IR (#31) deliberately has no passthrough node — the fail-open hole
behind v1's union-collapse incident. WorkOS's spec carries a dozen record
values whose schema is the *empty schema* (`additionalProperties: {}` /
`true`): Directory Sync `raw_attributes`/`custom_attributes`, audit-log
metadata JSON-Schema fragments. The vendor contract for those values is
genuinely "any JSON"; typing them narrower is a wire lie and pruning them
drops real fields.

Decided (ticket #50): a closed `json` leaf node, mapped from EXACTLY the
immediate construct `additionalProperties: true | {}` (a dedicated
`mapObject` branch — a bare empty schema anywhere else stays fatal), emitted
as `Schema.Json` (identity-decodes the recursive JSON domain; rejects
non-JSON prototypes including `Redacted`, pinned by a request-encode
negative). The IR invariant `json.record-value-only` enforces the position at
decode time, so raw `--ir` inputs are equally policed and `json` can never
become a union member or a fallback for unmapped constructs. The
no-passthrough ban's intent is preserved: `{}` is an explicit attested
construct being faithfully imaged, not a collapse target — and a future
vendor's sloppy `{}` stays visible as `json` in IR and regen diffs, ready to
be patched narrower with evidence.

- **Rejected:** string-valued record types for these fields — a wire-contract
  lie (the canonical v1 sin, in miniature).
- **Rejected:** spec-pruning the fields — discards real wire data consumers
  need (raw IdP attributes are Directory Sync's payload).
- **Rejected:** a config-gated pointer allowlist for the mapping — duplicates
  the snapshot as vendor policy; the construct is explicit spec fact, and
  honest mapping of the exact construct is already fail-closed.
- **Rejected:** `Schema.Unknown`/`Schema.Any` emission — admits non-JSON
  transport values (`undefined`, functions, cycles, `Redacted`) and would
  silently serialize a nested `Redacted` as a placeholder instead of failing.
