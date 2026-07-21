/**
 * Run-unique naming for live test resources (#30, decision 7).
 *
 * Every resource created against a real API embeds {@link testRunId} so
 * parallel runs — two agents, a local run racing CI, retried workflows —
 * never collide on names and never delete each other's fixtures. A bare
 * deterministic name is never acceptable in a live test.
 */

/**
 * Per-process 8-hex run id. Generated once per process so every name minted
 * in one run shares it — a leaked resource is attributable to its run.
 */
export const testRunId: string = crypto
  .randomUUID()
  .replace(/-/g, "")
  .slice(0, 8);

/**
 * The one canonical resource-name shape: `distilled-af-{vendor}-{name}-{testRunId}`.
 *
 * @example
 * ```ts
 * resourceName("workos", "orgs-crud") // "distilled-af-workos-orgs-crud-3fa9c81d"
 * ```
 */
export const resourceName = (vendor: string, name: string): string =>
  `distilled-af-${vendor}-${name}-${testRunId}`;

let emailCounter = 0;

/**
 * A unique-per-call email for live tests. WorkOS-class APIs rate-limit
 * per email address (3–10/min), so reusing one address across tests trips
 * limits that have nothing to do with the behavior under test. Unique per
 * process (run id) and per call (counter).
 */
export const uniqueEmail = (label = "user"): string =>
  `${label}-${testRunId}-${emailCounter++}@example.com`;
