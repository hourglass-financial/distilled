/** Fixture probe spec — exercises the CLI's spec-loading path. */
import { defineProbe } from "../../../src/probe.ts";

export default defineProbe({
  id: "fixture-probe",
  title: "fixture probe for CLI tests",
  request: { method: "GET", pathTemplate: "/status" },
});
