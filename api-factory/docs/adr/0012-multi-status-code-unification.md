# Multi-status error codes unify when their effective prose agrees

The error lifter originally hard-errored (`openapi.error.code-conflict`) when
one discriminator code appeared in tables at two HTTP statuses. WorkOS does
this seven times over (`invalid_email` at 400 and 422, `invalid_request_parameters`
across six tables, `organization_selection_required` at 403 and 409, …), and
it is not a contradictory fact: the class models the *code*, the matcher
matches code before status, and `docsStatus` is documentation. Decided
(ticket #50): a code lifted at multiple statuses unifies when every
occurrence's **effective prose** agrees (the `errors.codeProse` override when
present, else the member description), taking `docsStatus` from the lowest
status — deterministic, and it preserves the shipped exemplar's
`organization_selection_required` at 403 against its 409 duplicate. Divergent
effective prose still hard-errors under the original rule name.

- **Rejected:** patching one occurrence away per code — removes the code from
  that operation's declared tuple, so a genuine wire occurrence would fall to
  the `Unknown*` fallback: strictly less honest than unification.
- **Rejected:** per-status class variants (`InvalidEmail400`/`InvalidEmail422`)
  — the discriminator is the code; consumers match on it, and the global
  code→class map (a per-vendor invariant since the exemplar) cannot hold two
  classes for one code.
- **Rejected:** keeping the hard error and demanding a config override per
  code — an override could only restate "these are the same code", adding
  ceremony without information.
