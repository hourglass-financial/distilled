# Coverage claims travel in test titles, and only harness gating excuses them

Implementing #30's decision 5 (the reporter that verifies `tested` manifest
claims against what actually ran) requires a channel from each test to the
run-end reporter that survives vitest's worker aggregation. Decided: the
claim is an **op stamp** appended to the test title —
`[contract:organizations.create]` / `[live:organizations.create]`, written by
`contractTest`/`makeLiveTest` and parsed back by `HarnessCoverageReporter`.
A harness-issued gated skip additionally carries `[gated: …]` naming the
missing credential or capability, and that marker is the *only* thing that
excuses an unexercised `tested` claim: a stamped test skipped any other way
(hand-`it.skip`, `.only` elsewhere) fails the run as dishonest, and a claim
with no stamped test at all is stale. The stamp grammar is a cross-cutting
contract — vendor suites emit it, the reporter and future workflow gates
parse it — so changing it later means migrating every suite at once.

- **Rejected:** vitest `task.meta` / annotations — serialized across workers
  only for reporter APIs that opt in, invisible in human-readable run output,
  and coupled to vitest internals; titles are already the artifact every
  reporter, human, and CI log sees.
- **Rejected:** a side-channel registry file written during the run — a
  second write path with worker-merge races, and it reintroduces exactly the
  "machinery writes coverage facts" ambiguity #30 decision 3 forbids.
- **Rejected:** excusing any skipped stamped test — a hand-disabled test
  would silently keep certifying its op; the gated marker keeps "environment
  cannot run this" mechanically distinguishable from "someone turned it off".
- **Rejected:** encoding the needed capability in a structured stamp
  (`[live:key@authkit]`) — the reporter only needs gated-vs-not; capability
  names already appear in the human-readable gate reason, and a richer
  grammar is more surface to keep stable.
