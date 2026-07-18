import { join } from "node:path";
import { describe, it } from "vitest";
import { workosFixture } from "./fixtures/workos.ts";
import {
  emitToTemp,
  expectTreesEqual,
  packageRoot,
  removeTemp,
} from "./helpers.ts";

const workosRoot = join(packageRoot, "../../clients/workos");

describe("WorkOS exemplar", () => {
  it("emits the committed client tree byte-for-byte", () => {
    const actual = emitToTemp(workosFixture);
    try {
      expectTreesEqual(workosRoot, actual, {
        ignoredExpectedTopLevel: [
          ".turbo",
          "lib",
          "node_modules",
          "tsconfig.test.tsbuildinfo",
          "tsconfig.tsbuildinfo",
        ],
      });
    } finally {
      removeTemp(actual);
    }
  });
});
