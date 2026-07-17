import { expect, test } from "vitest";
import { packageName } from "../src/index.ts";

test("packageName is the package's own name", () => {
  expect(packageName).toBe("@hourglass-financial/api-factory-core");
});
