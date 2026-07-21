/**
 * Probe: what does WorkOS actually send for a GET on a missing organization?
 * The 404 envelope (shape, `code` discriminator) is the evidence a patch
 * entry cites when the spec disagrees with the wire.
 *
 * Run from `vendors/workos/`:
 *
 * ```
 * bun run probe organizations-get-missing
 * ```
 */
// Probe specs run under `bun` (no vitest), so they import the vitest-free
// subpath — never the harness barrel.
import { defineProbe } from "@hourglass-financial/api-factory-harness/probe";

export default defineProbe({
  id: "organizations-get-missing",
  title: "404 error envelope for a missing organization",
  request: {
    method: "GET",
    pathTemplate: "/organizations/{id}",
    pathParams: { id: "org_distilled_af_probe_missing" },
  },
});
