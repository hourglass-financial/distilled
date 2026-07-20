import { describe, expect, it } from "vitest";
import * as Harness from "../src/index.ts";

describe("harness barrel", () => {
  it("exposes the vendor-suite surface", () => {
    expect(typeof Harness.contractTest).toBe("function");
    expect(typeof Harness.makeLiveTest).toBe("function");
    expect(typeof Harness.resource).toBe("function");
    expect(typeof Harness.eventually).toBe("function");
    expect(typeof Harness.defineEnv).toBe("function");
    expect(typeof Harness.resourceName).toBe("function");
    expect(typeof Harness.uniqueEmail).toBe("function");
    expect(Harness.testRunId).toMatch(/^[0-9a-f]{8}$/);
    expect(Harness.LIVE_TIMEOUT).toBe(30_000);
    expect(typeof Harness.auditCoverage).toBe("function");
    expect(typeof Harness.coverageSuite).toBe("function");
    expect(typeof Harness.crossCheckTested).toBe("function");
    expect(typeof Harness.HarnessCoverageReporter).toBe("function");
    expect(typeof Harness.defineProbe).toBe("function");
    expect(typeof Harness.runProbe).toBe("function");
  });
});
