# Error categories: admission criterion and the vendor-specificity boundary

[#55](https://github.com/hourglass-financial/distilled/issues/55) resolved
what earns a seat in core's closed error-classification vocabulary
(`packages/core/src/category.ts` — the `Category` union and `Meta`
constants). A category is admitted only when **both** hold:

1. **Evidence** — its semantics are protocol-grounded (fixed by HTTP/wire
   semantics: `not-found`, `throttling`, `server`) **or** documented in ≥2
   vendors' error surfaces (spec-declared codes, or attested probe evidence
   under `vendors/<v>/evidence/`).
2. **Contract** — it carries a distinct cross-vendor handling contract:
   exactly one honest retry disposition, plus a programmatic recourse no
   existing category already provides.

Anything failing either leg stays vendor-specific on the code-discriminated
error class (the `code` literal is the design's fine-grained layer) and maps
to the nearest coarse category. Admission is a reviewed edit to `category.ts`
citing the evidence; since codegen derives its meta vocabulary from `Meta`
([PR #54](https://github.com/hourglass-financial/distilled/pull/54)), a
vocabulary change is that one edit plus the sanctioned engine regen of every
client. The category↔retry pairing is **fixed**: needing an exotic
`{category, retry}` pairing means the category is wrong — propose a
vocabulary change, never a per-class override.

Verdicts adjudicated under the criterion (full evidence in the
[#55 resolution](https://github.com/hourglass-financial/distilled/issues/55)):
`challenge` keeps its seat — WorkOS (5 spec-verified codes), Coinbase
(`MfaRequired` family), Stripe (`authentication_required` card code);
contract: `retry: none` yet *resumable after an out-of-band human step*,
distinct from `auth` where the credential itself is wrong. `quota` keeps its
seat — AWS (`ServiceQuotaExceededException` across ~30 services), Coinbase,
Supabase, GCP, Cloudflare; contract: `retry: none` with recourse
raise-the-cap, distinct from `throttling`'s backoff-retry — a split v1
already engineered deliberately (quota excluded from transient retry).

- **Rejected:** vendor-extensible categories (registry or module
  augmentation) — fractures `hasCategory`'s cross-client uniformity and
  walks back toward v1's prototype-mutation registry; the mirror of
  [#31 §5](https://github.com/hourglass-financial/distilled/issues/31)'s
  closed-config rule (an inexpressible quirk forces a reviewed core
  capability, never a hook).
- **Rejected:** evidence-only admission (the #55 candidate as drafted) — the
  fleet already shows a two-vendor "entitlement" family (Cloudflare
  `NotEntitled`/`PlanLevelNotAllowed`/`SettingUnavailableForPlan`, Erebor
  `FeatureNotEnabled`); without the contract leg, two-vendor coincidences
  keep minting vendor-shaped seats.
- **Rejected:** strictly protocol-grounded — folding `quota` into
  `throttling` retry-storms against a hard cap; folding `challenge` into
  `auth` re-creates v1 WorkOS's collapse, where `matchError` discarded the
  discriminating code and MFA/verification 403s became bare `Forbidden`.
- **Rejected:** exercised-only (lazy) admission — drops `quota` until a v2
  client needs it; churns the vocabulary and blocks
  [#48](https://github.com/hourglass-financial/distilled/issues/48) vendor
  config from pre-declaring quota mappings for migrations when the fleet
  evidence is already in-house.
- **Rejected:** keeping the exotic-pairing escape hatch in `Meta`'s
  docstring — generated clients can only reference `Meta` constants anyway
  (post-#54); the hatch invited hand machinery to fork a category's retry
  contract.
