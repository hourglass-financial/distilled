/** Fixture probe with a declared env param — exercises CLI param plumbing. */
import { defineProbe } from "../../../src/probe.ts";

export default defineProbe({
  id: "fixture-probe-params",
  title: "fixture probe with a seeded param for CLI tests",
  envParams: { flagId: "FIXTURE_FLAG_ID" },
  request: (params) => ({
    method: "GET",
    pathTemplate: "/flags/{id}",
    pathParams: { id: params.flagId },
  }),
});
