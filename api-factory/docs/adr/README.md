# Architecture decision records

Decision records for the api-factory context. Numbered `0001-slug.md`,
`0002-slug.md`, …; scan for the highest number and increment. Scope is this
workspace only — v1 (`packages/*` at the repo root) has no ADR directory and
follows the fork process instead.

## When to write one

All three must be true:

1. **Hard to reverse** — changing your mind later costs something real.
2. **Surprising without context** — a future reader would wonder "why on
   earth did they do it this way?"
3. **A real trade-off** — genuine alternatives existed and one was picked for
   specific reasons.

If any leg is missing, skip it. Deliberate deviations from the obvious path
and explicit no-s ("we do not do X") are prime candidates — they stop the
next agent from "fixing" something deliberate.

## Template

```md
# {Short title of the decision}

{1–3 sentences: context, what was decided, why.}

- **Rejected:** {alternative} — {why not}.
```

An ADR can be a single paragraph, but the house style — set by `DECISIONS.md`
and the map's grilling resolutions — is to record the rejected alternatives
with reasons. A rejection recorded is a relitigation prevented. Optional
extras only when they earn their place: `Status` frontmatter
(`proposed | accepted | deprecated | superseded by ADR-NNNN`), a
`Consequences` note for non-obvious downstream effects.

## Relationship to the other records

- **Ticket resolutions** (wayfinder map
  [#20](https://github.com/hourglass-financial/distilled/issues/20)) are the
  deliberation record. The founding decisions —
  [#26](https://github.com/hourglass-financial/distilled/issues/26) layout and
  naming, [#27](https://github.com/hourglass-financial/distilled/issues/27)
  determinism boundary and ownership classes,
  [#28](https://github.com/hourglass-financial/distilled/issues/28) exemplar,
  [#29](https://github.com/hourglass-financial/distilled/issues/29) patch
  system, [#30](https://github.com/hourglass-financial/distilled/issues/30)
  testing contract,
  [#31](https://github.com/hourglass-financial/distilled/issues/31) codegen
  architecture — are encoded operationally in `AGENTS.md` and are **not**
  backfilled here.
- Going forward: an implementation-time decision meeting the bar gets an ADR.
  A ticket-resolved decision gets a short ADR citing the ticket only when it
  carries a constraint code readers will trip over that `AGENTS.md` doesn't
  already encode.
- **`../../DECISIONS.md`** is the exemplar fragment's design record; it
  predates this convention and stays as-is.
- **`../../CONTEXT.md`** is vocabulary, not decisions. If an ADR coins a
  term, define it there.
