/**
 * Probe: the live 200 response shape of `GET /organizations/{id}` — the
 * response-shape-drift evidence class (#59). `setup` creates a throwaway
 * organization through the *typed client* (torn down after the capture,
 * even on failure); the observation itself goes through `rawRequest`,
 * pre-decode, so the captured body is the wire's answer and not our schema's
 * reading of it. The created id is normalized to `<orgId>` in the evidence.
 *
 * Run from `vendors/workos/`:
 *
 * ```
 * bun run probe organizations-get-ok
 * ```
 */
// Probe specs run under `bun` (no vitest), so they import the vitest-free
// subpath — never the harness barrel.
import {
  defineProbe,
  resource,
  resourceName,
} from "@hourglass-financial/api-factory-harness/probe";
import {
  layerFromEnv,
  organizations,
} from "@hourglass-financial/api-factory-workos";
import * as Effect from "effect/Effect";

export default defineProbe({
  id: "organizations-get-ok",
  title: "200 response shape for GET /organizations/{id}",
  setup: Effect.gen(function* () {
    const org = yield* resource(
      organizations.create({
        name: resourceName("workos", "probe-org-get"),
      }),
      (created) => organizations.delete({ id: created.id }),
    );
    return { orgId: org.id };
  }).pipe(Effect.provide(layerFromEnv)),
  request: ({ orgId }) => ({
    method: "GET",
    pathTemplate: "/organizations/{id}",
    pathParams: { id: orgId },
  }),
});
