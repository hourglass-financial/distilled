# A probe is one pre-decode observation under a declared experimental context

Patch evidence usually needs world-state: 2xx response-shape drift needs a
resource to fetch, state-dependent errors (409/422) need the conflicting
state to exist, seeded-workspace behavior needs dashboard fixture ids. v1
probe specs were static data and could express none of it (#59). Decided:
a probe stays **exactly one raw request** — the observation, statically
readable in the spec, issued through core `rawRequest()` so the capture is
the wire's answer *before* any schema decodes it — while its
**experimental context** is declared alongside: `setup` (an Effect over
`resource()` + the vendor's typed client, run in the probe's own Scope so
teardown is LIFO, post-capture, and failure-safe) and `envParams`
(dashboard-seeded ids bound to env vars, never checked in, per #30 d9).
The observation is a pure template over the resolved params; param values
are normalized to `<name>` placeholders throughout the capture so a
recapture under fresh state diffs clean, and every param's provenance
(`setup` / `env:VAR` / `cli`) is recorded in the evidence.

The asymmetry is the point: **setup may use the typed client, the
observation may not.** Setup's job is state, and the typed client is the
safest way to make state; the observation's job is evidence about the wire,
and anything post-decode has already been shaped by the very schemas a
patch might be correcting.

- **Rejected:** full-code probes (a probe is an arbitrary Effect) — the
  reviewable, diffable, statically readable request is what makes a capture
  citable evidence; code probes collapse back into "whatever the test did".
- **Rejected:** sourcing evidence from live-test observations — test
  observations are post-decode by construction; wire evidence must be
  pre-decode. (Corollary kept: setup *via* the typed client is fine.)
- **Rejected:** hard-coding seeded fixture ids in specs — #30 d9 forbids
  workspace dashboard state in the repo; `envParams` + placeholder
  normalization keep such ids out of both specs and captures.
- **Rejected:** `effect-http-recorder` in lieu of the capture machinery
  (evaluated at 0.3.0 on suggestion) — a real Effect-4 record/replay VCR,
  but it exact-pins peer `effect@4.0.0-beta.83` against our catalog's
  `4.0.0-beta.98` (#40 makes the catalog pin the peer contract, and
  `unstable/http` churns between betas), hard-depends on
  `@effect/platform-node-shared@beta.83` (the dual-copy hazard), and sits at
  the wrong seam: an `HttpClient`-middleware cassette records every request
  that flows (setup's typed-client calls included) for *replay matching*,
  not one deliberate observation with citation provenance. Revisit only as
  a contract-lane record/replay candidate, and only if it tracks our pin.
- **Rejected:** multi-observation probes — a rate-limit preamble or a
  duplicate-create is context, so it belongs in `setup`; the final request
  is the probe. One observation per capture keeps evidence atomic.
