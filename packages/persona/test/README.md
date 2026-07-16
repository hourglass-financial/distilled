# Persona sandbox tests

These tests call Persona's real sandbox API. They are intentionally local-only
and run serially so each test can own and clean up its resources deterministically.

There is exactly one `test/<operation>.test.ts` file for each generated Persona
operation. Every file exposes one coverage marker:

- `live-lifecycle` creates or changes only test-owned resources and cleans them up
- `live-data` decodes a successful response from stable sandbox data
- `live-envelope` decodes a successful collection that may be empty
- `error-only` exercises a typed failure but still needs a safe success fixture
- `fixture-dependent` names the provider-owned template or workflow prerequisite
- `environment-dependent` names the missing entitlement or external configuration
- `infeasible` records why local API automation cannot safely cover the operation

`coverage.test.ts` fails if generated operations and operation test files drift,
if a marker disagrees with the inventory, or if a successful test does not call
its own generated operation. Pending scenarios remain visible as `it.todo` in
the corresponding operation file rather than disappearing into a summary test.

Set the shared sandbox credential and the dedicated inquiry fixture before
running the suite:

```sh
export PERSONA_API_KEY=...
export PERSONA_INQUIRY_TEMPLATE_ID=...
export PERSONA_INQUIRY_FIELD_NAME=...
bun run test:live
```

The inquiry template must be active and the configured field must be a writable
string field. The suite fails rather than skipping when a credential or fixture
is missing. Each live operation file prints an eight-character run ID before
its first request; all resources created by that file contain the same value.

If a process is interrupted before finalizers run, preview exact matches for the
printed run ID:

```sh
bun run test:cleanup -- --run-id 0123abcd
```

The preview prints a confirmation token. Cleanup executes only when both
`--execute` and that exact token are supplied. Never use the sandbox-wide nuke
script as a test cleanup substitute.
